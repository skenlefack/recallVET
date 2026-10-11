const jwt = require('jsonwebtoken');
const logger = require('../services/logger');

let io = null;

module.exports = {
  init(server) {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGINS
          ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
          : '*',
        credentials: true
      }
    });

    // Authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.tenantId = decoded.tenantId || null;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      logger.info(`Socket connected: user ${socket.userId}`);

      // Join user-specific room
      socket.join(`user_${socket.userId}`);

      // Join tenant room if available
      if (socket.tenantId) {
        socket.join(`tenant_${socket.tenantId}`);
      }

      socket.on('join_tenant', (tenantId) => {
        socket.join(`tenant_${tenantId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: user ${socket.userId}`);
      });
    });

    return io;
  },

  getIO() {
    return io;
  }
};
