-- LearniX Course & Content Engine Schema
-- Migration 002: Courses, Modules, Lessons, Enrollments, Progress

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    category VARCHAR(100),
    tags TEXT[],
    duration_hours INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT false,
    price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course modules (sections/chapters)
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons within modules
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) CHECK (content_type IN ('video', 'text', 'quiz', 'exercise', 'download')),
    content_url TEXT,
    content_text TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'expired')),
    progress_percent INTEGER DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Lesson progress tracking
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_seconds INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Indexes for performance
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_modules_order ON course_modules(course_id, order_index);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_lessons_order ON lessons(module_id, order_index);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);

-- Function to update course duration
CREATE OR REPLACE FUNCTION update_course_duration()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses
    SET duration_hours = (
        SELECT COALESCE(CEIL(SUM(l.duration_minutes) / 60.0), 0)
        FROM lessons l
        JOIN course_modules m ON l.module_id = m.id
        WHERE m.course_id = (
            SELECT course_id FROM course_modules WHERE id = NEW.module_id
        )
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = (
        SELECT course_id FROM course_modules WHERE id = NEW.module_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update course duration
CREATE TRIGGER trigger_update_course_duration
AFTER INSERT OR UPDATE OR DELETE ON lessons
FOR EACH ROW EXECUTE FUNCTION update_course_duration();

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    new_progress INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_lessons
    FROM lessons l
    JOIN course_modules m ON l.module_id = m.id
    JOIN enrollments e ON e.course_id = m.course_id
    WHERE e.id = NEW.enrollment_id;

    SELECT COUNT(*) INTO completed_lessons
    FROM lesson_progress lp
    WHERE lp.enrollment_id = NEW.enrollment_id AND lp.is_completed = true;

    IF total_lessons > 0 THEN
        new_progress := (completed_lessons * 100) / total_lessons;
    ELSE
        new_progress := 0;
    END IF;

    UPDATE enrollments
    SET progress_percent = new_progress,
        last_accessed_at = CURRENT_TIMESTAMP,
        status = CASE WHEN new_progress = 100 THEN 'completed' ELSE status END,
        completed_at = CASE WHEN new_progress = 100 THEN CURRENT_TIMESTAMP ELSE completed_at END
    WHERE id = NEW.enrollment_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for progress updates
CREATE TRIGGER trigger_update_enrollment_progress
AFTER UPDATE ON lesson_progress
FOR EACH ROW
WHEN (OLD.is_completed IS DISTINCT FROM NEW.is_completed)
EXECUTE FUNCTION update_enrollment_progress();
