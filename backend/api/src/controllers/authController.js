const authService = require('../services/authService');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
};

const authController = {
  
  // POST /auth/register
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const user = await authService.registerUser({ 
        email, password, firstName, lastName 
      });

      res.status(201).json({ 
        message: 'Registration successful',
        user 
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const { accessToken, refreshToken, user } = await authService.loginUser({
        email,
        password,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      });

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ 
        accessToken,
        user 
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /auth/logout
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      await authService.logoutUser(refreshToken);
      
      res.clearCookie('refreshToken', COOKIE_OPTIONS);
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  // POST /auth/refresh
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      const { accessToken } = await authService.refreshToken(refreshToken);
      
      res.json({ accessToken });
    } catch (err) {
      next(err);
    }
  },

  // GET /auth/me
  async me(req, res, next) {
    try {
      const user = await authService.getUserById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
