const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'backend-hardening-test-secret';

const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');
const { createToken } = require('../services/auth');
const { checkAuth } = require('../middlewares/auth');
const configureSocketServer = require('../services/socket');
const jobController = require('../controllers/job');
const bidController = require('../controllers/bid');

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

function mockNotifications(t) {
  const created = [];
  t.mock.method(Notification, 'create', async (values) => {
    created.push(values);
    return { ...values, toObject: () => values };
  });
  return created;
}

function bearerRequest(token) {
  return {
    cookies: {},
    get: (header) => header.toLowerCase() === 'authorization' ? `Bearer ${token}` : undefined,
  };
}

test('Bearer authentication rechecks active, missing, and suspended user accounts', async (t) => {
  const users = new Map([
    ['active-user', { _id: 'active-user', role: 'worker', isActive: true }],
    ['suspended-user', { _id: 'suspended-user', role: 'worker', isActive: false }],
  ]);
  t.mock.method(User, 'findById', (id) => ({
    select: async () => users.get(String(id)) || null,
  }));

  const activeResponse = response();
  let nextCalled = false;
  await checkAuth(
    bearerRequest(createToken({ _id: 'active-user', role: 'worker' })),
    activeResponse,
    () => { nextCalled = true; }
  );
  assert.equal(nextCalled, true);
  assert.equal(activeResponse.statusCode, 200);

  const missingResponse = response();
  await checkAuth(
    bearerRequest(createToken({ _id: 'deleted-user', role: 'worker' })),
    missingResponse,
    () => assert.fail('next must not run for a deleted account')
  );
  assert.equal(missingResponse.statusCode, 401);
  assert.equal(missingResponse.body.error, 'Session expired. Please sign in again.');

  const suspendedResponse = response();
  await checkAuth(
    bearerRequest(createToken({ _id: 'suspended-user', role: 'worker' })),
    suspendedResponse,
    () => assert.fail('next must not run for a suspended account')
  );
  assert.equal(suspendedResponse.statusCode, 403);
  assert.equal(suspendedResponse.body.error, 'Account suspended. Contact support.');
});

test('Socket.IO handshake guard rejects deleted or suspended users and admits an active user', async (t) => {
  let account;
  t.mock.method(User, 'findById', () => ({
    select: async () => account,
  }));

  const io = configureSocketServer(http.createServer(), []);
  t.after(() => new Promise((resolve) => io.close(resolve)));
  const handshakeGuard = io.of('/')._fns[0];
  const authenticateHandshake = async (id) => {
    const socket = {
      handshake: {
        auth: { token: createToken({ _id: id, role: 'worker' }) },
        headers: {},
      },
    };
    const error = await new Promise((resolve) => handshakeGuard(socket, resolve));
    return { error, socket };
  };

  account = null;
  const deleted = await authenticateHandshake('deleted-user');
  assert.equal(deleted.error.message, 'Unauthorized');

  account = { _id: 'suspended-user', role: 'worker', isActive: false };
  const suspended = await authenticateHandshake('suspended-user');
  assert.equal(suspended.error.message, 'Unauthorized');

  account = { _id: 'active-user', role: 'worker', isActive: true };
  const active = await authenticateHandshake('active-user');
  assert.equal(active.error, undefined);
  assert.equal(String(active.socket.user._id), 'active-user');
});

test('concurrent completion requests atomically complete an active job once', async (t) => {
  const customerId = 'customer-id';
  const jobId = 'job-id';
  const job = {
    _id: jobId,
    customer: customerId,
    assignedWorker: 'worker-id',
    status: 'active',
    title: 'Repair kitchen tap',
  };
  let status = 'active';
  let completionTransitions = 0;
  mockNotifications(t);

  t.mock.method(Job, 'findById', async () => ({ ...job, status }));
  t.mock.method(Job, 'findOneAndUpdate', async (filter, update) => {
    assert.deepEqual(filter, { _id: jobId, customer: customerId, status: 'active' });
    assert.deepEqual(update, { $set: { status: 'completed' } });
    if (status !== 'active') return null;
    status = update.$set.status;
    completionTransitions += 1;
    return { ...job, status };
  });

  const call = () => {
    const res = response();
    return jobController.markJobComplete({
      params: { jobId },
      user: { _id: customerId },
    }, res).then(() => res);
  };
  const results = await Promise.all([call(), call()]);

  assert.deepEqual(results.map((result) => result.statusCode).sort(), [200, 400]);
  assert.equal(status, 'completed');
  assert.equal(completionTransitions, 1);
});

