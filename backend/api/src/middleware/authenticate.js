const { verifyAccessToken } = require('../utils/jwt');

/**
 * Authentication Middleware
 * Validates JWT access token and attaches user to request
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Fix: Also check for token in cookies as fallback
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const decoded = verifyAccessToken(token);
    
    // Fix: Validate token has required fields
    if (!decoded.userId || !decoded.email) {
      return res.status(401).json({ 
        error: 'Invalid token payload',
        code: 'INVALID_PAYLOAD'
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Malformed token', code: 'MALFORMED_TOKEN' });
    }
    return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
};

module.exports = authenticate;
