const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  getRefreshTokenExpiry 
} = require('../utils/jwt');

class AuthService {
  
  // Hash refresh token for secure storage
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Register new user
  async registerUser({ email, password, firstName, lastName }) {
    // Check if user exists
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (existing.rows.length > 0) {
      throw { status: 409, message: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name, created_at`,
      [email.toLowerCase(), passwordHash, firstName, lastName]
    );

    return result.rows[0];
  }

  // Login user
  async loginUser({ email, password, userAgent, ipAddress }) {
    // Find user with role
    const result = await db.query(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, 
              u.is_active, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    const user = result.rows[0];
    
    if (!user) {
      throw { status: 401, message: 'Invalid credentials' };
    }

    if (!user.is_active) {
      throw { status: 403, message: 'Account is deactivated' };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw { status: 401, message: 'Invalid credentials' };
    }

    // Generate tokens
    const tokenPayload = { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token hash in session
    await db.query(
      `INSERT INTO sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, this.hashToken(refreshToken), userAgent, ipAddress, getRefreshTokenExpiry()]
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    };
  }

  // Logout user (invalidate session)
  async logoutUser(refreshToken) {
    if (!refreshToken) return;
    
    const tokenHash = this.hashToken(refreshToken);
    await db.query(
      'DELETE FROM sessions WHERE refresh_token_hash = $1',
      [tokenHash]
    );
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw { status: 401, message: 'Refresh token required' };
    }

    // Verify token signature
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw { status: 401, message: 'Invalid refresh token' };
    }

    // Check if session exists
    const tokenHash = this.hashToken(refreshToken);
    const session = await db.query(
      `SELECT s.id, s.user_id, s.expires_at
       FROM sessions s
       WHERE s.refresh_token_hash = $1 AND s.expires_at > NOW()`,
      [tokenHash]
    );

    if (session.rows.length === 0) {
      throw { status: 401, message: 'Session expired or invalid' };
    }

    // Get user data
    const userResult = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      throw { status: 401, message: 'User not found or inactive' };
    }

    const user = userResult.rows[0];

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return { accessToken };
  }

  // Get user by ID
  async getUserById(userId) {
    const result = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url,
              u.created_at, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.is_active = true`,
      [userId]
    );

    return result.rows[0] || null;
  }
}

module.exports = new AuthService();
