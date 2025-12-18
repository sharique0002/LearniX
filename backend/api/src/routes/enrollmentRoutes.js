const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authenticate = require('../middleware/authenticate');

// All enrollment routes require authentication
router.use(authenticate);

// Enrollment routes
router.post('/:courseId', enrollmentController.enroll);
router.get('/', enrollmentController.getEnrollments);
router.get('/:courseId', enrollmentController.getEnrollmentDetails);
router.delete('/:courseId', enrollmentController.unenroll);

// Progress routes
router.get('/progress/:courseId', enrollmentController.getCourseProgress);
router.put('/progress/lessons/:lessonId', enrollmentController.updateProgress);
router.post('/progress/lessons/:lessonId/complete', enrollmentController.markComplete);

module.exports = router;
