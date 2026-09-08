const GroupModel = require('../models/groupModel');
const ReactionModel = require('../models/reactionModel');
const { sanitizeAndValidateContent } = require('../services/moderationService');

function registerGroupHandlers(io, socket) {
  socket.on('group:join', (groupId) => {
    if (GroupModel.isMember(groupId, socket.user.id)) {
      socket.join(`group:${groupId}`);
    }
  });

  socket.on('group:send_message', (data, callback) => {
    try {
      const { groupId, content, attachmentUrl, attachmentType, replyToId } = data;

      if (!GroupModel.isMember(groupId, socket.user.id)) {
        return callback?.({ error: 'Not a member of this group.' });
      }

      const val = sanitizeAndValidateContent(content);
      if (!val.valid) return callback?.({ error: val.error });

      const newMsg = GroupModel.sendMessage({
        groupId,
        senderId: socket.user.id,
        content: val.sanitized,
        attachmentUrl,
        attachmentType,
        replyToId
      });

      const payload = { ...newMsg, reactions: {} };
      io.to(`group:${groupId}`).emit('group:new_message', payload);
      callback?.({ success: true, message: payload });
    } catch (err) {
      callback?.({ error: err.message });
    }
  });

  socket.on('group:toggle_reaction', (data) => {
    const { messageId, emoji, groupId } = data;
    ReactionModel.toggleReaction(messageId, socket.user.id, emoji);

    const updatedReactions = ReactionModel.getReactionsForMessages([messageId]);
    io.to(`group:${groupId}`).emit('group:reaction_updated', {
      messageId,
      reactions: updatedReactions[messageId] || {}
    });
  });
}

module.exports = registerGroupHandlers;
