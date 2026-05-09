const { Schema, model, Types } = require('mongoose');

const messageSchema = new Schema({
  conversation: { type: Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Message = model('Message', messageSchema);

module.exports = Message;
