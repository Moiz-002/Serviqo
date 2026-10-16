let io;
const Notification = require('../models/Notification');

function configureRealtime(socketServer) {
  io = socketServer;
  return io;
}

function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${String(userId)}`).emit(event, payload);
}

function emitToUsers(userIds, event, payload) {
  [...new Set(userIds.filter(Boolean).map(String))].forEach((userId) => {
    emitToUser(userId, event, payload);
  });
}

async function createNotification(recipient, values) {
  const notification = await Notification.create({ recipient, ...values });
  emitToUser(recipient, 'notification:created', notification.toObject());
  return notification;
}

module.exports = { configureRealtime, emitToUser, emitToUsers, createNotification };
