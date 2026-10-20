const Notification = require('../models/Notification');
const { Types } = require('mongoose');
const { registerDeviceToken, removeDeviceToken } = require('../services/push');

const DEVICE_PLATFORMS = new Set(['android', 'ios', 'web']);

function validateDeviceToken(token) {
  return typeof token === 'string' && token.length >= 20 && token.length <= 4096;
}

async function getNotifications(req, res) {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    Notification.countDocuments({ recipient: req.user._id, read: false }),
  ]);
  return res.json({ notifications, unreadCount });
}

async function markNotificationsRead(req, res) {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { $set: { read: true } },
  );
  return res.json({ message: 'Notifications marked as read' });
}

async function markNotificationRead(req, res) {
  if (!Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid notification ID' });
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { $set: { read: true } },
    { new: true },
  ).lean();

  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  return res.json({ notification });
}

async function deleteNotification(req, res) {
  if (!Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid notification ID' });
  }

  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  }).lean();

  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  return res.json({ message: 'Notification removed' });
}

async function registerNotificationDevice(req, res) {
  const { token, platform } = req.body || {};
  if (!validateDeviceToken(token)) {
    return res.status(400).json({ error: 'Device token must be a string between 20 and 4,096 characters' });
  }
  await registerDeviceToken(
    req.user._id,
    token,
    DEVICE_PLATFORMS.has(platform) ? platform : 'android',
  );
  return res.json({ message: 'Device token registered' });
}

async function removeNotificationDevice(req, res) {
  const { token } = req.body || {};
  if (!validateDeviceToken(token)) {
    return res.status(400).json({ error: 'Device token must be a string between 20 and 4,096 characters' });
  }
  await removeDeviceToken(req.user._id, token);
  return res.json({ message: 'Device token removed' });
}

module.exports = {
  getNotifications,
  markNotificationsRead,
  markNotificationRead,
  deleteNotification,
  registerNotificationDevice,
  removeNotificationDevice,
};
