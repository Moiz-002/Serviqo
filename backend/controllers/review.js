const Review = require('../models/Review');
const Job = require('../models/Job');
const User = require('../models/User');

async function postReview(req, res) {
  const { jobId, rating, comment } = req.body;
  const numericRating = Number(rating);

  if (!jobId || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'A whole-number rating from 1 to 5 is required' });
  }

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.customer.toString() !== String(req.user._id)) {
    return res.status(403).json({ error: 'Only the job customer can leave a review' });
  }
  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Can only review completed jobs' });
  }
  if (!job.assignedWorker) {
    return res.status(400).json({ error: 'This job has no assigned worker' });
  }
  if (comment !== undefined && (typeof comment !== 'string' || comment.trim().length > 2000)) {
    return res.status(400).json({ error: 'Review comment must be 2,000 characters or fewer' });
  }

  const existing = await Review.findOne({ job: jobId, customer: req.user._id });
  if (existing) return res.status(400).json({ error: 'You have already reviewed this job' });

  let review;
  try {
    review = await Review.create({
      job: jobId,
      customer: req.user._id,
      worker: job.assignedWorker,
      rating: numericRating,
      comment: comment?.trim(),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ error: 'You have already reviewed this job' });
    }
    throw error;
  }

  const allReviews = await Review.find({ worker: job.assignedWorker });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await User.findByIdAndUpdate(job.assignedWorker, {
    rating: Math.round(avgRating * 10) / 10,
    totalReviews: allReviews.length,
    $inc: { completedJobs: 1 },
  });

  return res.status(201).json({ message: 'Review posted', review });
}

async function getWorkerReviews(req, res) {
  const reviews = await Review.find({ worker: req.params.workerId })
    .populate('customer', 'name profilePicture')
    .populate('job', 'title category')
    .sort({ createdAt: -1 });

  return res.json({ reviews });
}

async function getMyReviews(req, res) {
  const filter = req.user.role === 'worker'
    ? { worker: req.user._id }
    : { customer: req.user._id };

  const reviews = await Review.find(filter)
    .populate('customer', 'name profilePicture')
    .populate('worker', 'name profilePicture')
    .populate('job', 'title category')
    .sort({ createdAt: -1 });

  return res.json({ reviews });
}

module.exports = { postReview, getWorkerReviews, getMyReviews };
