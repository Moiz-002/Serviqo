const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { verifyToken } = require('./auth');
const { resolveSessionUser, SessionUserError } = require('../middlewares/auth');
const Job = require('../models/Job');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { configureRealtime, emitToUser } = require('./realtime');

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

  io.use(async (socket, next) => {
    try {
      socket.user = await resolveSessionUser(verifyToken(getHandshakeToken(socket)));
      return next();
    } catch (error) {
      if (error instanceof SessionUserError) return next(new Error('Unauthorized'));
      return next(error);
    }
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
      try {
        const conversation = await Conversation.exists({
          _id: conversationId,
          participants: socket.user._id,
        });
        if (!conversation) return acknowledge?.({ ok: false, error: 'Forbidden' });
        socket.join(`conversation:${conversationId}`);
        return acknowledge?.({ ok: true });
      } catch {
        return acknowledge?.({ ok: false, error: 'Unable to join conversation' });
      }
    });

    socket.on('conversation:leave', (conversationId) => {
      if (typeof conversationId === 'string') socket.leave(`conversation:${conversationId}`);
    });

    socket.on('conversation:typing', async ({ conversationId, isTyping } = {}) => {
      if (typeof conversationId !== 'string' || typeof isTyping !== 'boolean') return;
      try {
        const conversation = await Conversation.exists({
          _id: conversationId,
          participants: socket.user._id,
        });
        if (!conversation) return;
        socket.to(`conversation:${conversationId}`).emit('conversation:typing', {
          conversationId,
          userId,
          role: socket.user.role,
          isTyping,
        });
      } catch {
        socket.emit('conversation:error', { error: 'Unable to update typing status' });
      }
    });

    socket.on('message:delivered', async ({ conversationId, messageIds } = {}) => {
      if (
        typeof conversationId !== 'string'
        || !Array.isArray(messageIds)
        || messageIds.length === 0
        || messageIds.length > 100
        || messageIds.some((messageId) => !mongoose.Types.ObjectId.isValid(messageId))
      ) return;
      try {
        const conversation = await Conversation.exists({
          _id: conversationId,
          participants: socket.user._id,
        });
        if (!conversation) return;
        const filter = {
          _id: { $in: messageIds },
          conversation: conversationId,
          sender: { $ne: socket.user._id },
          deliveryStatus: { $nin: ['delivered', 'read'] },
        };
        const deliveredMessages = await Message.find(filter).select('_id sender');
        if (!deliveredMessages.length) return;
        await Message.updateMany(filter, { $set: { deliveryStatus: 'delivered' } });
        emitToMessageSenders(deliveredMessages, conversationId, 'delivered');
      } catch {
        socket.emit('conversation:error', { error: 'Unable to update message delivery status' });
      }
    });
  });

  configureRealtime(io);
  return io;
}

function emitToMessageSenders(messages, conversationId, status) {
  const senders = [...new Set(messages.map((message) => String(message.sender)))];
  senders.forEach((senderId) => {
    const messageIds = messages
      .filter((message) => String(message.sender) === senderId)
      .map((message) => String(message._id));
    emitToUser(senderId, 'message:status', {
      conversationId,
      messageIds,
      status,
    });
  });
}

module.exports = configureSocketServer;
