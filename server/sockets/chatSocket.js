const MessageModel = require('../models/messageModel');
const ReactionModel = require('../models/reactionModel');
const ChannelModel = require('../models/channelModel');
const { checkMessageRateLimit } = require('../middleware/rateLimiter');
const { sanitizeAndValidateContent, isUserMuted } = require('../services/moderationService');

function registerChatHandlers(io, socket) {
  // Join Channel Room
  socket.on('channel:join', (channelId) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on('channel:leave', (channelId) => {
    socket.leave(`channel:${channelId}`);
  });

  // Send Message in Public Channel
  socket.on('chat:send_message', async (data, callback) => {
    try {
      const { channelId, content, attachmentUrl, attachmentType, replyToId } = data;

      if (isUserMuted(socket.user)) {
        return callback?.({ error: 'You are currently muted by a moderator.' });
      }

      if (!checkMessageRateLimit(socket.user.id)) {
        return callback?.({ error: 'You are sending messages too quickly! Please slow down.' });
      }

      const channel = ChannelModel.findById(channelId);
      if (!channel) return callback?.({ error: 'Channel not found' });
      if (channel.is_read_only && socket.user.role !== 'admin') {
        return callback?.({ error: 'This channel is read-only.' });
      }

      const val = sanitizeAndValidateContent(content);
      if (!val.valid) {
        return callback?.({ error: val.error });
      }

      const newMsg = MessageModel.createChannelMessage({
        channelId,
        senderId: socket.user.id,
        content: val.sanitized,
        attachmentUrl,
        attachmentType,
        replyToId
      });

      const messagePayload = {
        ...newMsg,
        reactions: {}
      };

      io.to(`channel:${channelId}`).emit('chat:new_message', messagePayload);
      callback?.({ success: true, message: messagePayload });
    } catch (err) {
      callback?.({ error: err.message || 'Failed to send message' });
    }
  });

  // Edit Message
  socket.on('chat:edit_message', (data, callback) => {
    try {
      const { messageId, content } = data;
      const val = sanitizeAndValidateContent(content);
      if (!val.valid) return callback?.({ error: val.error });

      const updated = MessageModel.editMessage(messageId, socket.user.id, val.sanitized);
      if (!updated) return callback?.({ error: 'Cannot edit message' });

      if (updated.channel_id) {
        io.to(`channel:${updated.channel_id}`).emit('chat:message_updated', updated);
      }
      callback?.({ success: true, message: updated });
    } catch (err) {
      callback?.({ error: err.message });
    }
  });

  // Delete Message
  socket.on('chat:delete_message', (data, callback) => {
    try {
      const { messageId } = data;
      const isStaff = socket.user.role === 'admin' || socket.user.role === 'moderator';
      const deleted = MessageModel.deleteMessage(messageId, socket.user.id, isStaff);

      if (deleted && deleted.channel_id) {
        io.to(`channel:${deleted.channel_id}`).emit('chat:message_deleted', {
          messageId,
          channelId: deleted.channel_id,
          isDeleted: true
        });
      }
      callback?.({ success: true });
    } catch (err) {
      callback?.({ error: err.message });
    }
  });

  // Toggle Reaction
  socket.on('chat:toggle_reaction', (data) => {
    const { messageId, emoji, channelId } = data;
    ReactionModel.toggleReaction(messageId, socket.user.id, emoji);

    const updatedReactions = ReactionModel.getReactionsForMessages([messageId]);
    io.to(`channel:${channelId}`).emit('chat:reaction_updated', {
      messageId,
      reactions: updatedReactions[messageId] || {}
    });
  });
}

module.exports = registerChatHandlers;
