const express = require('express');
const router = express.Router();
const DMModel = require('../models/dmModel');
const ReactionModel = require('../models/reactionModel');
const { authenticateToken } = require('../middleware/auth');

// Get all active DM conversations for current user
router.get('/conversations', authenticateToken, (req, res) => {
  const conversations = DMModel.getConversations(req.user.id);
  res.json({ conversations });
});

// Get messages for a specific conversation with a target user
router.get('/:otherUserId', authenticateToken, (req, res) => {
  const otherUserId = parseInt(req.params.otherUserId, 10);
  const messages = DMModel.getDMMessages(req.user.id, otherUserId);
  const messageIds = messages.map(m => m.id);
  const reactions = ReactionModel.getReactionsForMessages(messageIds);

  const enriched = messages.map(m => ({
    ...m,
    reactions: reactions[m.id] || {}
  }));

  // Mark as read
  DMModel.markAsRead(req.user.id, otherUserId);

  res.json({ messages: enriched });
});

module.exports = router;
