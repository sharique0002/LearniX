"""
Chatbot Service - AI Tutor with context-aware responses
"""

from typing import List, Dict, Optional
from datetime import datetime
import uuid
import json

from config.database import get_mongodb, get_redis
from config.settings import settings
from services.openai_service import generate_chat_response, explain_concept


class ChatbotService:
    TUTOR_SYSTEM_PROMPT = """You are LearniX AI Tutor, an intelligent educational assistant.
Your role is to:
1. Help learners understand concepts from their courses
2. Answer questions about lessons they're studying
3. Provide explanations at an appropriate difficulty level
4. Encourage learning with positive reinforcement
5. Guide learners to think critically rather than just providing answers

Always be patient, clear, and supportive. Use examples and analogies when helpful.
If given lesson context, relate your answers to the material being studied.
Format your responses with markdown for better readability when appropriate."""

    def __init__(self):
        self.cache_prefix = "chat:"
    
    async def start_chat_session(
        self,
        user_id: str,
        lesson_id: str = None,
        course_id: str = None
    ) -> Dict:
        """
        Start a new chat session
        """
        db = get_mongodb()
        
        session_id = str(uuid.uuid4())
        session = {
            "sessionId": session_id,
            "userId": user_id,
            "lessonId": lesson_id,
            "courseId": course_id,
            "messageCount": 0,
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        await db.chat_sessions.insert_one(session)
        
        return {
            "sessionId": session_id,
            "lessonId": lesson_id,
            "courseId": course_id,
            "message": "Hello! I'm your AI tutor. How can I help you today?"
        }
    
    async def add_context(
        self,
        session_id: str,
        lesson_id: str,
        lesson_title: str = None,
        lesson_content: str = None
    ) -> Dict:
        """
        Add lesson context to the chat session
        """
        db = get_mongodb()
        redis = get_redis()
        
        # Update session
        await db.chat_sessions.update_one(
            {"sessionId": session_id},
            {"$set": {
                "lessonId": lesson_id,
                "updatedAt": datetime.utcnow()
            }}
        )
        
        # Store context in Redis for quick access
        context = {
            "lessonId": lesson_id,
            "lessonTitle": lesson_title,
            "content": lesson_content[:settings.MAX_CONTEXT_LENGTH] if lesson_content else None
        }
        
        cache_key = f"{self.cache_prefix}context:{session_id}"
        await redis.setex(cache_key, settings.REDIS_TTL, json.dumps(context))
        
        return {"contextAdded": True, "lessonId": lesson_id}
    
    async def generate_response(
        self,
        session_id: str,
        user_id: str,
        query: str
    ) -> Dict:
        """
        Generate AI response for user query
        """
        db = get_mongodb()
        redis = get_redis()
        
        # Get session context
        cache_key = f"{self.cache_prefix}context:{session_id}"
        context_str = await redis.get(cache_key)
        context = json.loads(context_str) if context_str else {}
        
        # Get recent conversation history
        recent_messages = await db.chat_messages.find({
            "sessionId": session_id
        }).sort("createdAt", -1).limit(10).to_list(10)
        
        # Build message history for OpenAI
        messages = []
        for msg in reversed(recent_messages):
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add current query
        messages.append({"role": "user", "content": query})
        
        # Build system prompt with context
        system_prompt = self.TUTOR_SYSTEM_PROMPT
        if context.get("content"):
            system_prompt += f"\n\nCurrent lesson context:\nTitle: {context.get('lessonTitle', 'N/A')}\n\n{context['content']}"
        
        # Generate response
        result = await generate_chat_response(
            messages=messages,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=800
        )
        
        # Store messages in MongoDB
        now = datetime.utcnow()
        
        # Store user message
        await db.chat_messages.insert_one({
            "sessionId": session_id,
            "userId": user_id,
            "role": "user",
            "content": query,
            "createdAt": now
        })
        
        # Store assistant message
        await db.chat_messages.insert_one({
            "sessionId": session_id,
            "userId": user_id,
            "role": "assistant",
            "content": result["content"],
            "tokenUsage": result["usage"],
            "createdAt": now
        })
        
        # Update session
        await db.chat_sessions.update_one(
            {"sessionId": session_id},
            {
                "$inc": {"messageCount": 2},
                "$set": {"updatedAt": now}
            }
        )
        
        # Log activity for recommendations
        await db.activity_events.insert_one({
            "userId": user_id,
            "eventType": "ai_question_asked",
            "metadata": {
                "sessionId": session_id,
                "lessonId": context.get("lessonId"),
                "questionLength": len(query)
            },
            "createdAt": now
        })
        
        return {
            "response": result["content"],
            "usage": result["usage"],
            "sessionId": session_id
        }
    
    async def get_chat_history(
        self,
        session_id: str,
        limit: int = 50
    ) -> List[Dict]:
        """
        Get chat history for a session
        """
        db = get_mongodb()
        
        messages = await db.chat_messages.find({
            "sessionId": session_id
        }).sort("createdAt", 1).limit(limit).to_list(limit)
        
        return [{
            "role": msg["role"],
            "content": msg["content"],
            "createdAt": msg["createdAt"].isoformat()
        } for msg in messages]
    
    async def clear_context(self, session_id: str) -> Dict:
        """
        Clear the lesson context from a session
        """
        redis = get_redis()
        cache_key = f"{self.cache_prefix}context:{session_id}"
        await redis.delete(cache_key)
        
        return {"contextCleared": True, "sessionId": session_id}
    
    async def end_session(self, session_id: str) -> Dict:
        """
        End a chat session
        """
        db = get_mongodb()
        redis = get_redis()
        
        await db.chat_sessions.update_one(
            {"sessionId": session_id},
            {"$set": {
                "isActive": False,
                "endedAt": datetime.utcnow()
            }}
        )
        
        # Clear cached context
        await self.clear_context(session_id)
        
        return {"sessionEnded": True, "sessionId": session_id}
    
    async def get_user_sessions(
        self,
        user_id: str,
        active_only: bool = False
    ) -> List[Dict]:
        """
        Get user's chat sessions
        """
        db = get_mongodb()
        
        query = {"userId": user_id}
        if active_only:
            query["isActive"] = True
        
        sessions = await db.chat_sessions.find(query).sort("updatedAt", -1).limit(20).to_list(20)
        
        return [{
            "sessionId": s["sessionId"],
            "lessonId": s.get("lessonId"),
            "courseId": s.get("courseId"),
            "messageCount": s.get("messageCount", 0),
            "isActive": s.get("isActive", True),
            "createdAt": s["createdAt"].isoformat(),
            "updatedAt": s["updatedAt"].isoformat()
        } for s in sessions]


# Singleton instance
chatbot_service = ChatbotService()
