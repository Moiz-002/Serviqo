const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const Job = require('../models/Job');
const jobController = require('../controllers/job');
const jobRouter = require('../routes/job');
const bidRouter = require('../routes/bid');

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

test('public job listing returns all customer jobs with safe fields and applies validated filters', async () => {
  const originalFind = Job.find;
  const originalCountDocuments = Job.countDocuments;
  const mockJob = {
    _id: 'job-id',
    title: 'Repair a leaking tap',
    description: 'The kitchen tap needs a professional repair.',
    category: 'Plumbing',
    budgetRange: '500 - 2,000 PKR',
    urgency: 'today',
    location: { city: 'Lahore', area: 'DHA' },
    status: 'open',
    totalBids: 2,
    customer: 'must-not-be-returned',
    createdAt: new Date('2026-10-20T10:00:00.000Z'),
  };
  let filter;
  const calls = {};

  try {
    Job.find = (query) => {
      filter = query;
      const chain = {
        select(fields) { calls.selectedFields = fields; return chain; },
        sort(value) { calls.sort = value; return chain; },
        skip(value) { calls.skip = value; return chain; },
        limit(value) { calls.limit = value; return chain; },
        lean: async () => [mockJob],
      };
      return chain;
    };
    Job.countDocuments = async () => 1;

    const res = response();
    await jobController.getPublicJobs({
      query: { q: 'tap.*', category: 'Plumbing', city: 'Lahore', urgency: 'today', page: '2', limit: '1000' },
    }, res);

    assert.equal(Object.hasOwn(filter, 'status'), false);
    assert.equal(filter.category.test('plumbing'), true);
    assert.equal(filter.$and[0].$or[0]['location.city'].test('Lahore'), true);
    assert.equal(filter.$and[0].$or[1]['location.area'].test('Lahore'), true);
    assert.equal(filter.urgency.test('today'), true);
    assert.equal(filter.$and[1].$or[0].title.test('tap.*'), true);
    assert.equal(filter.$and[1].$or[0].title.test('tapxxx'), false);
    assert.equal(calls.skip, 50);
    assert.equal(calls.limit, 50);
    assert.equal(calls.selectedFields.includes('customer'), false);
    assert.equal(res.body.jobs[0].title, mockJob.title);
    assert.equal(Object.hasOwn(res.body.jobs[0], 'customer'), false);
    assert.equal(res.body.total, 1);

    await jobController.getPublicJobs({ query: { city: 'DHA', status: 'completed' } }, response());
    assert.equal(filter.status, 'completed');
    assert.equal(filter.$and[0].$or[0]['location.city'].test('DHA'), true);
    assert.equal(filter.$and[0].$or[1]['location.area'].test('DHA'), true);
  } finally {
    Job.find = originalFind;
    Job.countDocuments = originalCountDocuments;
  }
});

test('public job details reject invalid ids and expose closed jobs without private fields', async () => {
  const originalFindById = Job.findById;
  let query;

  try {
    Job.findById = (value) => {
      query = value;
      return {
        select(fields) {
          assert.equal(fields.includes('customer'), false);
          return this;
        },
        lean: async () => ({
          _id: '507f1f77bcf86cd799439011',
          title: 'Repair a leaking tap',
          description: 'The kitchen tap needs a professional repair.',
          category: 'Plumbing',
          budgetRange: '500 - 2,000 PKR',
          urgency: 'today',
          location: { city: 'Lahore', area: 'DHA' },
          status: 'completed',
          customer: 'private-customer-id',
        }),
      };
    };

    const invalidRes = response();
    await jobController.getPublicJobById({ params: { jobId: 'not-an-object-id' } }, invalidRes);
    assert.equal(invalidRes.statusCode, 400);

    const res = response();
    await jobController.getPublicJobById({
      params: { jobId: '507f1f77bcf86cd799439011' },
    }, res);

    assert.deepEqual(query, '507f1f77bcf86cd799439011');
    assert.equal(Object.hasOwn(res.body.job, 'customer'), false);
    assert.equal(res.body.job.status, 'completed');
  } finally {
    Job.findById = originalFindById;
  }
});

test('public job API works anonymously while posting and bidding remain protected', async () => {
  const originalFind = Job.find;
  const originalFindById = Job.findById;
  const originalCountDocuments = Job.countDocuments;
  Job.find = () => {
    const chain = {
      select() { return chain; },
      sort() { return chain; },
      skip() { return chain; },
      limit() { return chain; },
      lean: async () => [],
    };
    return chain;
  };
  Job.findById = () => ({
    select() {
      return this;
    },
    lean: async () => ({
      _id: '507f1f77bcf86cd799439011',
      title: 'Recently completed repair',
      description: 'A previously posted customer request.',
      category: 'Plumbing',
      budgetRange: '500 - 2,000 PKR',
      urgency: 'today',
      location: { city: 'Lahore', area: 'DHA' },
      status: 'completed',
      totalBids: 3,
      customer: 'private-customer-id',
    }),
  });
  Job.countDocuments = async () => 0;

  const app = express();
  app.use(express.json());
  app.use('/api/jobs', jobRouter);
  app.use('/api/bids', bidRouter);
  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}/api`;

    const publicResponse = await fetch(`${baseUrl}/jobs/public`);
    assert.equal(publicResponse.status, 200);
    assert.deepEqual(await publicResponse.json(), { jobs: [], total: 0, page: 1, totalPages: 0 });

    const publicDetailResponse = await fetch(`${baseUrl}/jobs/public/507f1f77bcf86cd799439011`);
    assert.equal(publicDetailResponse.status, 200);
    const publicDetail = await publicDetailResponse.json();
    assert.equal(publicDetail.job.status, 'completed');
    assert.equal(Object.hasOwn(publicDetail.job, 'customer'), false);

    const createResponse = await fetch(`${baseUrl}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validJob),
    });
    assert.equal(createResponse.status, 401);

    const bidResponse = await fetch(`${baseUrl}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: '507f1f77bcf86cd799439011', amount: 1000, proposal: 'I can do this work.' }),
    });
    assert.equal(bidResponse.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    Job.find = originalFind;
    Job.findById = originalFindById;
    Job.countDocuments = originalCountDocuments;
  }
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