test('concurrent acceptance of different bids assigns an open job once', async (t) => {
  const jobId = 'job-id';
  const customerId = 'customer-id';
  const bids = [
    { _id: 'bid-one', worker: 'worker-one', status: 'pending' },
    { _id: 'bid-two', worker: 'worker-two', status: 'pending' },
  ];
  const bidStatuses = new Map(bids.map((bid) => [bid._id, bid.status]));
  let jobState = { status: 'open', assignedWorker: undefined, acceptedBid: undefined };
  let assignmentTransitions = 0;
  mockNotifications(t);

  t.mock.method(Bid, 'findById', (bidId) => ({
    populate: async () => {
      const bid = bids.find((entry) => entry._id === bidId);
      return {
        ...bid,
        status: bidStatuses.get(bid._id),
        job: { _id: jobId, customer: customerId, status: 'open', title: 'Repair kitchen tap' },
        save: async function save() {
          bidStatuses.set(bid._id, this.status);
        },
      };
    },
  }));
  t.mock.method(Job, 'findOneAndUpdate', async (filter, update) => {
    assert.deepEqual(filter, { _id: jobId, customer: customerId, status: 'open' });
    if (jobState.status !== 'open') return null;
    jobState = { ...jobState, ...update.$set };
    assignmentTransitions += 1;
    return jobState;
  });
  t.mock.method(Bid, 'find', (filter) => ({
    select: async () => bids
      .filter((bid) => bid._id !== filter._id.$ne)
      .map((bid) => ({ worker: bid.worker })),
  }));
  t.mock.method(Bid, 'updateMany', async (filter, update) => {
    for (const bid of bids) {
      if (bid._id !== filter._id.$ne) bidStatuses.set(bid._id, update.$set.status);
    }
  });

  const call = (bidId) => {
    const res = response();
    return bidController.acceptBid({
      params: { bidId },
      user: { _id: customerId },
    }, res).then(() => res);
  };
  const results = await Promise.all(bids.map((bid) => call(bid._id)));

  assert.deepEqual(results.map((result) => result.statusCode).sort(), [200, 400]);
  assert.equal(jobState.status, 'active');
  assert.equal(assignmentTransitions, 1);
  assert.ok(bids.some((bid) => bidStatuses.get(bid._id) === 'accepted'));
  assert.ok(bids.every((bid) => ['accepted', 'rejected'].includes(bidStatuses.get(bid._id))));
});

test('bid acceptance uses a MongoDB transaction on a replica-set topology', async (t) => {
  const originalClient = mongoose.connection.client;
  mongoose.connection.client = {
    topology: { description: { type: 'ReplicaSetWithPrimary' } },
  };
  t.after(() => { mongoose.connection.client = originalClient; });

  const session = {
    withTransaction: async (operation) => operation(),
    endSession: async () => {},
  };
  t.mock.method(mongoose, 'startSession', async () => session);
  mockNotifications(t);

  const bid = {
    _id: 'bid-id',
    worker: 'worker-id',
    status: 'pending',
    job: { _id: 'job-id', customer: 'customer-id', status: 'open', title: 'Repair kitchen tap' },
  };
  t.mock.method(Bid, 'findById', () => ({
    populate: async () => ({
      ...bid,
      save: async (options) => assert.equal(options.session, session),
    }),
  }));
  t.mock.method(Job, 'findOneAndUpdate', async (_filter, _update, options) => {
    assert.equal(options.session, session);
    return { _id: 'job-id', status: 'active' };
  });
  t.mock.method(Bid, 'find', () => ({
    select() {
      return {
        session: async (providedSession) => {
          assert.equal(providedSession, session);
          return [];
        },
      };
    },
  }));
  t.mock.method(Bid, 'updateMany', async (_filter, _update, options) => {
    assert.equal(options.session, session);
  });

  const res = response();
  await bidController.acceptBid({
    params: { bidId: bid._id },
    user: { _id: 'customer-id' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, 'Bid accepted');
});

test('failed guarded bid assignment does not mutate the bid', async (t) => {
  const bid = {
    _id: 'bid-id',
    worker: 'worker-id',
    status: 'pending',
    job: { _id: 'job-id', customer: 'customer-id', status: 'open' },
  };
  t.mock.method(Bid, 'findById', () => ({ populate: async () => bid }));
  t.mock.method(Job, 'findOneAndUpdate', async () => null);
  t.mock.method(Bid, 'updateMany', async () => assert.fail('other bids must not be updated'));

  const res = response();
  await bidController.acceptBid({
    params: { bidId: bid._id },
    user: { _id: 'customer-id' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Job is not open for bid acceptance');
  assert.equal(bid.status, 'pending');
});
