let io;
const Notification = require('../models/Notification');
const { pushSafely } = require('./push');

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
  pushSafely([recipient], {
    title: notification.title,
    body: notification.message,
    data: {
      type: notification.type,
      href: notification.href,
      notificationId: String(notification._id),
    },
  });
  return notification;
}

async function notifySafely(recipient, values) {
  if (!recipient) return null;
  try {
    return await createNotification(recipient, values);
  } catch (error) {
    console.error('Unable to create notification:', error.message);
    return null;
  }
}

module.exports = {
  configureRealtime,
  emitToUser,
  emitToUsers,
  createNotification,
  notifySafely,
};
