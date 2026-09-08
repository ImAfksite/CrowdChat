const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../db/database');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const user = db.prepare('SELECT id, username, display_name, email, role, is_banned, muted_until, avatar_url, accent_color, bio, custom_status FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User no longer exists' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account has been suspended by a moderator.' });
    }

    req.user = user;
    next();
  });
}

function verifySocketToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.prepare('SELECT id, username, display_name, role, is_banned, muted_until, avatar_url FROM users WHERE id = ?').get(decoded.id);
    if (!user || user.is_banned) return null;
    return user;
  } catch {
    return null;
  }
}

module.exports = { authenticateToken, verifySocketToken };
