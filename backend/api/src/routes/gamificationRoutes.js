const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authenticate = require('../middleware/authenticate');

// All routes require authentication
router.use(authenticate);

// User stats routes
router.get('/stats', gamificationController.getStats);
router.get('/badges', gamificationController.getBadges);
router.post('/streak/check', gamificationController.checkStreak);

// Leaderboard (can be public with modifications)
router.get('/leaderboard', gamificationController.getLeaderboard);

// Event logging
router.post('/events', gamificationController.logEvent);

module.exports = router;
