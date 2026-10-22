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

test('admin verification queue includes worker profile pictures', async () => {
  let selectedFields = '';
  const worker = { _id: 'worker-id', profilePicture: 'serviqo/profile/photo' };
  User.find = () => ({
    select(fields) {
      selectedFields = fields;
      return Promise.resolve([worker]);
    },
  });

  const res = response();
  await adminController.getPendingVerifications({}, res);

  assert.match(selectedFields, /\bprofilePicture\b/);
  assert.equal(res.body.verifications[0].profilePicture, worker.profilePicture);
});

test('admin analytics filters counts and activity by the requested UTC date range', async () => {
  const originalUserCount = User.countDocuments;
  const originalJobCount = Job.countDocuments;
  const originalDisputeCount = require('../models/Dispute').countDocuments;
  const originalUserAggregate = User.aggregate;
  const originalJobAggregate = Job.aggregate;
  const userFilters = [];
  const jobFilters = [];
  const disputeFilters = [];

  try {
    User.countDocuments = async (filter) => { userFilters.push(filter); return 3; };
    Job.countDocuments = async (filter) => { jobFilters.push(filter); return 4; };
    const Dispute = require('../models/Dispute');
    Dispute.countDocuments = async (filter) => { disputeFilters.push(filter); return 2; };
    User.aggregate = async () => [
      { _id: { date: '2026-10-01', role: 'customer' }, count: 2 },
    ];
    Job.aggregate = async (pipeline) => (
      pipeline[1].$group._id.date
        ? [{ _id: { date: '2026-10-02', status: 'completed' }, count: 1 }]
        : [{ _id: 'Plumbing', count: 2 }]
    );

    const res = response();
    await adminController.getAnalytics({
      query: { startDate: '2026-10-01', endDate: '2026-10-02' },
    }, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.dateRange, { startDate: '2026-10-01', endDate: '2026-10-02' });
    assert.deepEqual(res.body.trend, [
      { date: '2026-10-01', users: 2, jobs: 0 },
      { date: '2026-10-02', users: 0, jobs: 1 },
    ]);
    assert.deepEqual(res.body.categories, [{ name: 'Plumbing', count: 2, percentage: 100 }]);
    assert.ok(userFilters.every((filter) => filter.createdAt.$gte.toISOString() === '2026-10-01T00:00:00.000Z'
      && filter.createdAt.$lt.toISOString() === '2026-10-03T00:00:00.000Z'));
    assert.ok(jobFilters.every((filter) => filter.createdAt.$gte.toISOString() === '2026-10-01T00:00:00.000Z'
      && filter.createdAt.$lt.toISOString() === '2026-10-03T00:00:00.000Z'));
    assert.equal(disputeFilters[0].createdAt.$lt.toISOString(), '2026-10-03T00:00:00.000Z');
  } finally {
    User.countDocuments = originalUserCount;
    Job.countDocuments = originalJobCount;
    require('../models/Dispute').countDocuments = originalDisputeCount;
    User.aggregate = originalUserAggregate;
    Job.aggregate = originalJobAggregate;
  }
});

test('admin analytics rejects invalid or oversized date ranges', async () => {
  for (const query of [
    { startDate: '2026-02-30', endDate: '2026-03-01' },
    { startDate: '2026-10-02', endDate: '2026-10-01' },
    { startDate: '2025-01-01', endDate: '2026-01-02' },
    { startDate: '2026-10-01' },
  ]) {
    const res = response();
    await adminController.getAnalytics({ query }, res);
    assert.equal(res.statusCode, 400);
  }
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
