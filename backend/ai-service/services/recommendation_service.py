"""
Recommendation Service - Personalized course recommendations
Uses embeddings and user activity for similarity-based recommendations
"""

from typing import List, Dict, Optional
import numpy as np
from datetime import datetime, timedelta

from config.database import get_mongodb, get_redis
from config.settings import settings
from services.openai_service import create_embedding, create_embeddings_batch


class RecommendationService:
    def __init__(self):
        self.cache_prefix = "rec:"
    
    async def log_user_activity(
        self,
        user_id: str,
        event_type: str,
        metadata: Dict = None
    ) -> None:
        """
        Log user activity for recommendation analysis
        """
        db = get_mongodb()
        await db.activity_events.insert_one({
            "userId": user_id,
            "eventType": event_type,
            "metadata": metadata or {},
            "createdAt": datetime.utcnow()
        })
    
    async def generate_user_embedding(self, user_id: str) -> List[float]:
        """
        Generate an embedding representing user's learning interests
        based on their activity history
        """
        db = get_mongodb()
        redis = get_redis()
        
        # Check cache
        cache_key = f"{self.cache_prefix}user_emb:{user_id}"
        cached = await redis.get(cache_key)
        if cached:
            return [float(x) for x in cached.split(",")]
        
        # Get user's recent activities
        activities = await db.activity_events.find({
            "userId": user_id,
            "eventType": {"$in": ["lesson_completed", "course_enrolled", "search"]}
        }).sort("createdAt", -1).limit(50).to_list(50)
        
        if not activities:
            return []
        
        # Build activity description for embedding
        descriptions = []
        for activity in activities:
            meta = activity.get("metadata", {})
            if activity["eventType"] == "lesson_completed":
                descriptions.append(f"completed lesson: {meta.get('lessonTitle', '')}")
            elif activity["eventType"] == "course_enrolled":
                descriptions.append(f"enrolled in: {meta.get('courseTitle', '')}")
            elif activity["eventType"] == "search":
                descriptions.append(f"searched for: {meta.get('query', '')}")
        
        # Generate embedding from combined activity
        combined_description = ". ".join(descriptions[:20])
        embedding = await create_embedding(combined_description)
        
        # Cache for 1 hour
        await redis.setex(
            cache_key,
            3600,
            ",".join(map(str, embedding))
        )
        
        return embedding
    
    async def find_similar_users(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict]:
        """
        Find users with similar learning patterns
        """
        db = get_mongodb()
        
        user_embedding = await self.generate_user_embedding(user_id)
        if not user_embedding:
            return []
        
        # Get other users' embeddings and calculate similarity
        # In production, use a vector database for efficiency
        all_users = await db.user_embeddings.find({
            "userId": {"$ne": user_id}
        }).limit(100).to_list(100)
        
        similarities = []
        for user in all_users:
            other_embedding = user.get("embedding", [])
            if other_embedding:
                similarity = self._cosine_similarity(user_embedding, other_embedding)
                if similarity > settings.SIMILARITY_THRESHOLD:
                    similarities.append({
                        "userId": user["userId"],
                        "similarity": similarity
                    })
        
        # Sort by similarity and return top matches
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        return similarities[:limit]
    
    async def recommend_next_course(
        self,
        user_id: str,
        limit: int = 5
    ) -> List[Dict]:
        """
        Recommend courses based on:
        1. User's learning history
        2. Similar users' preferences
        3. Course relevance to user interests
        """
        db = get_mongodb()
        redis = get_redis()
        
        # Check cache
        cache_key = f"{self.cache_prefix}courses:{user_id}"
        cached = await redis.get(cache_key)
        if cached:
            import json
            return json.loads(cached)
        
        recommendations = []
        
        # Get user's enrolled courses to exclude
        enrolled = await db.activity_events.find({
            "userId": user_id,
            "eventType": "course_enrolled"
        }).to_list(100)
        enrolled_ids = [e.get("metadata", {}).get("courseId") for e in enrolled]
        
        # Strategy 1: Content-based - courses similar to completed ones
        completed_courses = await db.activity_events.find({
            "userId": user_id,
            "eventType": "course_completed"
        }).sort("createdAt", -1).limit(5).to_list(5)
        
        if completed_courses:
            for course in completed_courses:
                course_id = course.get("metadata", {}).get("courseId")
                if course_id:
                    similar = await self._find_similar_courses(course_id, limit=3)
                    for s in similar:
                        if s["courseId"] not in enrolled_ids:
                            s["reason"] = "Similar to courses you've completed"
                            recommendations.append(s)
        
        # Strategy 2: Collaborative - courses popular with similar users
        similar_users = await self.find_similar_users(user_id, limit=5)
        for similar_user in similar_users:
            user_courses = await db.activity_events.find({
                "userId": similar_user["userId"],
                "eventType": "course_completed"
            }).limit(5).to_list(5)
            
            for course in user_courses:
                course_id = course.get("metadata", {}).get("courseId")
                if course_id and course_id not in enrolled_ids:
                    recommendations.append({
                        "courseId": course_id,
                        "score": similar_user["similarity"],
                        "reason": "Popular with learners like you"
                    })
        
        # Deduplicate and sort by score
        seen = set()
        unique_recs = []
        for rec in recommendations:
            if rec["courseId"] not in seen:
                seen.add(rec["courseId"])
                unique_recs.append(rec)
        
        unique_recs.sort(key=lambda x: x.get("score", 0), reverse=True)
        final_recs = unique_recs[:limit]
        
        # Cache for 30 minutes
        import json
        await redis.setex(cache_key, 1800, json.dumps(final_recs))
        
        return final_recs
    
    async def _find_similar_courses(
        self,
        course_id: str,
        limit: int = 5
    ) -> List[Dict]:
        """
        Find courses similar to a given course
        """
        db = get_mongodb()
        
        # Get course embedding
        course = await db.course_embeddings.find_one({"courseId": course_id})
        if not course or "embedding" not in course:
            return []
        
        # Find similar courses
        all_courses = await db.course_embeddings.find({
            "courseId": {"$ne": course_id}
        }).limit(50).to_list(50)
        
        similarities = []
        for other in all_courses:
            if "embedding" in other:
                similarity = self._cosine_similarity(
                    course["embedding"],
                    other["embedding"]
                )
                similarities.append({
                    "courseId": other["courseId"],
                    "score": similarity
                })
        
        similarities.sort(key=lambda x: x["score"], reverse=True)
        return similarities[:limit]
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        a = np.array(vec1)
        b = np.array(vec2)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
    
    async def index_course_content(self, course_id: str, content: str) -> None:
        """
        Generate and store embedding for course content
        """
        db = get_mongodb()
        embedding = await create_embedding(content[:8000])  # Limit content length
        
        await db.course_embeddings.update_one(
            {"courseId": course_id},
            {"$set": {
                "courseId": course_id,
                "embedding": embedding,
                "updatedAt": datetime.utcnow()
            }},
            upsert=True
        )


# Singleton instance
recommendation_service = RecommendationService()
