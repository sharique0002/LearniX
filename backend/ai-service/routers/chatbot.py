"""
Chatbot Router - API endpoints for AI tutoring chatbot
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from services.chatbot_service import chatbot_service

router = APIRouter()


class StartSessionRequest(BaseModel):
    lessonId: Optional[str] = None
    courseId: Optional[str] = None


class AddContextRequest(BaseModel):
    lessonId: str
    lessonTitle: Optional[str] = None
    lessonContent: Optional[str] = None


class ChatMessageRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    response: str
    sessionId: str
    usage: dict


@router.post("/sessions/{user_id}/start")
async def start_session(user_id: str, request: StartSessionRequest = None):
    """
    Start a new chat session
    """
    request = request or StartSessionRequest()
    session = await chatbot_service.start_chat_session(
        user_id=user_id,
        lesson_id=request.lessonId,
        course_id=request.courseId
    )
    return session


@router.post("/sessions/{session_id}/context")
async def add_context(session_id: str, request: AddContextRequest):
    """
    Add lesson context to the chat session
    """
    result = await chatbot_service.add_context(
        session_id=session_id,
        lesson_id=request.lessonId,
        lesson_title=request.lessonTitle,
        lesson_content=request.lessonContent
    )
    return result


@router.post("/sessions/{session_id}/message/{user_id}", response_model=ChatResponse)
async def send_message(session_id: str, user_id: str, request: ChatMessageRequest):
    """
    Send a message and get AI response
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    response = await chatbot_service.generate_response(
        session_id=session_id,
        user_id=user_id,
        query=request.query
    )
    return response


@router.get("/sessions/{session_id}/history")
async def get_history(session_id: str, limit: int = 50):
    """
    Get chat history for a session
    """
    history = await chatbot_service.get_chat_history(
        session_id=session_id,
        limit=limit
    )
    return {"messages": history}


@router.post("/sessions/{session_id}/clear-context")
async def clear_context(session_id: str):
    """
    Clear the lesson context from a session
    """
    result = await chatbot_service.clear_context(session_id)
    return result


@router.post("/sessions/{session_id}/end")
async def end_session(session_id: str):
    """
    End a chat session
    """
    result = await chatbot_service.end_session(session_id)
    return result


@router.get("/users/{user_id}/sessions")
async def get_user_sessions(user_id: str, active_only: bool = False):
    """
    Get user's chat sessions
    """
    sessions = await chatbot_service.get_user_sessions(
        user_id=user_id,
        active_only=active_only
    )
    return {"sessions": sessions}
