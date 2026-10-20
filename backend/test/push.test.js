const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const User = require('../models/User');

test('push delivery stringifies data and removes invalid registration tokens', async (t) => {
  const originalBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const originalCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 = Buffer.from('{"project_id":"test"}').toString('base64');
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  t.after(() => {
    if (originalBase64 === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    else process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 = originalBase64;
    if (originalCredentialsPath === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    else process.env.GOOGLE_APPLICATION_CREDENTIALS = originalCredentialsPath;
  });

  const sentPayloads = [];
  const messaging = {
    sendEachForMulticast: async (payload) => {
      sentPayloads.push(payload);
      return {
        successCount: 1,
        failureCount: 1,
        responses: [
          { success: true },
          { success: false, error: { code: 'messaging/registration-token-not-registered' } },
        ],
      };
    },
  };
  const fakeAdmin = {
    apps: [],
    credential: { cert: (serviceAccount) => ({ serviceAccount }) },
    initializeApp: () => ({ name: 'test-app' }),
    messaging: () => messaging,
  };
  const originalLoad = Module._load;
  t.mock.method(Module, '_load', function load(request, parent, isMain) {
    if (request === 'firebase-admin') return fakeAdmin;
    return originalLoad.call(this, request, parent, isMain);
  });
  const push = require('../services/push');

  t.mock.method(User, 'find', () => ({
    select: async () => [
      { _id: 'user-1', fcmTokens: [{ token: 'active-token' }, { token: 'dead-token' }] },
      { _id: 'user-2', fcmTokens: [{ token: 'active-token' }] },
    ],
  }));
  const updates = t.mock.method(User, 'updateMany', async (...args) => args);
  const result = await push.sendPushToUsers(['user-1', 'user-2', 'user-1'], {
    title: 'Hello',
    body: 'Test push',
    data: { type: 'message', count: 3, omitted: null, nested: { id: 4 } },
  });

  assert.deepEqual(result, { sent: 1, failed: 1 });
  assert.deepEqual(sentPayloads[0].tokens, ['active-token', 'dead-token']);
  assert.deepEqual(sentPayloads[0].data, {
    type: 'message',
    count: '3',
    nested: '{"id":4}',
  });
  assert.equal(sentPayloads[0].notification.title, 'Hello');
  assert.equal(updates.mock.calls.length, 1);
  assert.deepEqual(updates.mock.calls[0].arguments[1].$pull.fcmTokens.token.$in, ['dead-token']);
});

test('device token registration moves tokens between accounts and keeps the latest ten', async (t) => {
  const originalBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 = Buffer.from('{"project_id":"test"}').toString('base64');
  t.after(() => {
    if (originalBase64 === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    else process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 = originalBase64;
  });

  const fakeAdmin = {
    apps: [],
    credential: { cert: () => ({}) },
    initializeApp: () => ({ name: 'test-app' }),
    messaging: () => ({ sendEachForMulticast: async () => ({}) }),
  };
  const originalLoad = Module._load;
  t.mock.method(Module, '_load', function load(request, parent, isMain) {
    if (request === 'firebase-admin') return fakeAdmin;
    return originalLoad.call(this, request, parent, isMain);
  });
  const push = require('../services/push');
  const updateMany = t.mock.method(User, 'updateMany', async () => ({}));
  const updateOne = t.mock.method(User, 'updateOne', async () => ({}));

  await push.registerDeviceToken('user-id', 'device-token-value-123456', 'ios');

  assert.equal(updateMany.mock.calls.length, 1);
  assert.deepEqual(updateMany.mock.calls[0].arguments[0], {
    _id: { $ne: 'user-id' },
    fcmTokens: { $elemMatch: { token: 'device-token-value-123456' } },
  });
  assert.equal(updateOne.mock.calls.length, 2);
  const pushUpdate = updateOne.mock.calls[1].arguments[1].$push.fcmTokens;
  assert.equal(pushUpdate.$slice, -10);
  assert.equal(pushUpdate.$each[0].platform, 'ios');
  assert.equal(pushUpdate.$each[0].token, 'device-token-value-123456');
});

test('push functions are safe no-ops without Firebase credentials', () => {
  const script = `
    const assert = require('node:assert/strict');
    delete process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const warnings = [];
    console.warn = (message) => warnings.push(message);
    const push = require('./services/push');
    (async () => {
      assert.deepEqual(await push.sendPushToUsers(['user'], { title: 'Hi' }), { sent: 0, failed: 0 });
      await push.registerDeviceToken('user', 'device-token-value-123456', 'android');
      await push.removeDeviceToken('user', 'device-token-value-123456');
      push.pushSafely(['user'], { title: 'Hi' });
      setImmediate(() => process.exit(warnings.length === 1 ? 0 : 1));
    })().catch(() => process.exit(2));
  `;
  const env = { ...process.env };
  delete env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  delete env.GOOGLE_APPLICATION_CREDENTIALS;
  const result = spawnSync(process.execPath, ['-e', script], {
    cwd: path.join(__dirname, '..'),
    env,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
