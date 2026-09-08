const DMModel = require('../models/dmModel');
const ReactionModel = require('../models/reactionModel');
const { checkMessageRateLimit } = require('../middleware/rateLimiter');
const { sanitizeAndValidateContent, isUserMuted } = require('../services/moderationService');

function registerDMHandlers(io, socket) {
  // Join DM conversation
  socket.on('dm:join', (otherUserId) => {
    const minId = Math.min(socket.user.id, otherUserId);
    const maxId = Math.max(socket.user.id, otherUserId);
    socket.join(`dm:${minId}_${maxId}`);
  });

  // Send Direct Message
  socket.on('dm:send_message', (data, callback) => {
    try {
      const { recipientId, content, attachmentUrl, attachmentType, replyToId } = data;

      if (isUserMuted(socket.user)) {
        return callback?.({ error: 'You are currently muted.' });
      }

      if (!checkMessageRateLimit(socket.user.id)) {
        return callback?.({ error: 'Sending too quickly.' });
      }

      if (DMModel.isBlocked(socket.user.id, recipientId)) {
        return callback?.({ error: 'Cannot message this user.' });
      }

      const val = sanitizeAndValidateContent(content);
      if (!val.valid) return callback?.({ error: val.error });

      const newMsg = DMModel.sendDM({
        senderId: socket.user.id,
        recipientId,
        content: val.sanitized,
        attachmentUrl,
        attachmentType,
        replyToId
      });

      const minId = Math.min(socket.user.id, recipientId);
      const maxId = Math.max(socket.user.id, recipientId);

      const payload = { ...newMsg, reactions: {} };

      // Broadcast to DM room
      io.to(`dm:${minId}_${maxId}`).emit('dm:new_message', payload);

      // Trigger instant push notification alert to recipient's personal user room
      io.to(`user:${recipientId}`).emit('notification:dm', {
        fromUser: socket.user,
        message: payload
      });

      callback?.({ success: true, message: payload });
    } catch (err) {
      callback?.({ error: err.message });
    }
  });

  // DM Reaction
  socket.on('dm:toggle_reaction', (data) => {
    const { messageId, emoji, otherUserId } = data;
    ReactionModel.toggleReaction(messageId, socket.user.id, emoji);

    const minId = Math.min(socket.user.id, otherUserId);
    const maxId = Math.max(socket.user.id, otherUserId);

    const updatedReactions = ReactionModel.getReactionsForMessages([messageId]);
    io.to(`dm:${minId}_${maxId}`).emit('dm:reaction_updated', {
      messageId,
      reactions: updatedReactions[messageId] || {}
    });
  });
}

module.exports = registerDMHandlers;
