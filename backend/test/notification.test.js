const test = require('node:test');
const assert = require('node:assert/strict');
const Notification = require('../models/Notification');
const controller = require('../controllers/notification');

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

test('notification list returns notifications and total unread count for the current recipient', async (t) => {
  const recipient = '66d6a2e5e5d00a507b2b7f20';
  t.mock.method(Notification, 'find', () => ({
    sort() { return this; },
    limit() { return this; },
    lean: async () => [{ _id: 'notification-id', read: false }],
  }));
  t.mock.method(Notification, 'countDocuments', async (filter) => {
    assert.deepEqual(filter, { recipient, read: false });
    return 4;
  });

  const res = response();
  await controller.getNotifications({ user: { _id: recipient } }, res);

  assert.equal(res.body.notifications.length, 1);
  assert.equal(res.body.unreadCount, 4);
});

test('marking a notification read is restricted to a valid owned notification', async (t) => {
  const notificationId = '66d6a2e5e5d00a507b2b7f21';
  const recipient = '66d6a2e5e5d00a507b2b7f20';
  let filter;
  t.mock.method(Notification, 'findOneAndUpdate', (query, update, options) => {
    filter = query;
    assert.deepEqual(update, { $set: { read: true } });
    assert.deepEqual(options, { new: true });
    return { lean: async () => ({ _id: notificationId, recipient, read: true }) };
  });

  const res = response();
  await controller.markNotificationRead({
    params: { id: notificationId },
    user: { _id: recipient },
  }, res);

  assert.deepEqual(filter, { _id: notificationId, recipient });
  assert.equal(res.body.notification.read, true);
});

test('marking an invalid notification ID returns a client error', async () => {
  const res = response();
  await controller.markNotificationRead({
    params: { id: 'not-an-id' },
    user: { _id: '66d6a2e5e5d00a507b2b7f20' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Invalid notification ID');
});

test('deleting a notification is restricted to a valid notification owned by the current user', async (t) => {
  const notificationId = '66d6a2e5e5d00a507b2b7f21';
  const recipient = '66d6a2e5e5d00a507b2b7f20';
  let filter;
  t.mock.method(Notification, 'findOneAndDelete', (query) => {
    filter = query;
    return { lean: async () => ({ _id: notificationId, recipient }) };
  });

  const res = response();
  await controller.deleteNotification({
    params: { id: notificationId },
    user: { _id: recipient },
  }, res);

  assert.deepEqual(filter, { _id: notificationId, recipient });
  assert.equal(res.body.message, 'Notification removed');
});

test('deleting an invalid notification ID returns a client error', async () => {
  const res = response();
  await controller.deleteNotification({
    params: { id: 'not-an-id' },
    user: { _id: '66d6a2e5e5d00a507b2b7f20' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Invalid notification ID');
});

test('device token endpoints reject tokens outside the accepted length', async () => {
  const user = { _id: '66d6a2e5e5d00a507b2b7f20' };
  const registerResponse = response();
  await controller.registerNotificationDevice({
    body: { token: 'too-short' },
    user,
  }, registerResponse);
  assert.equal(registerResponse.statusCode, 400);

  const removeResponse = response();
  await controller.removeNotificationDevice({
    body: { token: 'too-short' },
    user,
  }, removeResponse);
  assert.equal(removeResponse.statusCode, 400);
});

test('device token registration accepts supported token length and defaults unknown platforms', async () => {
  const res = response();
  await controller.registerNotificationDevice({
    body: { token: 'device-token-value-123456', platform: 'unknown' },
    user: { _id: '66d6a2e5e5d00a507b2b7f20' },
  }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, 'Device token registered');
});
