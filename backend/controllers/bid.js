const Bid = require('../models/Bid');
const Job = require('../models/Job');

async function submitBid(req, res) {
  const { jobId, amount, proposal, estimatedDays } = req.body;

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'open') return res.status(400).json({ error: 'Job is not accepting bids' });
  if (job.customer.toString() === req.user._id) {
    return res.status(400).json({ error: 'You cannot bid on your own job' });
  }

  const existingBid = await Bid.findOne({ job: jobId, worker: req.user._id });
  if (existingBid) return res.status(400).json({ error: 'You have already bid on this job' });

  const bid = await Bid.create({
    job: jobId,
    worker: req.user._id,
    amount: Number(amount),
    proposal,
    estimatedDays: estimatedDays ? Number(estimatedDays) : undefined,
  });

  await Job.findByIdAndUpdate(jobId, { $inc: { totalBids: 1 } });

  return res.status(201).json({ message: 'Bid submitted successfully', bid });
}

async function getJobBids(req, res) {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (job.customer.toString() !== req.user._id && req.user.role !== 'admin') {
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
  if (bid.job.customer.toString() !== req.user._id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (bid.job.status !== 'open') {
    return res.status(400).json({ error: 'Job is not open for bid acceptance' });
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
  if (bid.job.customer.toString() !== req.user._id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  bid.status = 'rejected';
  await bid.save();

  return res.json({ message: 'Bid rejected', bid });
}

module.exports = { submitBid, getJobBids, getMyBids, acceptBid, rejectBid };
