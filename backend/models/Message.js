const { Schema, model, Types } = require('mongoose');

const messageSchema = new Schema({
  conversation: { type: Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  deliveryStatus: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
}, { timestamps: true });

messageSchema.index({ conversation: 1, sender: 1, isRead: 1 });

const Message = model('Message', messageSchema);

module.exports = Message;
