const express = require('express');
const router = express.Router();
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

// Update profile
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
