const { Server } = require('socket.io');
const { verifyToken } = require('./auth');
const Job = require('../models/Job');
const Conversation = require('../models/Conversation');
const { configureRealtime } = require('./realtime');

function getHandshakeToken(socket) {
  const authToken = socket.handshake.auth?.token;
  const authorization = socket.handshake.headers.authorization;
  const cookieToken = socket.handshake.headers.cookie
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('token='))
    ?.slice('token='.length);
  return authToken || authorization?.replace(/^Bearer\s+/i, '') || cookieToken;
}

function configureSocketServer(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const user = verifyToken(getHandshakeToken(socket));
    if (!user) return next(new Error('Unauthorized'));
    socket.user = user;
    return next();
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user._id);
    socket.join(`user:${userId}`);

    socket.on('job:join', async (jobId, acknowledge) => {
      try {
        const job = await Job.findById(jobId).select('customer assignedWorker status');
        const allowed = job && (
          socket.user.role === 'admin' ||
          String(job.customer) === userId ||
          String(job.assignedWorker) === userId ||
          (socket.user.role === 'worker' && job.status === 'open')
        );
        if (!allowed) return acknowledge?.({ ok: false, error: 'Forbidden' });
        socket.join(`job:${jobId}`);
        return acknowledge?.({ ok: true });
      } catch (error) {
        return acknowledge?.({ ok: false, error: 'Unable to join job room' });
      }
    });

    socket.on('conversation:join', async (conversationId, acknowledge) => {
      const conversation = await Conversation.exists({
        _id: conversationId,
        participants: socket.user._id,
      });
      if (!conversation) return acknowledge?.({ ok: false, error: 'Forbidden' });
      socket.join(`conversation:${conversationId}`);
      return acknowledge?.({ ok: true });
    });
  });

  configureRealtime(io);
  return io;
}

module.exports = configureSocketServer;
