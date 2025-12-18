/**
 * LearniX API Test Suite
 * Tests for course service functionality
 */

const courseService = require('../src/services/courseService');

// Mock database
jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

describe('CourseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCourses', () => {
    it('should return all published courses', async () => {
      const db = require('../src/config/db');
      const mockCourses = [
        { id: '1', title: 'JavaScript Basics', is_published: true },
        { id: '2', title: 'Python Advanced', is_published: true }
      ];
      db.query.mockResolvedValueOnce({ rows: mockCourses });

      const service = new courseService();
      const result = await service.getAllCourses();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('JavaScript Basics');
    });

    it('should return empty array when no courses', async () => {
      const db = require('../src/config/db');
      db.query.mockResolvedValueOnce({ rows: [] });

      const service = new courseService();
      const result = await service.getAllCourses();

      expect(result).toEqual([]);
    });
  });

  describe('getCourseBySlug', () => {
    it('should return course with modules and lessons', async () => {
      const db = require('../src/config/db');
      const mockCourse = { 
        id: '1', 
        title: 'Test Course', 
        slug: 'test-course' 
      };
      db.query.mockResolvedValueOnce({ rows: [mockCourse] });

      const service = new courseService();
      const result = await service.getCourseBySlug('test-course');

      expect(result.slug).toBe('test-course');
    });

    it('should throw 404 for non-existent course', async () => {
      const db = require('../src/config/db');
      db.query.mockResolvedValueOnce({ rows: [] });

      const service = new courseService();

      await expect(service.getCourseBySlug('not-found'))
        .rejects.toEqual({ status: 404, message: 'Course not found' });
    });
  });
});
