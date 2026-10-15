const Bid = require('../models/Bid');
const Job = require('../models/Job');

function validateBidInput({ amount, proposal, estimatedDays }) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return 'Bid amount must be greater than zero';
  }
  if (typeof proposal !== 'string' || proposal.trim().length < 10 || proposal.trim().length > 3000) {
    return 'Proposal must be between 10 and 3,000 characters';
  }
  if (estimatedDays !== undefined && estimatedDays !== '') {
    const days = Number(estimatedDays);
    if (!Number.isInteger(days) || days <= 0 || days > 365) {
      return 'Estimated days must be a whole number from 1 to 365';
    }
  }
  return null;
}

async function submitBid(req, res) {
  const { jobId, amount, proposal, estimatedDays } = req.body;
  const validationError = validateBidInput({ amount, proposal, estimatedDays });
  if (validationError) return res.status(400).json({ error: validationError });

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'open') return res.status(400).json({ error: 'Job is not accepting bids' });
  if (job.customer.toString() === String(req.user._id)) {
    return res.status(400).json({ error: 'You cannot bid on your own job' });
  }

  const existingBid = await Bid.findOne({ job: jobId, worker: req.user._id });
  if (existingBid) return res.status(400).json({ error: 'You have already bid on this job' });

  let bid;
  try {
    bid = await Bid.create({
      job: jobId,
      worker: req.user._id,
      amount: Number(amount),
      proposal: proposal.trim(),
      estimatedDays: estimatedDays ? Number(estimatedDays) : undefined,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ error: 'You have already bid on this job' });
    }
    throw error;
  }

  await Job.findByIdAndUpdate(jobId, { $inc: { totalBids: 1 } });

  return res.status(201).json({ message: 'Bid submitted successfully', bid });
}

async function getJobBids(req, res) {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (job.customer.toString() !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const bids = await Bid.find({ job: req.params.jobId })
    .populate('worker', 'name profilePicture rating completedJobs serviceCategory city')
    .sort({ createdAt: -1 });

  return res.json({ bids });
}

async function getMyBids(req, res) {
  const bids = await Bid.find({ worker: req.user._id })
    .populate('job', 'title status location budgetRange urgency customer totalBids')
    .sort({ createdAt: -1 });

  return res.json({ bids });
}

async function acceptBid(req, res) {
  const bid = await Bid.findById(req.params.bidId).populate('job');
  if (!bid) return res.status(404).json({ error: 'Bid not found' });
  if (bid.job.customer.toString() !== String(req.user._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (bid.job.status !== 'open') {
    return res.status(400).json({ error: 'Job is not open for bid acceptance' });
  }
  if (bid.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending bids can be accepted' });
  }

  bid.status = 'accepted';
  await bid.save();

  await Job.findByIdAndUpdate(bid.job._id, {
    status: 'active',
    assignedWorker: bid.worker,
    acceptedBid: bid._id,
  });

  await Bid.updateMany(
    { job: bid.job._id, _id: { $ne: bid._id } },
    { status: 'rejected' }
  );

  return res.json({ message: 'Bid accepted', bid });
}

async function rejectBid(req, res) {
  const bid = await Bid.findById(req.params.bidId).populate('job');
  if (!bid) return res.status(404).json({ error: 'Bid not found' });
  if (bid.job.customer.toString() !== String(req.user._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (bid.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending bids can be rejected' });
  }

  bid.status = 'rejected';
  await bid.save();

  return res.json({ message: 'Bid rejected', bid });
}

module.exports = { submitBid, getJobBids, getMyBids, acceptBid, rejectBid };
