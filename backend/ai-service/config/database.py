"""
Database connections for AI service
MongoDB for events/analytics, Redis for caching
"""

from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as redis
from config.settings import settings

# Global database connections
mongodb_client: AsyncIOMotorClient = None
mongodb_db = None
redis_client: redis.Redis = None


async def init_databases():
    """Initialize database connections"""
    global mongodb_client, mongodb_db, redis_client
    
    # MongoDB
    mongodb_client = AsyncIOMotorClient(settings.MONGODB_URI)
    mongodb_db = mongodb_client.get_default_database()
    print("✅ MongoDB connected")
    
    # Redis
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    await redis_client.ping()
    print("✅ Redis connected")


async def close_databases():
    """Close database connections"""
    global mongodb_client, redis_client
    
    if mongodb_client:
        mongodb_client.close()
        print("MongoDB connection closed")
    
    if redis_client:
        await redis_client.close()
        print("Redis connection closed")


def get_mongodb():
    """Get MongoDB database instance"""
    return mongodb_db


def get_redis():
    """Get Redis client instance"""
    return redis_client
