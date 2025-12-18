const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Public routes
router.get('/', courseController.getCourses);
router.get('/slug/:slug', courseController.getCourseBySlug);
router.get('/:id', courseController.getCourse);

// Instructor routes (requires authentication + instructor/admin role)
router.post('/', authenticate, authorize('instructor', 'admin'), courseController.createCourse);
router.get('/my/courses', authenticate, authorize('instructor', 'admin'), courseController.getMyCourses);
router.put('/:id', authenticate, authorize('instructor', 'admin'), courseController.updateCourse);
router.post('/:id/publish', authenticate, authorize('instructor', 'admin'), courseController.publishCourse);
router.post('/:id/unpublish', authenticate, authorize('instructor', 'admin'), courseController.unpublishCourse);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), courseController.deleteCourse);

// Module routes
router.post('/:id/modules', authenticate, authorize('instructor', 'admin'), courseController.addModule);
router.put('/modules/:id', authenticate, authorize('instructor', 'admin'), courseController.updateModule);
router.delete('/modules/:id', authenticate, authorize('instructor', 'admin'), courseController.deleteModule);

// Lesson routes
router.post('/modules/:id/lessons', authenticate, authorize('instructor', 'admin'), courseController.addLesson);
router.put('/lessons/:id', authenticate, authorize('instructor', 'admin'), courseController.updateLesson);
router.delete('/lessons/:id', authenticate, authorize('instructor', 'admin'), courseController.deleteLesson);

module.exports = router;
