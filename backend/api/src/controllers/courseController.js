const courseService = require('../services/courseService');

const courseController = {

    // GET /courses - List all courses
    async getCourses(req, res, next) {
        try {
            const { page, limit, category, level, search } = req.query;

            const result = await courseService.getCourses({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                category,
                level,
                search
            });

            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    // GET /courses/:id - Get course by ID
    async getCourse(req, res, next) {
        try {
            const { id } = req.params;
            const course = await courseService.getCourseById(id);

            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }

            res.json({ course });
        } catch (err) {
            next(err);
        }
    },

    // GET /courses/slug/:slug - Get course by slug
    async getCourseBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const course = await courseService.getCourseBySlug(slug);

            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }

            res.json({ course });
        } catch (err) {
            next(err);
        }
    },

    // POST /courses - Create course (instructor only)
    async createCourse(req, res, next) {
        try {
            const { title, description, level, category, tags, isPublished, isFree, price } = req.body;

            if (!title) {
                return res.status(400).json({ error: 'Title is required' });
            }

            const course = await courseService.createCourse(req.user.userId, {
                title,
                description,
                level,
                category,
                tags,
                isPublished,
                isFree,
                price
            });

            res.status(201).json({ course });
        } catch (err) {
            next(err);
        }
    },

    // PUT /courses/:id - Update course
    async updateCourse(req, res, next) {
        try {
            const { id } = req.params;
            const course = await courseService.updateCourse(id, req.body);

            res.json({ course });
        } catch (err) {
            next(err);
        }
    },

    // POST /courses/:id/publish - Publish course
    async publishCourse(req, res, next) {
        try {
            const { id } = req.params;
            const course = await courseService.publishCourse(id, true);

            res.json({ message: 'Course published', course });
        } catch (err) {
            next(err);
        }
    },

    // POST /courses/:id/unpublish - Unpublish course
    async unpublishCourse(req, res, next) {
        try {
            const { id } = req.params;
            const course = await courseService.publishCourse(id, false);

            res.json({ message: 'Course unpublished', course });
        } catch (err) {
            next(err);
        }
    },

    // DELETE /courses/:id - Delete course
    async deleteCourse(req, res, next) {
        try {
            const { id } = req.params;
            const { hard } = req.query;

            await courseService.deleteCourse(id, hard === 'true');

            res.json({ message: 'Course deleted' });
        } catch (err) {
            next(err);
        }
    },

    // GET /courses/my-courses - Get instructor's courses
    async getMyCourses(req, res, next) {
        try {
            const courses = await courseService.getInstructorCourses(req.user.userId);
            res.json({ courses });
        } catch (err) {
            next(err);
        }
    },

    // POST /courses/:id/modules - Add module to course
    async addModule(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description } = req.body;

            if (!title) {
                return res.status(400).json({ error: 'Module title is required' });
            }

            const module = await courseService.addModuleToCourse(id, { title, description });

            res.status(201).json({ module });
        } catch (err) {
            next(err);
        }
    },

    // PUT /modules/:id - Update module
    async updateModule(req, res, next) {
        try {
            const { id } = req.params;
            const module = await courseService.updateModule(id, req.body);

            res.json({ module });
        } catch (err) {
            next(err);
        }
    },

    // DELETE /modules/:id - Delete module
    async deleteModule(req, res, next) {
        try {
            const { id } = req.params;
            await courseService.deleteModule(id);

            res.json({ message: 'Module deleted' });
        } catch (err) {
            next(err);
        }
    },

    // POST /modules/:id/lessons - Add lesson to module
    async addLesson(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description, contentType, contentUrl, contentText, durationMinutes, isPreview } = req.body;

            if (!title) {
                return res.status(400).json({ error: 'Lesson title is required' });
            }

            const lesson = await courseService.addLesson(id, {
                title,
                description,
                contentType,
                contentUrl,
                contentText,
                durationMinutes,
                isPreview
            });

            res.status(201).json({ lesson });
        } catch (err) {
            next(err);
        }
    },

    // PUT /lessons/:id - Update lesson
    async updateLesson(req, res, next) {
        try {
            const { id } = req.params;
            const lesson = await courseService.updateLesson(id, req.body);

            res.json({ lesson });
        } catch (err) {
            next(err);
        }
    },

    // DELETE /lessons/:id - Delete lesson
    async deleteLesson(req, res, next) {
        try {
            const { id } = req.params;
            await courseService.deleteLesson(id);

            res.json({ message: 'Lesson deleted' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = courseController;
