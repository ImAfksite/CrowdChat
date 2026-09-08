const express = require('express');
const router = express.Router();
const GroupModel = require('../models/groupModel');
const ReactionModel = require('../models/reactionModel');
const { authenticateToken } = require('../middleware/auth');

// Get user's groups
router.get('/', authenticateToken, (req, res) => {
  const groups = GroupModel.getUserGroups(req.user.id);
  res.json({ groups });
});

// Create new group (max 10 members)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, iconUrl, memberIds } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = GroupModel.create({
      name: name.trim(),
      iconUrl,
      ownerId: req.user.id,
      initialMemberIds: Array.isArray(memberIds) ? memberIds : []
    });

    res.status(201).json({ group });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get group messages
router.get('/:groupId/messages', authenticateToken, (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  if (!GroupModel.isMember(groupId, req.user.id)) {
    return res.status(403).json({ error: 'You are not a member of this group' });
  }

  const messages = GroupModel.getMessages(groupId);
  const messageIds = messages.map(m => m.id);
  const reactions = ReactionModel.getReactionsForMessages(messageIds);

  const enriched = messages.map(m => ({
    ...m,
    reactions: reactions[m.id] || {}
  }));

  res.json({ messages: enriched });
});

// Get group members
router.get('/:groupId/members', authenticateToken, (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  if (!GroupModel.isMember(groupId, req.user.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const members = GroupModel.getMembers(groupId);
  res.json({ members });
});

// Add member to group
router.post('/:groupId/members', authenticateToken, (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);
    const { userId } = req.body;
    if (!GroupModel.isMember(groupId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    GroupModel.addMember(groupId, userId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Leave / Remove member from group
router.delete('/:groupId/members/:userId', authenticateToken, (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  const targetUserId = parseInt(req.params.userId, 10);
  const group = GroupModel.getById(groupId);

  if (!group) return res.status(404).json({ error: 'Group not found' });

  // Can leave themselves or owner can kick
  if (req.user.id !== targetUserId && req.user.id !== group.owner_id) {
    return res.status(403).json({ error: 'Only the group owner can remove members' });
  }

  GroupModel.removeMember(groupId, targetUserId);
  res.json({ success: true });
});

module.exports = router;
