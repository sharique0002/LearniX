const db = require('../config/db');
const { ActivityEvent } = require('../models/Event');

class EnrollmentService {

    // Enroll user in a course
    async enrollUser(userId, courseId) {
        // Check if course exists and is published
        const course = await db.query(
            'SELECT id, is_published, is_free, price FROM courses WHERE id = $1',
            [courseId]
        );

        if (course.rows.length === 0) {
            throw { status: 404, message: 'Course not found' };
        }

        if (!course.rows[0].is_published) {
            throw { status: 400, message: 'Course is not available for enrollment' };
        }

        // Check if already enrolled
        const existing = await db.query(
            'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );

        if (existing.rows.length > 0) {
            throw { status: 409, message: 'Already enrolled in this course' };
        }

        // Create enrollment
        const result = await db.query(
            `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       RETURNING *`,
            [userId, courseId]
        );

        // Log activity event
        await this.logActivity(userId, 'course_enrolled', { courseId });

        return result.rows[0];
    }

    // Get user's enrollments
    async getEnrollments(userId, status = null) {
        let query = `
      SELECT e.*, 
             c.title, c.slug, c.thumbnail_url, c.level, c.category, c.duration_hours,
             u.first_name as instructor_first_name, u.last_name as instructor_last_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = $1
    `;
        const values = [userId];

        if (status) {
            query += ' AND e.status = $2';
            values.push(status);
        }

        query += ' ORDER BY e.last_accessed_at DESC';

        const result = await db.query(query, values);
        return result.rows;
    }

    // Get single enrollment with progress details
    async getEnrollmentDetails(userId, courseId) {
        const enrollment = await db.query(
            `SELECT e.*, c.title, c.description
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1 AND e.course_id = $2`,
            [userId, courseId]
        );

        if (enrollment.rows.length === 0) {
            return null;
        }

        // Get lesson progress
        const lessonProgress = await db.query(
            `SELECT lp.lesson_id, lp.status, lp.is_completed, lp.progress_seconds, lp.completed_at,
              l.title as lesson_title, l.content_type, l.duration_minutes,
              m.id as module_id, m.title as module_title
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN course_modules m ON l.module_id = m.id
       WHERE lp.enrollment_id = $1
       ORDER BY m.order_index, l.order_index`,
            [enrollment.rows[0].id]
        );

        return {
            ...enrollment.rows[0],
            lessonProgress: lessonProgress.rows
        };
    }

    // Mark lesson as complete
    async markLessonComplete(userId, lessonId) {
        // Get lesson and course info
        const lessonInfo = await db.query(
            `SELECT l.id, l.module_id, m.course_id
       FROM lessons l
       JOIN course_modules m ON l.module_id = m.id
       WHERE l.id = $1`,
            [lessonId]
        );

        if (lessonInfo.rows.length === 0) {
            throw { status: 404, message: 'Lesson not found' };
        }

        const { course_id: courseId } = lessonInfo.rows[0];

        // Check if user is enrolled
        const enrollment = await db.query(
            'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );

        if (enrollment.rows.length === 0) {
            throw { status: 403, message: 'Not enrolled in this course' };
        }

        const enrollmentId = enrollment.rows[0].id;

        // Upsert lesson progress
        const result = await db.query(
            `INSERT INTO lesson_progress (user_id, lesson_id, enrollment_id, status, is_completed, completed_at, last_accessed_at)
       VALUES ($1, $2, $3, 'completed', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET 
         status = 'completed',
         is_completed = true,
         completed_at = COALESCE(lesson_progress.completed_at, CURRENT_TIMESTAMP),
         last_accessed_at = CURRENT_TIMESTAMP
       RETURNING *`,
            [userId, lessonId, enrollmentId]
        );

        // Log activity
        await this.logActivity(userId, 'lesson_completed', { lessonId, courseId });

        return result.rows[0];
    }

    // Update lesson progress (for video position, etc.)
    async updateLessonProgress(userId, lessonId, { progressSeconds, status }) {
        // Get enrollment
        const lessonInfo = await db.query(
            `SELECT l.id, m.course_id
       FROM lessons l
       JOIN course_modules m ON l.module_id = m.id
       WHERE l.id = $1`,
            [lessonId]
        );

        if (lessonInfo.rows.length === 0) {
            throw { status: 404, message: 'Lesson not found' };
        }

        const enrollment = await db.query(
            'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, lessonInfo.rows[0].course_id]
        );

        if (enrollment.rows.length === 0) {
            throw { status: 403, message: 'Not enrolled in this course' };
        }

        const result = await db.query(
            `INSERT INTO lesson_progress (user_id, lesson_id, enrollment_id, status, progress_seconds, last_accessed_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET 
         status = COALESCE($4, lesson_progress.status),
         progress_seconds = COALESCE($5, lesson_progress.progress_seconds),
         last_accessed_at = CURRENT_TIMESTAMP
       RETURNING *`,
            [userId, lessonId, enrollment.rows[0].id, status || 'in_progress', progressSeconds]
        );

        return result.rows[0];
    }

    // Get user progress for a course
    async getUserProgress(userId, courseId) {
        const enrollment = await db.query(
            `SELECT e.id, e.progress_percent, e.status, e.enrolled_at, e.completed_at
       FROM enrollments e
       WHERE e.user_id = $1 AND e.course_id = $2`,
            [userId, courseId]
        );

        if (enrollment.rows.length === 0) {
            return null;
        }

        // Get detailed progress
        const stats = await db.query(
            `SELECT 
         COUNT(l.id) as total_lessons,
         COUNT(lp.id) FILTER (WHERE lp.is_completed = true) as completed_lessons,
         SUM(l.duration_minutes) as total_duration,
         SUM(l.duration_minutes) FILTER (WHERE lp.is_completed = true) as completed_duration
       FROM lessons l
       JOIN course_modules m ON l.module_id = m.id
       LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = $1
       WHERE m.course_id = $2`,
            [userId, courseId]
        );

        // Get next lesson to continue
        const nextLesson = await db.query(
            `SELECT l.id, l.title, l.content_type, m.title as module_title
       FROM lessons l
       JOIN course_modules m ON l.module_id = m.id
       LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = $1
       WHERE m.course_id = $2 AND (lp.is_completed IS NULL OR lp.is_completed = false)
       ORDER BY m.order_index, l.order_index
       LIMIT 1`,
            [userId, courseId]
        );

        return {
            ...enrollment.rows[0],
            stats: stats.rows[0],
            nextLesson: nextLesson.rows[0] || null
        };
    }

    // Log activity to MongoDB
    async logActivity(userId, eventType, metadata = {}) {
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
            console.error('Failed to log activity:', error);
            // Don't throw - activity logging shouldn't break main operations
        }
    }

    // Unenroll from course
    async unenrollUser(userId, courseId) {
        const result = await db.query(
            'DELETE FROM enrollments WHERE user_id = $1 AND course_id = $2 RETURNING id',
            [userId, courseId]
        );

        if (result.rows.length === 0) {
            throw { status: 404, message: 'Enrollment not found' };
        }

        return { unenrolled: true };
    }
}

module.exports = new EnrollmentService();
