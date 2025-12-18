"""
Recommendations Router - API endpoints for course recommendations
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional

from services.recommendation_service import recommendation_service

router = APIRouter()


class ActivityLog(BaseModel):
    eventType: str
    metadata: Optional[Dict] = None


class RecommendationResponse(BaseModel):
    courseId: str
    score: Optional[float] = None
    reason: Optional[str] = None


class SimilarUser(BaseModel):
    userId: str
    similarity: float


@router.post("/activity/{user_id}")
async def log_activity(user_id: str, activity: ActivityLog):
    """
    Log user activity for recommendation analysis
    """
    await recommendation_service.log_user_activity(
        user_id=user_id,
        event_type=activity.eventType,
        metadata=activity.metadata
    )
    return {"logged": True}


@router.get("/courses/{user_id}", response_model=List[RecommendationResponse])
async def get_course_recommendations(user_id: str, limit: int = 5):
    """
    Get personalized course recommendations for a user
    """
    recommendations = await recommendation_service.recommend_next_course(
        user_id=user_id,
        limit=limit
    )
    return recommendations


@router.get("/similar-users/{user_id}", response_model=List[SimilarUser])
async def get_similar_users(user_id: str, limit: int = 10):
    """
    Find users with similar learning patterns
    """
    similar_users = await recommendation_service.find_similar_users(
        user_id=user_id,
        limit=limit
    )
    return similar_users


class CourseIndexRequest(BaseModel):
    courseId: str
    content: str


@router.post("/index-course")
async def index_course(request: CourseIndexRequest):
    """
    Index a course's content for similarity-based recommendations
    """
    await recommendation_service.index_course_content(
        course_id=request.courseId,
        content=request.content
    )
    return {"indexed": True, "courseId": request.courseId}


@router.get("/user-embedding/{user_id}")
async def get_user_embedding(user_id: str):
    """
    Get or generate user's interest embedding
    """
    embedding = await recommendation_service.generate_user_embedding(user_id)
    if not embedding:
        return {"embedding": None, "message": "No activity found for user"}
    return {"embedding": embedding[:10], "dimensions": len(embedding)}  # Truncate for response
