const { Server } = require('socket.io');
const { verifySocketToken } = require('../middleware/auth');
const config = require('../config/config');

// Socket Sub-Handlers
const registerPresenceHandlers = require('./presenceSocket');
const registerChatHandlers = require('./chatSocket');
const registerDMHandlers = require('./dmSocket');
const registerGroupHandlers = require('./groupSocket');
const registerTypingHandlers = require('./typingSocket');

function initializeSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 20000,
    pingInterval: 10000
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const user = verifySocketToken(token);
    if (!user) {
      return next(new Error('Invalid or expired socket credentials'));
    }

    socket.user = user;
    next();
  });

  io.on('connection', (socket) => {
    // Join personal notification channel
    socket.join(`user:${socket.user.id}`);

    // Register modular socket domains
    registerPresenceHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerDMHandlers(io, socket);
    registerGroupHandlers(io, socket);
    registerTypingHandlers(io, socket);

    socket.on('disconnect', () => {
      // Handled in presenceSocket
    });
  });

  return io;
}

module.exports = initializeSockets;
