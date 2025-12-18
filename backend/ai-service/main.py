"""
LearniX AI Service - FastAPI Application
Provides AI-powered features: recommendations, chatbot, embeddings
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from config.settings import settings
from config.database import init_databases, close_databases
from routers import recommendations, chatbot, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    await init_databases()
    print("🧠 LearniX AI Service started")
    yield
    # Shutdown
    await close_databases()
    print("🧠 LearniX AI Service stopped")

app = FastAPI(
    title="LearniX AI Service",
    description="AI-powered features for the LearniX EdTech platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, settings.API_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-service"}

# Include routers
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(chatbot.router, prefix="/chat", tags=["AI Chatbot"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
