const test = require('node:test');
const assert = require('node:assert/strict');

const Bid = require('../models/Bid');
const Job = require('../models/Job');
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

test('bid submission rejects invalid amount before database access', async () => {
  let queried = false;
  Job.findById = async () => {
    queried = true;
    return null;
  };

  const res = response();
  await bidController.submitBid({
    body: { jobId: 'job-id', amount: '0', proposal: 'This is a valid proposal.' },
    user: { _id: 'worker-id' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Bid amount must be greater than zero');
  assert.equal(queried, false);
});

test('bid submission rejects short proposals and invalid duration', async () => {
  const res = response();
  await bidController.submitBid({
    body: { jobId: 'job-id', amount: 1200, proposal: 'Too short', estimatedDays: 0 },
    user: { _id: 'worker-id' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Proposal must be between 10 and 3,000 characters');
});

test('bid rejection only allows pending bids', async () => {
  const bid = {
    status: 'accepted',
    job: { customer: { toString: () => 'customer-id' } },
  };
  Bid.findById = () => ({
    populate: async () => bid,
  });

  const res = response();
  await bidController.rejectBid({
    params: { bidId: 'bid-id' },
    user: { _id: 'customer-id' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Only pending bids can be rejected');
});
