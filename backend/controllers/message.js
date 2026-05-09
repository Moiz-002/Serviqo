const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

async function getConversations(req, res) {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name profilePicture role')
    .populate('job', 'title status')
    .sort({ lastMessageAt: -1 });

  return res.json({ conversations });
}

async function getOrCreateConversation(req, res) {
  const { participantId, jobId } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, participantId] },
    ...(jobId && { job: jobId }),
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, participantId],
      ...(jobId && { job: jobId }),
    });
  }

  await conversation.populate('participants', 'name profilePicture role');
  if (conversation.job) await conversation.populate('job', 'title status');

  return res.json({ conversation });
}

async function getMessages(req, res) {
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    participants: req.user._id,
  });

  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

  const messages = await Message.find({ conversation: req.params.conversationId })
    .populate('sender', 'name profilePicture')
    .sort({ createdAt: 1 });

  await Message.updateMany(
    { conversation: req.params.conversationId, sender: { $ne: req.user._id }, isRead: false },
    { isRead: true }
  );

  return res.json({ messages });
}

async function sendMessage(req, res) {
  const { text } = req.body;

  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    participants: req.user._id,
  });

  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

  const message = await Message.create({
    conversation: req.params.conversationId,
    sender: req.user._id,
    text,
  });

  conversation.lastMessage = text;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  await message.populate('sender', 'name profilePicture');

  return res.status(201).json({ message });
}

module.exports = { getConversations, getOrCreateConversation, getMessages, sendMessage };
