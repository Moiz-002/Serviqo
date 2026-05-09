const Job = require('../models/Job');

async function createJob(req, res) {
  const { title, description, category, budgetRange, urgency, city, area } = req.body;
  const images = req.files ? req.files.map(f => f.path) : [];

  const job = await Job.create({
    title,
    description,
    category,
    budgetRange,
    urgency,
    location: { city, area },
    customer: req.user._id,
    images,
  });

  return res.status(201).json({ message: 'Job posted successfully', job });
}

async function getJobs(req, res) {
  const { status, category, city, q, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (req.user.role === 'customer') {
    filter.customer = req.user._id;
    if (status) filter.status = status;
  } else if (req.user.role === 'worker') {
    filter.status = 'open';
  }

  if (category) filter.category = category;
  if (city) filter['location.city'] = city;
  if (q) filter.title = { $regex: q, $options: 'i' };

  const jobs = await Job.find(filter)
    .populate('customer', 'name profilePicture city')
    .populate('assignedWorker', 'name profilePicture rating')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Job.countDocuments(filter);

  return res.json({ jobs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
}

async function getJobById(req, res) {
  const job = await Job.findById(req.params.jobId)
    .populate('customer', 'name profilePicture city phone')
    .populate('assignedWorker', 'name profilePicture rating completedJobs')
    .populate('acceptedBid');

  if (!job) return res.status(404).json({ error: 'Job not found' });

  return res.json({ job });
}

async function updateJob(req, res) {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.customer.toString() !== req.user._id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (job.status !== 'open') {
    return res.status(400).json({ error: 'Only open jobs can be edited' });
  }

  const { title, description, category, budgetRange, urgency, city, area } = req.body;
  const updates = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (category) updates.category = category;
  if (budgetRange) updates.budgetRange = budgetRange;
  if (urgency) updates.urgency = urgency;
  if (city || area) {
    updates.location = {
      city: city || job.location.city,
      area: area || job.location.area,
    };
  }

  const updatedJob = await Job.findByIdAndUpdate(req.params.jobId, updates, { new: true });
  return res.json({ message: 'Job updated', job: updatedJob });
}

async function deleteJob(req, res) {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (job.status !== 'open') {
    return res.status(400).json({ error: 'Only open jobs can be edited' });
  }

  // Delete images from Cloudinary
  if (job.images && job.images.length > 0) {
    const { deleteFromCloudinary } = require('../middlewares/upload');
    for (const imgUrl of job.images) {
      await deleteFromCloudinary(imgUrl);
    }
  }

  await Job.findByIdAndDelete(req.params.jobId);
  return res.json({ message: 'Job deleted' });
}

async function markJobComplete(req, res) {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.customer.toString() !== req.user._id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (job.status !== 'active') {
    return res.status(400).json({ error: 'Only active jobs can be marked complete' });
  }

  job.status = 'completed';
  await job.save();

  return res.json({ message: 'Job marked as completed', job });
}

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, markJobComplete };
