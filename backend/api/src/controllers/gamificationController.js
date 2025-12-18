const gamificationService = require('../services/gamificationService');

const gamificationController = {

    // GET /gamification/stats - Get user stats
    async getStats(req, res, next) {
        try {
            const stats = await gamificationService.getUserStats(req.user.userId);
            res.json({ stats });
        } catch (err) {
            next(err);
        }
    },

    // GET /gamification/badges - Get user badges
    async getBadges(req, res, next) {
        try {
            const badges = await gamificationService.getUserBadges(req.user.userId);
            res.json({ badges });
        } catch (err) {
            next(err);
        }
    },

    // GET /gamification/leaderboard - Get leaderboard
    async getLeaderboard(req, res, next) {
        try {
            const { period = 'weekly', limit = 10 } = req.query;
            const leaderboard = await gamificationService.getLeaderboard(period, parseInt(limit));
            res.json({ leaderboard });
        } catch (err) {
            next(err);
        }
    },

    // POST /gamification/streak/check - Check and update streak
    async checkStreak(req, res, next) {
        try {
            const streak = await gamificationService.calculateStreak(req.user.userId);
            res.json({ streak });
        } catch (err) {
            next(err);
        }
    },

    // POST /gamification/events - Log activity event (internal use)
    async logEvent(req, res, next) {
        try {
            const { eventType, metadata } = req.body;

            if (!eventType) {
                return res.status(400).json({ error: 'Event type is required' });
            }

            await gamificationService.logEvent(req.user.userId, eventType, metadata);
            res.json({ message: 'Event logged' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = gamificationController;
