const test = require('node:test');
const assert = require('node:assert/strict');

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const messageController = require('../controllers/message');

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
}

test('message submission requires non-empty text or content', async () => {
  const originalCreate = Message.create;
  let created = false;
  Message.create = async () => {
    created = true;
    return null;
  };

  const res = response();
  await messageController.sendMessage({
    body: { content: '   ' },
    params: { conversationId: 'conversation-id' },
    user: { _id: 'user-id' },
  }, res);

  Message.create = originalCreate;
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Message text is required');
  assert.equal(created, false);
});

test('message documents require text or an image attachment', async () => {
  const messageFields = {
    conversation: '66d6a2e5e5d00a507b2b7f20',
    sender: '66d6a2e5e5d00a507b2b7f21',
  };

  await assert.doesNotReject(() => new Message({
    ...messageFields,
    imageUrl: 'https://res.cloudinary.com/serviqo/image/upload/serviqo/chat/photo.webp',
  }).validate());
  await assert.rejects(() => new Message({
    ...messageFields,
    text: '   ',
  }).validate(), /A message must contain text or an image/);
});

test('image-only message stores its Cloudinary URL and updates the conversation preview', async (t) => {
  const conversationId = '66d6a2e5e5d00a507b2b7f20';
  const senderId = '66d6a2e5e5d00a507b2b7f21';
  const recipientId = '66d6a2e5e5d00a507b2b7f23';
  const conversation = {
    _id: conversationId,
    participants: [senderId, recipientId],
    save: async () => {},
  };
  t.mock.method(Conversation, 'findOne', async () => conversation);
  let createdMessage;
  t.mock.method(Message, 'create', async (data) => {
    createdMessage = {
      ...data,
      _id: '66d6a2e5e5d00a507b2b7f24',
      populate: async () => {},
    };
    return createdMessage;
  });
  const res = response();
  await messageController.sendMessage({
    body: {},
    file: { path: 'https://res.cloudinary.com/serviqo/image/upload/serviqo/chat/photo.webp' },
    params: { conversationId },
    user: { _id: senderId, role: 'customer', name: 'Customer' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(createdMessage.text, '');
  assert.equal(createdMessage.imageUrl, 'https://res.cloudinary.com/serviqo/image/upload/serviqo/chat/photo.webp');
  assert.equal(conversation.lastMessage, 'Image attachment');
  assert.equal(res.body.message.imageUrl, createdMessage.imageUrl);
});

test('sending a message does not persist a notification document', async (t) => {
  const conversationId = '66d6a2e5e5d00a507b2b7f20';
  const senderId = '66d6a2e5e5d00a507b2b7f21';
  const recipientId = '66d6a2e5e5d00a507b2b7f23';
  const conversation = {
    _id: conversationId,
    participants: [senderId, recipientId],
    save: async () => {},
  };
  t.mock.method(Conversation, 'findOne', async () => conversation);
  t.mock.method(Message, 'create', async (data) => ({
    ...data,
    _id: '66d6a2e5e5d00a507b2b7f24',
    populate: async () => {},
  }));
  const createNotification = t.mock.method(Notification, 'create', async (data) => data);
  const res = response();

  await messageController.sendMessage({
    body: { text: 'Hello there' },
    params: { conversationId },
    user: { _id: senderId, role: 'customer', name: 'Customer' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(createNotification.mock.calls.length, 0);
});

test('conversation list includes per-conversation unread message counts', async (t) => {
  const conversation = {
    _id: '66d6a2e5e5d00a507b2b7f20',
    toObject: () => ({ _id: '66d6a2e5e5d00a507b2b7f20', lastMessage: 'Hello' }),
  };
  t.mock.method(Conversation, 'find', () => ({
    populate() { return this; },
    sort: async () => [conversation],
  }));
  t.mock.method(Message, 'aggregate', async () => [{
    _id: conversation._id,
    unreadCount: 3,
  }]);

  const res = response();
  await messageController.getConversations({
    user: { _id: '66d6a2e5e5d00a507b2b7f21' },
  }, res);

  assert.equal(res.body.conversations[0].unreadCount, 3);
});

test('opening a conversation marks received messages read and returns their read status', async (t) => {
  const conversationId = '66d6a2e5e5d00a507b2b7f20';
  const userId = '66d6a2e5e5d00a507b2b7f21';
  const unread = [{ _id: '66d6a2e5e5d00a507b2b7f22', sender: '66d6a2e5e5d00a507b2b7f23' }];
  const updatedMessage = { ...unread[0], deliveryStatus: 'read', isRead: true };
  t.mock.method(Conversation, 'findOne', async () => ({ _id: conversationId }));
  let findCalls = 0;
  t.mock.method(Message, 'find', () => {
    findCalls += 1;
    if (findCalls === 1) {
      return { select: async () => unread };
    }
    return {
      populate() { return this; },
      sort: async () => [updatedMessage],
    };
  });
  let update;
  t.mock.method(Message, 'updateMany', async (_filter, values) => {
    update = values;
  });

  const res = response();
  await messageController.getMessages({
    params: { conversationId },
    user: { _id: userId },
  }, res);

  assert.equal(update.$set.isRead, true);
  assert.equal(update.$set.deliveryStatus, 'read');
  assert.equal(res.body.messages[0].deliveryStatus, 'read');
  assert.equal(res.body.messages[0].isRead, true);
});

test('conversation creation rejects messaging an account with the same user ID', async () => {
  const res = response();
  await messageController.getOrCreateConversation({
    body: { participantId: '66d6a2e5e5d00a507b2b7f21' },
    user: { _id: '66d6a2e5e5d00a507b2b7f21', role: 'customer' },
  }, res);

  assert.equal(res.statusCode, 400);
});

test('customer can start a job-scoped conversation with a verified recommended worker', async (t) => {
  const customerId = '66d6a2e5e5d00a507b2b7f21';
  const workerId = '66d6a2e5e5d00a507b2b7f23';
  const jobId = '66d6a2e5e5d00a507b2b7f24';
  t.mock.method(User, 'findById', () => ({
    select: async () => ({
      _id: workerId,
      role: 'worker',
      isActive: true,
      isVerified: true,
      cnicVerified: true,
    }),
  }));
  t.mock.method(Job, 'findById', () => ({
    select: async () => ({
      customer: customerId,
      status: 'open',
    }),
  }));
  t.mock.method(Conversation, 'findOne', async () => null);
  let created;
  t.mock.method(Conversation, 'create', async (data) => {
    created = data;
    return {
      ...data,
      populate: async () => {},
    };
  });

  const res = response();
  await messageController.getOrCreateConversation({
    body: { participantId: workerId, jobId },
    user: { _id: customerId, role: 'customer' },
  }, res);

  assert.deepEqual(created.participants, [customerId, workerId]);
  assert.equal(created.job, jobId);
  assert.equal(res.statusCode, 200);
});

test('customer can message the worker assigned to their job after its status changes', async (t) => {
  const customerId = '66d6a2e5e5d00a507b2b7f21';
  const workerId = '66d6a2e5e5d00a507b2b7f23';
  const jobId = '66d6a2e5e5d00a507b2b7f24';
  t.mock.method(User, 'findById', () => ({
    select: async () => ({ _id: workerId, role: 'worker', isActive: true }),
  }));
  t.mock.method(Job, 'findById', () => ({
    select: async () => ({
      customer: customerId,
      assignedWorker: workerId,
      status: 'completed',
    }),
  }));
  t.mock.method(Conversation, 'findOne', async () => null);
  let created;
  t.mock.method(Conversation, 'create', async (data) => {
    created = data;
    return { ...data, populate: async () => {} };
  });

  const res = response();
  await messageController.getOrCreateConversation({
    body: { participantId: workerId, jobId },
    user: { _id: customerId, role: 'customer' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(created.participants, [customerId, workerId]);
  assert.equal(created.job, jobId);
});
