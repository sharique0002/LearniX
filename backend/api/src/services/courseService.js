const db = require('../config/db');
const slugify = require('../utils/slugify');

class CourseService {

    // Create a new course
    async createCourse(instructorId, { title, description, level, category, tags, isPublished, isFree, price }) {
        const slug = await this.generateUniqueSlug(title);

        const result = await db.query(
            `INSERT INTO courses (instructor_id, title, slug, description, level, category, tags, is_published, is_free, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
            [instructorId, title, slug, description, level, category, tags || [], isPublished || false, isFree || false, price || 0]
        );

        return result.rows[0];
    }

    // Generate unique slug
    async generateUniqueSlug(title) {
        let slug = slugify(title);
        let counter = 0;
        let uniqueSlug = slug;

        while (true) {
            const existing = await db.query('SELECT id FROM courses WHERE slug = $1', [uniqueSlug]);
            if (existing.rows.length === 0) break;
            counter++;
            uniqueSlug = `${slug}-${counter}`;
        }

        return uniqueSlug;
    }

    // Get course by ID with full hierarchy
    async getCourseById(courseId, includeUnpublished = false) {
        const courseQuery = includeUnpublished
            ? 'SELECT c.*, u.first_name as instructor_first_name, u.last_name as instructor_last_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = $1'
            : 'SELECT c.*, u.first_name as instructor_first_name, u.last_name as instructor_last_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = $1 AND c.is_published = true';

        const course = await db.query(courseQuery, [courseId]);

        if (course.rows.length === 0) {
            return null;
        }

        // Get modules with lessons
        const modules = await db.query(
            `SELECT m.*, 
              json_agg(
                json_build_object(
                  'id', l.id,
                  'title', l.title,
                  'description', l.description,
                  'content_type', l.content_type,
                  'duration_minutes', l.duration_minutes,
                  'order_index', l.order_index,
                  'is_preview', l.is_preview
                ) ORDER BY l.order_index
              ) FILTER (WHERE l.id IS NOT NULL) as lessons
       FROM course_modules m
       LEFT JOIN lessons l ON l.module_id = m.id
       WHERE m.course_id = $1
       GROUP BY m.id
       ORDER BY m.order_index`,
            [courseId]
        );

        return {
            ...course.rows[0],
            modules: modules.rows
        };
    }

    // Get course by slug
    async getCourseBySlug(slug) {
        const course = await db.query(
            'SELECT id FROM courses WHERE slug = $1 AND is_published = true',
            [slug]
        );

        if (course.rows.length === 0) return null;
        return this.getCourseById(course.rows[0].id);
    }

    // Update course
    async updateCourse(courseId, updates) {
        const allowedFields = ['title', 'description', 'level', 'category', 'tags', 'thumbnail_url', 'is_free', 'price'];
        const setClause = [];
        const values = [courseId];
        let paramIndex = 2;

        for (const [key, value] of Object.entries(updates)) {
            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // camelCase to snake_case
            if (allowedFields.includes(dbKey) && value !== undefined) {
                setClause.push(`${dbKey} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (setClause.length === 0) {
            throw { status: 400, message: 'No valid fields to update' };
        }

        setClause.push('updated_at = CURRENT_TIMESTAMP');

        const result = await db.query(
            `UPDATE courses SET ${setClause.join(', ')} WHERE id = $1 RETURNING *`,
            values
        );

        return result.rows[0];
    }

    // Publish/unpublish course
    async publishCourse(courseId, publish = true) {
        const result = await db.query(
            'UPDATE courses SET is_published = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [courseId, publish]
        );
        return result.rows[0];
    }

    // Delete course (soft delete by unpublishing, or hard delete)
    async deleteCourse(courseId, hardDelete = false) {
        if (hardDelete) {
            await db.query('DELETE FROM courses WHERE id = $1', [courseId]);
            return { deleted: true };
        }
        return this.publishCourse(courseId, false);
    }

    // Add module to course
    async addModuleToCourse(courseId, { title, description }) {
        // Get next order index
        const orderResult = await db.query(
            'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM course_modules WHERE course_id = $1',
            [courseId]
        );

        const result = await db.query(
            `INSERT INTO course_modules (course_id, title, description, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [courseId, title, description, orderResult.rows[0].next_order]
        );

        return result.rows[0];
    }

    // Update module
    async updateModule(moduleId, { title, description, orderIndex }) {
        const updates = [];
        const values = [moduleId];
        let paramIndex = 2;

        if (title) {
            updates.push(`title = $${paramIndex++}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (orderIndex !== undefined) {
            updates.push(`order_index = $${paramIndex++}`);
            values.push(orderIndex);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');

        const result = await db.query(
            `UPDATE course_modules SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
            values
        );

        return result.rows[0];
    }

    // Delete module
    async deleteModule(moduleId) {
        await db.query('DELETE FROM course_modules WHERE id = $1', [moduleId]);
        return { deleted: true };
    }

    // Add lesson to module
    async addLesson(moduleId, { title, description, contentType, contentUrl, contentText, durationMinutes, isPreview }) {
        // Get next order index
        const orderResult = await db.query(
            'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM lessons WHERE module_id = $1',
            [moduleId]
        );

        const result = await db.query(
            `INSERT INTO lessons (module_id, title, description, content_type, content_url, content_text, duration_minutes, order_index, is_preview)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [moduleId, title, description, contentType, contentUrl, contentText, durationMinutes || 0, orderResult.rows[0].next_order, isPreview || false]
        );

        return result.rows[0];
    }

    // Update lesson
    async updateLesson(lessonId, updates) {
        const allowedFields = ['title', 'description', 'content_type', 'content_url', 'content_text', 'duration_minutes', 'order_index', 'is_preview'];
        const setClause = [];
        const values = [lessonId];
        let paramIndex = 2;

        for (const [key, value] of Object.entries(updates)) {
            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            if (allowedFields.includes(dbKey) && value !== undefined) {
                setClause.push(`${dbKey} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (setClause.length === 0) {
            throw { status: 400, message: 'No valid fields to update' };
        }

        setClause.push('updated_at = CURRENT_TIMESTAMP');

        const result = await db.query(
            `UPDATE lessons SET ${setClause.join(', ')} WHERE id = $1 RETURNING *`,
            values
        );

        return result.rows[0];
    }

    // Delete lesson
    async deleteLesson(lessonId) {
        await db.query('DELETE FROM lessons WHERE id = $1', [lessonId]);
        return { deleted: true };
    }

    // Get all published courses with pagination
    async getCourses({ page = 1, limit = 10, category, level, search }) {
        const offset = (page - 1) * limit;
        const conditions = ['is_published = true'];
        const values = [];
        let paramIndex = 1;

        if (category) {
            conditions.push(`category = $${paramIndex++}`);
            values.push(category);
        }
        if (level) {
            conditions.push(`level = $${paramIndex++}`);
            values.push(level);
        }
        if (search) {
            conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
            values.push(`%${search}%`);
            paramIndex++;
        }

        values.push(limit, offset);

        const whereClause = conditions.join(' AND ');

        const result = await db.query(
            `SELECT c.*, u.first_name as instructor_first_name, u.last_name as instructor_last_name,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrollment_count
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex - 1} OFFSET $${paramIndex}`,
            values
        );

        const countResult = await db.query(
            `SELECT COUNT(*) FROM courses WHERE ${whereClause}`,
            values.slice(0, -2)
        );

        return {
            courses: result.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            limit,
            totalPages: Math.ceil(countResult.rows[0].count / limit)
        };
    }

    // Get courses by instructor
    async getInstructorCourses(instructorId) {
        const result = await db.query(
            `SELECT c.*, 
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrollment_count,
              (SELECT COUNT(*) FROM course_modules m WHERE m.course_id = c.id) as module_count
       FROM courses c
       WHERE c.instructor_id = $1
       ORDER BY c.created_at DESC`,
            [instructorId]
        );

        return result.rows;
    }
}

module.exports = new CourseService();
