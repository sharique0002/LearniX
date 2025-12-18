-- LearniX Gamification & Analytics Schema
-- Migration 003: Badges, Streaks, Leaderboard, Chat Sessions

-- Badge definitions
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(50) CHECK (category IN ('achievement', 'streak', 'skill', 'special')),
    points INTEGER DEFAULT 0,
    criteria JSONB, -- Flexible criteria definition
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges (earned)
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- User streaks
CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard (weekly/monthly snapshots)
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period_type VARCHAR(20) CHECK (period_type IN ('weekly', 'monthly', 'all_time')),
    period_start DATE,
    xp_earned INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, period_type, period_start)
);

-- AI Chat sessions (metadata only, messages in MongoDB)
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(255),
    message_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default badges
INSERT INTO badges (name, description, category, points, criteria) VALUES
    ('First Steps', 'Complete your first lesson', 'achievement', 10, '{"lessons_completed": 1}'),
    ('Course Champion', 'Complete your first course', 'achievement', 100, '{"courses_completed": 1}'),
    ('Week Warrior', 'Maintain a 7-day streak', 'streak', 50, '{"streak_days": 7}'),
    ('Month Master', 'Maintain a 30-day streak', 'streak', 200, '{"streak_days": 30}'),
    ('Fast Learner', 'Complete 5 lessons in one day', 'skill', 30, '{"lessons_per_day": 5}'),
    ('Knowledge Seeker', 'Ask 10 questions to AI tutor', 'skill', 25, '{"ai_questions": 10}'),
    ('Early Adopter', 'Among the first 1000 users', 'special', 500, '{"user_number": 1000}');

-- Indexes
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX idx_leaderboard_period ON leaderboard(period_type, period_start);
CREATE INDEX idx_leaderboard_rank ON leaderboard(period_type, rank);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_lesson ON chat_sessions(lesson_id);
