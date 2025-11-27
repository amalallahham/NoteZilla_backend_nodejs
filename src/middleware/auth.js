// Authentication middleware for JWT verification
// AI Assistant: Cookie and JWT authentication logic generated with assistance from GitHub Copilot

const jwt = require('jsonwebtoken');
const messages = require('../lang/messages');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const requireAuth = (req, res, next) => {
  // Try to get token from cookie first, then fall back to Authorization header
  let token = req.cookies?.token;

  if (!token) {
    const h = req.headers.authorization || '';
    token = h.startsWith('Bearer ') ? h.slice(7) : null;
  }

  if (!token) return res.status(401).json({ error: messages.auth.missingToken });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: messages.auth.invalidToken });
  }
}

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: messages.auth.unauthorized });
    if (req.user.role !== role) {
      return res.status(403).json({ error: messages.auth.forbidden });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
