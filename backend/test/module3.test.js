const test = require('node:test');
const assert = require('node:assert/strict');

const Job = require('../models/Job');
const jobController = require('../controllers/job');

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

const validJob = {
  title: 'Repair leaking kitchen tap',
  description: 'The kitchen tap has been leaking continuously and needs a professional repair.',
  category: 'Plumbing',
  budgetRange: '500 - 2,000 PKR',
  urgency: 'today',
  city: 'Lahore',
  area: 'DHA Phase 6',
};

test('job creation rejects incomplete or too-short requests', async () => {
  const res = response();
  await jobController.createJob({
    body: { ...validJob, title: 'Fix' },
    files: [],
    user: { _id: 'customer-id' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Title must be between 5 and 120 characters');
});

test('job creation persists normalized request data', async () => {
  let created;
  Job.create = async (data) => {
    created = data;
    return { _id: 'job-id', ...data };
  };

  const res = response();
  await jobController.createJob({
    body: Object.fromEntries(Object.entries(validJob).map(([key, value]) => [key, ` ${value} `])),
    files: [{ path: 'https://cdn.example/reference.jpg' }],
    user: { _id: 'customer-id' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(created.title, 'Repair leaking kitchen tap');
  assert.equal(created.customer, 'customer-id');
  assert.deepEqual(created.images, ['https://cdn.example/reference.jpg']);
});

test('job update rejects a request from another customer', async () => {
  Job.findById = async () => ({
    customer: { toString: () => 'owner-id' },
    status: 'open',
  });

  const res = response();
  await jobController.updateJob({
    params: { jobId: 'job-id' },
    body: {},
    user: { _id: 'other-id' },
  }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, 'Forbidden');
});
