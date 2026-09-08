const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireStaff, requireAdmin } = require('../middleware/adminCheck');
const ModerationModel = require('../models/moderationModel');
const MessageModel = require('../models/messageModel');
const UserModel = require('../models/userModel');
const db = require('../db/database');

// Get pending reports
router.get('/reports', authenticateToken, requireStaff, (req, res) => {
  const reports = ModerationModel.getPendingReports();
  res.json({ reports });
});

// Resolve report
router.post('/reports/:id/resolve', authenticateToken, requireStaff, (req, res) => {
  const { note, status } = req.body;
  ModerationModel.resolveReport(parseInt(req.params.id, 10), req.user.id, note, status || 'resolved');
  res.json({ success: true });
});

// Mute user
router.post('/users/:id/mute', authenticateToken, requireStaff, (req, res) => {
  const { minutes } = req.body;
  const mutedUntil = ModerationModel.muteUser(parseInt(req.params.id, 10), minutes || 15, req.user.id);
  res.json({ success: true, mutedUntil });
});

// Unmute user
router.post('/users/:id/unmute', authenticateToken, requireStaff, (req, res) => {
  ModerationModel.unmuteUser(parseInt(req.params.id, 10), req.user.id);
  res.json({ success: true });
});

// Ban user
router.post('/users/:id/ban', authenticateToken, requireAdmin, (req, res) => {
  const { reason } = req.body;
  ModerationModel.banUser(parseInt(req.params.id, 10), req.user.id, reason);
  res.json({ success: true });
});

// Delete message by staff
router.delete('/messages/:id', authenticateToken, requireStaff, (req, res) => {
  const msg = MessageModel.deleteMessage(parseInt(req.params.id, 10), req.user.id, true);
  ModerationModel.logAudit(req.user.id, 'DELETE_MESSAGE', 'message', msg.id, 'Moderator deleted message');
  res.json({ success: true, message: msg });
});

// Audit logs
router.get('/audit-logs', authenticateToken, requireStaff, (req, res) => {
  const logs = ModerationModel.getAuditLogs();
  res.json({ logs });
});

// Platform stats
router.get('/stats', authenticateToken, requireStaff, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const totalMessages = db.prepare('SELECT COUNT(*) as c FROM messages WHERE is_deleted = 0').get().c;
  const pendingReports = db.prepare("SELECT COUNT(*) as c FROM reports WHERE status = 'pending'").get().c;
  res.json({ totalUsers, totalMessages, pendingReports });
});

module.exports = router;

