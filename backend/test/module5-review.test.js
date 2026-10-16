const test = require('node:test');
const assert = require('node:assert/strict');

const Review = require('../models/Review');
const Job = require('../models/Job');
const User = require('../models/User');
const reviewController = require('../controllers/review');

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

test('review submission requires a completed job and valid rating', async () => {
  const res = response();
  await reviewController.postReview({
    body: { jobId: 'job-id', rating: 6 },
    user: { _id: 'customer-id' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'A whole-number rating from 1 to 5 is required');
});

test('review submission persists trimmed feedback and updates worker rating', async () => {
  const originalJobFind = Job.findById;
  const originalReviewFind = Review.findOne;
  const originalReviewCreate = Review.create;
  const originalReviewFindAll = Review.find;
  const originalUserUpdate = User.findByIdAndUpdate;

  Job.findById = async () => ({
    customer: { toString: () => 'customer-id' },
    status: 'completed',
    assignedWorker: 'worker-id',
  });
  Review.findOne = async () => null;
  Review.create = async (data) => ({ ...data, _id: 'review-id' });
  Review.find = async () => [{ rating: 5 }];
  User.findByIdAndUpdate = async () => null;

  const res = response();
  await reviewController.postReview({
    body: { jobId: 'job-id', rating: 5, comment: '  Excellent work.  ' },
    user: { _id: 'customer-id' },
  }, res);

  Job.findById = originalJobFind;
  Review.findOne = originalReviewFind;
  Review.create = originalReviewCreate;
  Review.find = originalReviewFindAll;
  User.findByIdAndUpdate = originalUserUpdate;

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.review.comment, 'Excellent work.');
});
