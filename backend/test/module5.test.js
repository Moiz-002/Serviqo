const test = require('node:test');
const assert = require('node:assert/strict');

const Message = require('../models/Message');
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
