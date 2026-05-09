const { Schema, model, Types } = require('mongoose');

const conversationSchema = new Schema({
  participants: [{ type: Types.ObjectId, ref: 'User' }],
  job: { type: Types.ObjectId, ref: 'Job' },
  lastMessage: { type: String },
  lastMessageAt: { type: Date },
}, { timestamps: true });

const Conversation = model('Conversation', conversationSchema);

module.exports = Conversation;
