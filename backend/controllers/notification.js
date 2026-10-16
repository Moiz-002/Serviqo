const Notification = require('../models/Notification');

async function getNotifications(req, res) {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
  return res.json({ notifications });
}

async function markNotificationsRead(req, res) {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { $set: { read: true } },
  );
  return res.json({ message: 'Notifications marked as read' });
}

module.exports = { getNotifications, markNotificationsRead };
