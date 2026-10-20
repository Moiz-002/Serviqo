const { Schema, model, Types } = require('mongoose');

const messageSchema = new Schema({
  conversation: { type: Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  imageUrl: { type: String },
  isRead: { type: Boolean, default: false },
  deliveryStatus: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
}, { timestamps: true });

messageSchema.pre('validate', function validateMessageContent(next) {
  if (!this.text?.trim() && !this.imageUrl) {
    this.invalidate('text', 'A message must contain text or an image');
  }
  next();
});

messageSchema.index({ conversation: 1, sender: 1, isRead: 1 });

const Message = model('Message', messageSchema);

module.exports = Message;
