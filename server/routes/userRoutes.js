const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const ModerationModel = require('../models/moderationModel');

// Search users
router.get('/search', authenticateToken, (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 1) return res.json({ users: [] });
  const users = UserModel.searchUsers(q, req.user.id);
  res.json({ users });
});

// Update profile details (avatar, bio, status, accent)
router.put('/profile', authenticateToken, (req, res) => {
  const { displayName, bio, customStatus, avatarUrl, accentColor } = req.body;
  const updated = UserModel.updateProfile(req.user.id, {
    displayName,
    bio,
    customStatus,
    avatarUrl,
    accentColor
  });
  res.json({ user: updated });
});

// Update account settings (email, password)
router.put('/account', authenticateToken, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (email && email !== user.email) {
      const existing = UserModel.findByEmail(email);
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ error: 'Email is already in use by another account' });
      }
      db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email.trim().toLowerCase(), req.user.id);
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Incorrect current password' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, req.user.id);
    }

    const updated = UserModel.findById(req.user.id);
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update account' });
  }
});

// Block user
router.post('/block/:targetUserId', authenticateToken, (req, res) => {
  const targetId = parseInt(req.params.targetUserId, 10);
  if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot block yourself' });

  db.prepare('INSERT OR IGNORE INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)').run(req.user.id, targetId);
  res.json({ success: true, message: 'User blocked' });
});

// Report user or message
router.post('/report', authenticateToken, (req, res) => {
  const { reportedUserId, messageId, reason, details } = req.body;
  if (!reportedUserId || !reason) {
    return res.status(400).json({ error: 'Reported user ID and reason are required' });
  }

  const reportId = ModerationModel.createReport({
    reporterId: req.user.id,
    reportedUserId,
    messageId,
    reason,
    details
  });

  res.status(201).json({ success: true, reportId });
});

module.exports = router;
