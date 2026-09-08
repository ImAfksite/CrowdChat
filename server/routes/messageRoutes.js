const express = require('express');
const router = express.Router();
const MessageModel = require('../models/messageModel');
const ReactionModel = require('../models/reactionModel');
const { authenticateToken } = require('../middleware/auth');

// Get channel message history with reactions
router.get('/channel/:channelId', authenticateToken, (req, res) => {
  const { channelId } = req.params;
  const { limit, before } = req.query;

  const messages = MessageModel.getChannelMessages(
    parseInt(channelId, 10),
    parseInt(limit || '50', 10),
    before ? parseInt(before, 10) : null
  );

  const messageIds = messages.map(m => m.id);
  const reactions = ReactionModel.getReactionsForMessages(messageIds);

  const enriched = messages.map(m => ({
    ...m,
    reactions: reactions[m.id] || {}
  }));

  res.json({ messages: enriched });
});

// Search messages
router.get('/search', authenticateToken, (req, res) => {
  const { q, channelId } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }
  const results = MessageModel.search(q.trim(), channelId ? parseInt(channelId, 10) : null);
  res.json({ results });
});

module.exports = router;
