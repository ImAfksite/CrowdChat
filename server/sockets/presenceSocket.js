// Active connected sockets
const onlineUsers = new Map(); // userId -> Set(socketId)
const userStatusMap = new Map(); // userId -> 'online' | 'idle' | 'dnd'

// Active Room Tracker: socketId -> { userId, user, roomId }
const socketRoomMap = new Map();
// roomId -> Map(userId, userObject)
const roomRosters = new Map();

function broadcastRoomRoster(io, roomId) {
  const rosterMap = roomRosters.get(roomId);
  const roster = rosterMap ? Array.from(rosterMap.values()) : [];
  io.to(`room:${roomId}`).emit('room:roster', { roomId, members: roster });
}

function registerPresenceHandlers(io, socket) {
  const userId = socket.user.id;

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
    userStatusMap.set(userId, 'online');
  }
  onlineUsers.get(userId).add(socket.id);

  io.emit('presence:update', {
    userId,
    status: userStatusMap.get(userId),
    online: true,
  });

  socket.on('presence:request_all', () => {
    const presenceList = {};
    for (const [uId] of onlineUsers.entries()) {
      presenceList[uId] = userStatusMap.get(uId) || 'online';
    }
    socket.emit('presence:sync', presenceList);
  });

  // Switch Active Room (user can only be in ONE chat at a time)
  socket.on('room:join_chat', (roomId) => {
    // 1. Leave previous active room if any
    const previous = socketRoomMap.get(socket.id);
    if (previous && previous.roomId !== roomId) {
      socket.leave(`room:${previous.roomId}`);
      const prevRoster = roomRosters.get(previous.roomId);
      if (prevRoster) {
        prevRoster.delete(userId);
        if (prevRoster.size === 0) roomRosters.delete(previous.roomId);
        broadcastRoomRoster(io, previous.roomId);
      }
    }

    // 2. Join new room
    socket.join(`room:${roomId}`);
    if (!roomRosters.has(roomId)) {
      roomRosters.set(roomId, new Map());
    }

    const userData = {
      id: socket.user.id,
      username: socket.user.username,
      display_name: socket.user.display_name,
      avatar_url: socket.user.avatar_url,
      role: socket.user.role,
      accent_color: socket.user.accent_color,
    };

    roomRosters.get(roomId).set(userId, userData);
    socketRoomMap.set(socket.id, { userId, roomId, user: userData });

    broadcastRoomRoster(io, roomId);
  });

  socket.on('disconnect', () => {
    // Clean up room roster
    const current = socketRoomMap.get(socket.id);
    if (current) {
      socketRoomMap.delete(socket.id);
      const roster = roomRosters.get(current.roomId);
      if (roster) {
        roster.delete(userId);
        if (roster.size === 0) roomRosters.delete(current.roomId);
        broadcastRoomRoster(io, current.roomId);
      }
    }

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
