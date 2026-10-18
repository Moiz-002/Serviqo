const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Job = require('../models/Job');
const { emitToUser, emitToUsers } = require('../services/realtime');

async function getConversations(req, res) {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name profilePicture role')
    .populate('job', 'title status')
    .sort({ lastMessageAt: -1 });
  const unreadCounts = conversations.length
    ? await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversations.map((conversation) => conversation._id) },
          sender: { $ne: new mongoose.Types.ObjectId(String(req.user._id)) },
          isRead: { $ne: true },
        },
      },
      { $group: { _id: '$conversation', unreadCount: { $sum: 1 } } },
    ])
    : [];
  const unreadByConversation = new Map(
    unreadCounts.map(({ _id, unreadCount }) => [String(_id), unreadCount]),
  );

  return res.json({
    conversations: conversations.map((conversation) => ({
      ...conversation.toObject(),
      unreadCount: unreadByConversation.get(String(conversation._id)) || 0,
    })),
  });
}

async function getOrCreateConversation(req, res) {
  const { participantId, jobId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(participantId) || String(participantId) === String(req.user._id)) {
    return res.status(400).json({ error: 'A valid other participant is required' });
  }
  if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ error: 'Invalid job ID' });
  }

  const otherParticipant = await User.findById(participantId).select('role isActive isVerified cnicVerified');
  if (!otherParticipant || !otherParticipant.isActive) {
    return res.status(404).json({ error: 'Participant not found' });
  }
  const rolesAllowed = (req.user.role === 'customer' && otherParticipant.role === 'worker')
    || (req.user.role === 'worker' && otherParticipant.role === 'customer');
  if (!rolesAllowed) return res.status(403).json({ error: 'Messaging is limited to customers and workers' });

  if (jobId) {
    const job = await Job.findById(jobId).select('customer assignedWorker status');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const isCustomerOwner = req.user.role === 'customer'
      && String(job.customer) === String(req.user._id);
    const isOwnersAssignedWorker = isCustomerOwner
      && String(job.assignedWorker) === String(participantId);
    const isAssignedWorker = req.user.role === 'worker'
      && String(job.assignedWorker) === String(req.user._id)
      && String(otherParticipant._id) === String(job.customer);
    const isEligibleRecommendedWorker = isCustomerOwner
      && job.status === 'open'
      && otherParticipant.role === 'worker'
      && otherParticipant.isVerified
      && otherParticipant.cnicVerified;
    if (!isAssignedWorker && !isOwnersAssignedWorker && !isEligibleRecommendedWorker) {
      return res.status(403).json({ error: 'You cannot start a conversation for this job' });
    }
  }

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

  const unreadMessages = await Message.find({
    conversation: req.params.conversationId,
    sender: { $ne: req.user._id },
    isRead: { $ne: true },
  }).select('_id sender');

  if (unreadMessages.length) {
    await Message.updateMany(
      { _id: { $in: unreadMessages.map((message) => message._id) } },
      { $set: { isRead: true, deliveryStatus: 'read' } },
    );
    emitToUsers(
      [...new Set(unreadMessages.map((message) => String(message.sender)))],
      'message:status',
      {
        conversationId: String(conversation._id),
        messageIds: unreadMessages.map((message) => String(message._id)),
        status: 'read',
      },
    );
  }

  const messages = await Message.find({ conversation: req.params.conversationId })
    .populate('sender', 'name profilePicture')
    .sort({ createdAt: 1 });

  return res.json({ messages });
}

async function sendMessage(req, res) {
  const text = typeof req.body.text === 'string' ? req.body.text : req.body.content;
  if (!text?.trim()) return res.status(400).json({ error: 'Message text is required' });

  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    participants: req.user._id,
  });

  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

  const message = await Message.create({
    conversation: req.params.conversationId,
    sender: req.user._id,
    text: text.trim(),
  });

  conversation.lastMessage = text.trim();
  conversation.lastMessageAt = new Date();
  await conversation.save();

  await message.populate('sender', 'name profilePicture');
  emitToUser(req.user._id, 'message:sent', {
    conversationId: String(conversation._id),
    message,
  });
  emitToUsers(
    conversation.participants.filter((participant) => String(participant) !== String(req.user._id)),
    'message:created',
    { conversationId: String(conversation._id), message },
  );

  return res.status(201).json({ message });
}

module.exports = { getConversations, getOrCreateConversation, getMessages, sendMessage };
