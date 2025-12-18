const enrollmentService = require('../services/enrollmentService');

const enrollmentController = {

    // POST /enrollments/:courseId - Enroll in course
    async enroll(req, res, next) {
        try {
            const { courseId } = req.params;
            const enrollment = await enrollmentService.enrollUser(req.user.userId, courseId);

            res.status(201).json({
                message: 'Successfully enrolled',
                enrollment
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /enrollments - Get user's enrollments
    async getEnrollments(req, res, next) {
        try {
            const { status } = req.query;
            const enrollments = await enrollmentService.getEnrollments(req.user.userId, status);

            res.json({ enrollments });
        } catch (err) {
            next(err);
        }
    },

    // GET /enrollments/:courseId - Get enrollment details
    async getEnrollmentDetails(req, res, next) {
        try {
            const { courseId } = req.params;
            const enrollment = await enrollmentService.getEnrollmentDetails(req.user.userId, courseId);

            if (!enrollment) {
                return res.status(404).json({ error: 'Enrollment not found' });
            }

            res.json({ enrollment });
        } catch (err) {
            next(err);
        }
    },

    // POST /progress/lessons/:lessonId/complete - Mark lesson complete
    async markComplete(req, res, next) {
        try {
            const { lessonId } = req.params;
            const progress = await enrollmentService.markLessonComplete(req.user.userId, lessonId);

            res.json({
                message: 'Lesson marked as complete',
                progress
            });
        } catch (err) {
            next(err);
        }
    },

    // PUT /progress/lessons/:lessonId - Update lesson progress
    async updateProgress(req, res, next) {
        try {
            const { lessonId } = req.params;
            const { progressSeconds, status } = req.body;

            const progress = await enrollmentService.updateLessonProgress(
                req.user.userId,
                lessonId,
                { progressSeconds, status }
            );

            res.json({ progress });
        } catch (err) {
            next(err);
        }
    },

    // GET /progress/:courseId - Get course progress
    async getCourseProgress(req, res, next) {
        try {
            const { courseId } = req.params;
            const progress = await enrollmentService.getUserProgress(req.user.userId, courseId);

            if (!progress) {
                return res.status(404).json({ error: 'Not enrolled in this course' });
            }

            res.json({ progress });
        } catch (err) {
            next(err);
        }
    },

    // DELETE /enrollments/:courseId - Unenroll from course
    async unenroll(req, res, next) {
        try {
            const { courseId } = req.params;
            await enrollmentService.unenrollUser(req.user.userId, courseId);

            res.json({ message: 'Successfully unenrolled' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = enrollmentController;
