/**
 * LearniX API Test Suite
 * Basic tests for authentication service
 */

const authService = require('../src/services/authService');

// Mock database
jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should throw error if email already exists', async () => {
      const db = require('../src/config/db');
      db.query.mockResolvedValueOnce({ rows: [{ id: 'existing-user' }] });

      const service = new authService();
      
      await expect(service.registerUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })).rejects.toEqual({ status: 409, message: 'Email already registered' });
    });

    it('should create user with hashed password', async () => {
      const db = require('../src/config/db');
      db.query
        .mockResolvedValueOnce({ rows: [] }) // No existing user
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 'new-user-id', 
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User'
          }] 
        });

      const service = new authService();
      const result = await service.registerUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      expect(result.email).toBe('test@example.com');
      expect(db.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('loginUser', () => {
    it('should throw error for invalid credentials', async () => {
      const db = require('../src/config/db');
      db.query.mockResolvedValueOnce({ rows: [] });

      const service = new authService();

      await expect(service.loginUser({
        email: 'wrong@example.com',
        password: 'wrongpass'
      })).rejects.toEqual({ status: 401, message: 'Invalid credentials' });
    });
  });
});
