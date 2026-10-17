const test = require('node:test');
const assert = require('node:assert/strict');

const Job = require('../models/Job');
const User = require('../models/User');
const RecommendationFeedback = require('../models/RecommendationFeedback');
const controller = require('../controllers/recommendation');

const jobId = '66d6a2e5e5d00a507b2b7f10';
const customerId = '66d6a2e5e5d00a507b2b7f11';
const workerId = '66d6a2e5e5d00a507b2b7f12';

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

function chainQuery(value) {
  return {
    select() { return this; },
    sort() { return this; },
    limit() { return this; },
    lean: async () => value,
    then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); },
  };
}

test('recommendations reject invalid job IDs before database or AI access', async () => {
  const res = response();
  await controller.getJobRecommendations({
    params: { jobId: 'not-an-object-id' },
    user: { _id: customerId, role: 'customer' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Invalid job ID');
});

test('recommendations are owner-scoped and only pass eligible candidate fields to Python', async (t) => {
  const job = {
    _id: jobId,
    title: 'Repair a kitchen tap',
    description: 'A kitchen tap is leaking and needs plumbing repair.',
    category: 'Plumbing',
    location: { city: 'Lahore', area: 'Private area must not be sent' },
  };
  const worker = {
    _id: workerId,
    name: 'Public Worker',
    profilePicture: 'https://cdn.example/profile.jpg',
    serviceCategory: 'Plumbing',
    city: 'Lahore',
    skills: ['Pipe repair'],
    experience: 5,
    hourlyRate: 1500,
    availability: { monday: { available: true } },
    rating: 4.8,
    totalReviews: 5,
    completedJobs: 7,
    portfolio: [{ title: 'Kitchen repair', image: 'private-reference-url' }],
    phone: '+923001234567',
    email: 'private@example.com',
    cnicFront: 'private-document-url',
  };

  let jobFilter;
  let workerFilter;
  t.mock.method(Job, 'findOne', (filter) => {
    jobFilter = filter;
    return { select: async () => job };
  });
  t.mock.method(User, 'find', (filter) => {
    workerFilter = filter;
    return chainQuery([worker]);
  });
  t.mock.method(RecommendationFeedback, 'aggregate', async () => [{
    _id: workerId,
    positiveFeedback: 3,
    negativeFeedback: 1,
  }]);
  const oldServiceUrl = process.env.AI_SERVICE_URL;
  process.env.AI_SERVICE_URL = 'http://127.0.0.1:8001';
  t.after(() => {
    if (oldServiceUrl === undefined) delete process.env.AI_SERVICE_URL;
    else process.env.AI_SERVICE_URL = oldServiceUrl;
  });

  let servicePayload;
  t.mock.method(global, 'fetch', async (_url, options) => {
    servicePayload = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        analysisMode: 'gemini_hybrid',
        requiredSkills: ['plumbing'],
        recommendations: [
          { workerId, score: 87.5, reasons: ['Offers the requested Plumbing service'] },
          { workerId: '66d6a2e5e5d00a507b2b7f99', score: 99, reasons: ['unknown'] },
        ],
      }),
    };
  });

  const res = response();
  await controller.getJobRecommendations({
    params: { jobId },
    user: { _id: customerId, role: 'customer' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(jobFilter.customer, customerId);
  assert.equal(jobFilter.status, 'open');
  assert.equal(workerFilter.role, 'worker');
  assert.equal(workerFilter.isActive, true);
  assert.equal(workerFilter.isVerified, true);
  assert.equal(workerFilter.cnicVerified, true);
  assert.equal(servicePayload.job.city, 'Lahore');
  assert.equal(servicePayload.candidates[0].positiveFeedback, 3);
  assert.equal(servicePayload.candidates[0].name, undefined);
  assert.equal(servicePayload.candidates[0].phone, undefined);
  assert.equal(servicePayload.candidates[0].email, undefined);
  assert.equal(servicePayload.candidates[0].cnicFront, undefined);
  assert.equal(servicePayload.job.area, undefined);
  assert.equal(res.body.recommendations.length, 1);
  assert.equal(res.body.recommendations[0].worker.name, 'Public Worker');
  assert.equal(res.body.recommendations[0].worker.phone, undefined);
  assert.equal(res.body.recommendations[0].score, 87.5);
});

test('recommendation feedback validates input and saves customer-scoped feedback', async (t) => {
  t.mock.method(Job, 'findOne', () => ({
    select: async () => ({ _id: jobId, category: 'Plumbing' }),
  }));
  t.mock.method(User, 'findOne', () => ({
    select: async () => ({ _id: workerId }),
  }));
  let saved;
  t.mock.method(RecommendationFeedback, 'findOneAndUpdate', async (...args) => {
    saved = args;
    return {};
  });

  const res = response();
  await controller.submitRecommendationFeedback({
    params: { jobId },
    body: { workerId, helpful: false },
    user: { _id: customerId, role: 'customer' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(saved[0].customer, customerId);
  assert.equal(saved[1].$set.category, 'Plumbing');
  assert.equal(saved[1].$set.helpful, false);
  assert.equal(saved[2].upsert, true);
});

test('recommendation feedback rejects a non-boolean vote', async () => {
  const res = response();
  await controller.submitRecommendationFeedback({
    params: { jobId },
    body: { workerId, helpful: 'yes' },
    user: { _id: customerId, role: 'customer' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Helpful feedback must be true or false');
});
