const { mongoose } = require('../config/mongodb');

// Schema for user activity events
const activityEventSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    eventType: {
        type: String,
        required: true,
        enum: [
            'lesson_started',
            'lesson_completed',
            'course_enrolled',
            'course_completed',
            'quiz_attempted',
            'quiz_passed',
            'ai_chat_started',
            'ai_question_asked',
            'badge_earned',
            'streak_updated',
            'login',
            'logout',
            'search',
            'page_view'
        ],
        index: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Denormalized data for fast queries
    courseId: String,
    lessonId: String,
    moduleId: String,
    // Engagement metrics
    durationSeconds: Number,
    score: Number,
    // Context
    userAgent: String,
    ipAddress: String,
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timeseries: {
        timeField: 'createdAt',
        metaField: 'userId',
        granularity: 'hours'
    }
});

// Schema for AI chat messages
const chatMessageSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    // Context that was injected
    context: {
        lessonId: String,
        courseId: String,
        topicEmbedding: [Number]
    },
    // Token usage for cost tracking
    tokenUsage: {
        prompt: Number,
        completion: Number,
        total: Number
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Schema for aggregated analytics (daily/weekly snapshots)
const analyticsSnapshotSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    metrics: {
        activeUsers: Number,
        newUsers: Number,
        lessonsCompleted: Number,
        coursesCompleted: Number,
        averageSessionDuration: Number,
        aiQuestionsAsked: Number,
        totalRevenue: Number
    },
    topCourses: [{
        courseId: String,
        title: String,
        enrollments: Number,
        completions: Number
    }],
    userRetention: {
        day1: Number,
        day7: Number,
        day30: Number
    },
    dropOffPoints: [{
        lessonId: String,
        courseId: String,
        dropOffRate: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient queries
activityEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
activityEventSchema.index({ courseId: 1, eventType: 1 });
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

// Models
const ActivityEvent = mongoose.model('ActivityEvent', activityEventSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);

module.exports = {
    ActivityEvent,
    ChatMessage,
    AnalyticsSnapshot
};
