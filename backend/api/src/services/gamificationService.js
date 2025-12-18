const db = require('../config/db');
const { ActivityEvent } = require('../models/Event');

class GamificationService {

    // Log an event and trigger gamification checks
    async logEvent(userId, eventType, metadata = {}) {
        // Store in MongoDB for analytics
        try {
            const event = new ActivityEvent({
                userId,
                eventType,
                metadata,
                courseId: metadata.courseId,
                lessonId: metadata.lessonId,
                createdAt: new Date()
            });
            await event.save();
        } catch (error) {
            console.error('Failed to log event to MongoDB:', error);
        }

        // Check for badge triggers
        await this.checkBadgeTriggers(userId, eventType, metadata);

        // Update streak if it's a learning activity
        if (['lesson_completed', 'course_completed', 'quiz_passed'].includes(eventType)) {
            await this.updateStreak(userId);
        }

        return { logged: true };
    }

    // Calculate and update user streak
    async calculateStreak(userId) {
        const streakResult = await db.query(
            'SELECT * FROM user_streaks WHERE user_id = $1',
            [userId]
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (streakResult.rows.length === 0) {
            // Create initial streak record
            await db.query(
                `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_xp)
         VALUES ($1, 1, 1, $2, 0)`,
                [userId, today]
            );
            return { currentStreak: 1, longestStreak: 1 };
        }

        const streak = streakResult.rows[0];
        const lastActivity = new Date(streak.last_activity_date);
        lastActivity.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

        let newStreak = streak.current_streak;
        let longestStreak = streak.longest_streak;

        if (daysDiff === 0) {
            // Same day, no change
            return { currentStreak: newStreak, longestStreak };
        } else if (daysDiff === 1) {
            // Consecutive day, increase streak
            newStreak += 1;
            if (newStreak > longestStreak) {
                longestStreak = newStreak;
            }
        } else {
            // Streak broken, reset
            newStreak = 1;
        }

        await db.query(
            `UPDATE user_streaks 
       SET current_streak = $2, longest_streak = $3, last_activity_date = $4, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
            [userId, newStreak, longestStreak, today]
        );

        return { currentStreak: newStreak, longestStreak };
    }

    // Update streak and add XP
    async updateStreak(userId, xpEarned = 10) {
        const streakData = await this.calculateStreak(userId);

        // Add XP
        await db.query(
            `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_xp)
       VALUES ($1, 1, 1, CURRENT_DATE, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET total_xp = user_streaks.total_xp + $2, updated_at = CURRENT_TIMESTAMP`,
            [userId, xpEarned]
        );

        // Check for streak badges
        if (streakData.currentStreak === 7) {
            await this.awardBadgeByName(userId, 'Week Warrior');
        } else if (streakData.currentStreak === 30) {
            await this.awardBadgeByName(userId, 'Month Master');
        }

        return streakData;
    }

    // Award badge to user
    async awardBadge(userId, badgeId) {
        try {
            const result = await db.query(
                `INSERT INTO user_badges (user_id, badge_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, badge_id) DO NOTHING
         RETURNING *`,
                [userId, badgeId]
            );

            if (result.rows.length > 0) {
                // Log badge earned event
                await this.logEvent(userId, 'badge_earned', { badgeId });
            }

            return result.rows[0] || null;
        } catch (error) {
            console.error('Failed to award badge:', error);
            return null;
        }
    }

    // Award badge by name
    async awardBadgeByName(userId, badgeName) {
        const badge = await db.query(
            'SELECT id FROM badges WHERE name = $1',
            [badgeName]
        );

        if (badge.rows.length > 0) {
            return this.awardBadge(userId, badge.rows[0].id);
        }
        return null;
    }

    // Check if user deserves any badges
    async checkBadgeTriggers(userId, eventType, metadata) {
        switch (eventType) {
            case 'lesson_completed':
                // Check for First Steps badge
                const lessonCount = await db.query(
                    'SELECT COUNT(*) FROM lesson_progress WHERE user_id = $1 AND is_completed = true',
                    [userId]
                );
                if (parseInt(lessonCount.rows[0].count) === 1) {
                    await this.awardBadgeByName(userId, 'First Steps');
                }
                break;

            case 'course_completed':
                // Check for Course Champion badge
                const courseCount = await db.query(
                    `SELECT COUNT(*) FROM enrollments WHERE user_id = $1 AND status = 'completed'`,
                    [userId]
                );
                if (parseInt(courseCount.rows[0].count) === 1) {
                    await this.awardBadgeByName(userId, 'Course Champion');
                }
                break;

            case 'ai_question_asked':
                // Check for Knowledge Seeker badge
                const questionCount = await ActivityEvent.countDocuments({
                    userId,
                    eventType: 'ai_question_asked'
                });
                if (questionCount === 10) {
                    await this.awardBadgeByName(userId, 'Knowledge Seeker');
                }
                break;
        }
    }

    // Get user's badges
    async getUserBadges(userId) {
        const result = await db.query(
            `SELECT b.*, ub.earned_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
            [userId]
        );
        return result.rows;
    }

    // Get user's streak and XP
    async getUserStats(userId) {
        const streak = await db.query(
            'SELECT * FROM user_streaks WHERE user_id = $1',
            [userId]
        );

        const badges = await this.getUserBadges(userId);
        const badgePoints = badges.reduce((sum, b) => sum + (b.points || 0), 0);

        if (streak.rows.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                totalXp: 0,
                level: 1,
                badges: [],
                badgeCount: 0
            };
        }

        const stats = streak.rows[0];
        const totalXp = stats.total_xp + badgePoints;
        const level = Math.floor(totalXp / 100) + 1;

        return {
            currentStreak: stats.current_streak,
            longestStreak: stats.longest_streak,
            totalXp,
            level,
            badges,
            badgeCount: badges.length,
            lastActivityDate: stats.last_activity_date
        };
    }

    // Update leaderboard
    async updateLeaderboard() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);

        // Get all users with their weekly XP
        const users = await db.query(
            `SELECT u.id as user_id,
              COALESCE(s.total_xp, 0) as total_xp,
              (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id AND e.status = 'completed' AND e.completed_at >= $1) as courses_completed,
              (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.is_completed = true AND lp.completed_at >= $1) as lessons_completed
       FROM users u
       LEFT JOIN user_streaks s ON u.id = s.user_id
       WHERE u.is_active = true
       ORDER BY total_xp DESC`,
            [weekStart]
        );

        // Upsert leaderboard entries
        for (let i = 0; i < users.rows.length; i++) {
            const user = users.rows[i];
            await db.query(
                `INSERT INTO leaderboard (user_id, period_type, period_start, xp_earned, courses_completed, lessons_completed, rank)
         VALUES ($1, 'weekly', $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, period_type, period_start)
         DO UPDATE SET xp_earned = $3, courses_completed = $4, lessons_completed = $5, rank = $6`,
                [user.user_id, weekStart, user.total_xp, user.courses_completed, user.lessons_completed, i + 1]
            );
        }

        return { updated: users.rows.length };
    }

    // Get leaderboard
    async getLeaderboard(periodType = 'weekly', limit = 10) {
        const result = await db.query(
            `SELECT l.*, u.first_name, u.last_name, u.avatar_url
       FROM leaderboard l
       JOIN users u ON l.user_id = u.id
       WHERE l.period_type = $1
       ORDER BY l.rank ASC
       LIMIT $2`,
            [periodType, limit]
        );
        return result.rows;
    }
}

module.exports = new GamificationService();
