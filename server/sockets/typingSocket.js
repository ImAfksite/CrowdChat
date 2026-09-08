function registerTypingHandlers(io, socket) {
  socket.on('typing:start', (data) => {
    const { channelId, dmUserId, groupId } = data;

    const payload = {
      userId: socket.user.id,
      username: socket.user.username,
      displayName: socket.user.display_name
    };

    if (channelId) {
      socket.to(`channel:${channelId}`).emit('typing:display', { ...payload, channelId });
    } else if (dmUserId) {
      const minId = Math.min(socket.user.id, dmUserId);
      const maxId = Math.max(socket.user.id, dmUserId);
      socket.to(`dm:${minId}_${maxId}`).emit('typing:display', { ...payload, dmUserId: socket.user.id });
    } else if (groupId) {
      socket.to(`group:${groupId}`).emit('typing:display', { ...payload, groupId });
    }
  });

  socket.on('typing:stop', (data) => {
    const { channelId, dmUserId, groupId } = data;
    const payload = { userId: socket.user.id };

    if (channelId) {
      socket.to(`channel:${channelId}`).emit('typing:hide', { ...payload, channelId });
    } else if (dmUserId) {
      const minId = Math.min(socket.user.id, dmUserId);
      const maxId = Math.max(socket.user.id, dmUserId);
      socket.to(`dm:${minId}_${maxId}`).emit('typing:hide', { ...payload, dmUserId: socket.user.id });
    } else if (groupId) {
      socket.to(`group:${groupId}`).emit('typing:hide', { ...payload, groupId });
    }
  });
}

module.exports = registerTypingHandlers;
