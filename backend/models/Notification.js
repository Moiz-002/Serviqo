const { Schema, model, Types } = require('mongoose');

const notificationSchema = new Schema({
  recipient: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  href: { type: String, default: '/worker/dashboard' },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

module.exports = model('Notification', notificationSchema);
