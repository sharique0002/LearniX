"""
Analytics Router - API endpoints for admin analytics and insights
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timedelta

from config.database import get_mongodb

router = APIRouter()


@router.get("/user-growth")
async def get_user_growth_metrics(days: int = 30):
    """
    Get user growth metrics over time
    """
    db = get_mongodb()
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get new users per day
    pipeline = [
        {"$match": {
            "eventType": "login",
            "createdAt": {"$gte": start_date}
        }},
        {"$group": {
            "_id": {
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                "userId": "$userId"
            }
        }},
        {"$group": {
            "_id": "$_id.date",
            "activeUsers": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.activity_events.aggregate(pipeline).to_list(100)
    
    return {
        "period": f"Last {days} days",
        "metrics": results
    }


@router.get("/course-completion-stats")
async def get_course_completion_stats():
    """
    Get course completion statistics
    """
    db = get_mongodb()
    
    pipeline = [
        {"$match": {"eventType": "course_completed"}},
        {"$group": {
            "_id": "$metadata.courseId",
            "completions": {"$sum": 1}
        }},
        {"$sort": {"completions": -1}},
        {"$limit": 20}
    ]
    
    results = await db.activity_events.aggregate(pipeline).to_list(20)
    
    # Get enrollment counts for completion rate
    enrollment_pipeline = [
        {"$match": {"eventType": "course_enrolled"}},
        {"$group": {
            "_id": "$metadata.courseId",
            "enrollments": {"$sum": 1}
        }}
    ]
    
    enrollments = await db.activity_events.aggregate(enrollment_pipeline).to_list(100)
    enrollment_map = {e["_id"]: e["enrollments"] for e in enrollments}
    
    # Calculate completion rates
    for result in results:
        course_id = result["_id"]
        enrolled = enrollment_map.get(course_id, 0)
        result["enrollments"] = enrolled
        result["completionRate"] = round(result["completions"] / enrolled * 100, 2) if enrolled > 0 else 0
    
    return {"courseStats": results}


@router.get("/drop-off-points")
async def get_drop_off_points():
    """
    Identify lessons where users tend to drop off
    """
    db = get_mongodb()
    
    # Get lessons started but not completed
    started_pipeline = [
        {"$match": {"eventType": "lesson_started"}},
        {"$group": {
            "_id": "$metadata.lessonId",
            "started": {"$sum": 1}
        }}
    ]
    
    completed_pipeline = [
        {"$match": {"eventType": "lesson_completed"}},
        {"$group": {
            "_id": "$metadata.lessonId",
            "completed": {"$sum": 1}
        }}
    ]
    
    started = await db.activity_events.aggregate(started_pipeline).to_list(100)
    completed = await db.activity_events.aggregate(completed_pipeline).to_list(100)
    
    completed_map = {c["_id"]: c["completed"] for c in completed}
    
    drop_offs = []
    for lesson in started:
        lesson_id = lesson["_id"]
        started_count = lesson["started"]
        completed_count = completed_map.get(lesson_id, 0)
        
        if started_count > 5:  # Only include lessons with significant data
            drop_off_rate = round((1 - completed_count / started_count) * 100, 2)
            if drop_off_rate > 30:  # Flag if more than 30% drop off
                drop_offs.append({
                    "lessonId": lesson_id,
                    "started": started_count,
                    "completed": completed_count,
                    "dropOffRate": drop_off_rate
                })
    
    drop_offs.sort(key=lambda x: x["dropOffRate"], reverse=True)
    
    return {"dropOffPoints": drop_offs[:10]}


@router.get("/top-performing-courses")
async def get_top_performing_courses(limit: int = 10):
    """
    Get top performing courses by engagement metrics
    """
    db = get_mongodb()
    
    pipeline = [
        {"$match": {
            "eventType": {"$in": ["lesson_completed", "course_enrolled", "course_completed"]}
        }},
        {"$group": {
            "_id": "$metadata.courseId",
            "totalEvents": {"$sum": 1},
            "enrollments": {
                "$sum": {"$cond": [{"$eq": ["$eventType", "course_enrolled"]}, 1, 0]}
            },
            "completions": {
                "$sum": {"$cond": [{"$eq": ["$eventType", "course_completed"]}, 1, 0]}
            },
            "lessonsCompleted": {
                "$sum": {"$cond": [{"$eq": ["$eventType", "lesson_completed"]}, 1, 0]}
            }
        }},
        {"$addFields": {
            "engagementScore": {
                "$add": [
                    {"$multiply": ["$enrollments", 1]},
                    {"$multiply": ["$completions", 10]},
                    {"$multiply": ["$lessonsCompleted", 0.5]}
                ]
            }
        }},
        {"$sort": {"engagementScore": -1}},
        {"$limit": limit}
    ]
    
    results = await db.activity_events.aggregate(pipeline).to_list(limit)
    
    return {"topCourses": results}


@router.get("/ai-usage-stats")
async def get_ai_usage_stats(days: int = 7):
    """
    Get AI chatbot usage statistics
    """
    db = get_mongodb()
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {"$match": {
            "eventType": "ai_question_asked",
            "createdAt": {"$gte": start_date}
        }},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
            "questions": {"$sum": 1},
            "uniqueUsers": {"$addToSet": "$userId"}
        }},
        {"$project": {
            "_id": 1,
            "questions": 1,
            "uniqueUsers": {"$size": "$uniqueUsers"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    daily_stats = await db.activity_events.aggregate(pipeline).to_list(days)
    
    # Total stats
    total_questions = sum(d["questions"] for d in daily_stats)
    total_users = len(set().union(*[set(d.get("uniqueUsers", [])) for d in daily_stats]))
    
    return {
        "period": f"Last {days} days",
        "totalQuestions": total_questions,
        "dailyStats": daily_stats
    }
