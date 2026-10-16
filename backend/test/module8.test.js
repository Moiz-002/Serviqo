const test = require('node:test');
const assert = require('node:assert/strict');

const User = require('../models/User');
const Job = require('../models/Job');
const bidController = require('../controllers/bid');
const adminController = require('../controllers/admin');
const { checkRole } = require('../middlewares/auth');

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

test('admin role middleware rejects customer and worker users', () => {
  const guard = checkRole('admin');
  for (const role of ['customer', 'worker']) {
    const res = response();
    let called = false;
    guard({ user: { role } }, res, () => { called = true; });
    assert.equal(res.statusCode, 403);
    assert.equal(called, false);
  }
});

test('admin role middleware allows only admins', () => {
  const res = response();
  let called = false;
  checkRole('admin')({ user: { role: 'admin' } }, res, () => { called = true; });
  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
});

test('admin user status accepts a boolean and persists it', async () => {
  let update;
  User.findByIdAndUpdate = async (id, values) => {
    update = { id, values };
    return { _id: id, isActive: values.isActive };
  };

  const res = response();
  await adminController.updateUserStatus(
    { params: { userId: 'user-id' }, body: { isActive: false } },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(update, { id: 'user-id', values: { isActive: false } });
  assert.equal(res.body.user.isActive, false);
});

test('admin user status rejects invalid state values', async () => {
  const res = response();
  await adminController.updateUserStatus(
    { params: { userId: 'user-id' }, body: { status: 'unknown' } },
    res,
  );
  assert.equal(res.statusCode, 400);
});

test('admin verification rejection requires an explicit reason', async () => {
  const res = response();
  await adminController.rejectVerification(
    { params: { userId: 'worker-id' }, body: {} },
    res,
  );
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'A rejection reason is required');
});

test('unverified workers cannot submit otherwise valid bids', async () => {
  User.findById = () => ({
    select: async () => ({ role: 'worker', isActive: true, isVerified: true, cnicVerified: false }),
  });
  let jobQueried = false;
  Job.findById = async () => {
    jobQueried = true;
    return null;
  };

  const res = response();
  await bidController.submitBid({
    body: { jobId: 'job-id', amount: 1200, proposal: 'A valid proposal for this job.' },
    user: { _id: 'worker-id' },
  }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, 'Only active, platform-verified workers can submit bids');
  assert.equal(jobQueried, false);
});
