const express = require('express');
const router = express.Router();
const ChannelModel = require('../models/channelModel');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminCheck');
const ModerationModel = require('../models/moderationModel');

// Get all public channels
router.get('/', authenticateToken, (req, res) => {
  const channels = ChannelModel.getAll();
  res.json({ channels });
});

// Admin only: create a new public channel
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, topic, isReadOnly } = req.body;
    if (!name) return res.status(400).json({ error: 'Channel name is required' });

    const channel = ChannelModel.create({
      name,
      topic,
      isReadOnly: !!isReadOnly,
      createdBy: req.user.id
    });

    ModerationModel.logAudit(req.user.id, 'CREATE_CHANNEL', 'channel', channel.id, `Created #${channel.name}`);
    res.status(201).json({ channel });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not create channel' });
  }
});

module.exports = router;
