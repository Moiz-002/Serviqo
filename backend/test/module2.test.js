const test = require('node:test');
const assert = require('node:assert/strict');
require('dotenv').config();

const User = require('../models/User');
const workerController = require('../controllers/worker');
const { checkAuth } = require('../middlewares/auth');
const { createToken } = require('../services/auth');

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

function request(body = {}) {
  return { body, user: { _id: 'worker-id', role: 'worker' } };
}

test('protected API middleware rejects requests without a session', () => {
  const res = response();
  let called = false;
  checkAuth({ cookies: {} , get: () => undefined }, res, () => { called = true; });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'Unauthorized');
  assert.equal(called, false);
});

test('protected API middleware accepts a valid bearer token', async (t) => {
  const res = response();
  let called = false;
  const token = createToken({
    _id: '507f1f77bcf86cd799439011',
    phone: '03001234567',
    role: 'worker',
  });
  t.mock.method(User, 'findById', () => ({
    select: async () => ({
      _id: '507f1f77bcf86cd799439011',
      phone: '03001234567',
      role: 'worker',
      isActive: true,
    }),
  }));
  await checkAuth(
    { cookies: {}, get: (header) => header === 'authorization' ? `Bearer ${token}` : undefined },
    res,
    () => { called = true; },
  );

  assert.equal(res.statusCode, 200);
  assert.equal(called, true);
});

test('worker profile updates persist normalized profile fields', async () => {
  let update;
  User.findByIdAndUpdate = async (id, values) => {
    update = { id, values };
    return { _id: id, ...values };
  };

  const res = response();
  await workerController.updateWorkerProfile(request({
    name: '  Ada Worker ',
    email: ' ADA@EXAMPLE.COM ',
    experience: '4',
    hourlyRate: '1800',
    bio: '',
    city: 'Lahore',
    address: '',
  }), res);

  assert.equal(res.statusCode, 200);
  assert.equal(update.id, 'worker-id');
  assert.deepEqual(update.values, {
    name: 'Ada Worker',
    email: 'ada@example.com',
    experience: 4,
    hourlyRate: 1800,
    bio: '',
    city: 'Lahore',
    address: '',
  });
});

test('worker skills updates accept an empty array to clear skills', async () => {
  let update;
  User.findByIdAndUpdate = async (id, values) => {
    update = values;
    return { skills: [], serviceCategory: 'Electrical', hourlyRate: 1200 };
  };

  const res = response();
  await workerController.updateSkills(request({
    skills: [],
    serviceCategory: 'Electrical',
    hourlyRate: 1200,
  }), res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(update, { skills: [], serviceCategory: 'Electrical', hourlyRate: 1200 });
});

test('worker availability rejects malformed payloads', async () => {
  const res = response();
  await workerController.updateAvailability(request({ availability: [] }), res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Availability must be an object');
});

test('portfolio deletion reports a missing item instead of saving a no-op', async () => {
  User.findById = async () => ({
    portfolio: { id: () => undefined },
  });

  const res = response();
  await workerController.removePortfolioItem(
    { params: { itemId: 'missing-item' }, user: { _id: 'worker-id' } },
    res,
  );

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.error, 'Portfolio item not found');
});
