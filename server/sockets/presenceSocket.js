// Active connected sockets map: userId -> Set of socketIds
const onlineUsers = new Map();
const userStatusMap = new Map(); // userId -> 'online' | 'idle' | 'dnd'

function registerPresenceHandlers(io, socket) {
  const userId = socket.user.id;

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
    userStatusMap.set(userId, 'online');
  }
  onlineUsers.get(userId).add(socket.id);

  // Broadcast presence update
  io.emit('presence:update', {
    userId,
    status: userStatusMap.get(userId),
    online: true,
  });

  // Send full initial list to freshly connected client
  socket.on('presence:request_all', () => {
    const presenceList = {};
    for (const [uId] of onlineUsers.entries()) {
      presenceList[uId] = userStatusMap.get(uId) || 'online';
    }
    socket.emit('presence:sync', presenceList);
  });

  socket.on('presence:set_status', (status) => {
    if (['online', 'idle', 'dnd'].includes(status)) {
      userStatusMap.set(userId, status);
      io.emit('presence:update', {
        userId,
        status,
        online: true
      });
    }
  });

  socket.on('disconnect', () => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        userStatusMap.delete(userId);
        io.emit('presence:update', {
          userId,
          status: 'offline',
          online: false
        });
      }
    }
  });
}

module.exports = registerPresenceHandlers;
