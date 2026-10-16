const Job = require('../models/Job');
const Review = require('../models/Review');
const { emitToUsers } = require('../services/realtime');

function validateJobInput({ title, description, category, budgetRange, urgency, city, area }) {
  const required = { title, description, category, budgetRange, urgency, city, area };
  const missing = Object.entries(required)
    .filter(([, value]) => typeof value !== 'string' || !value.trim())
    .map(([field]) => field);

  if (missing.length) return `Missing required fields: ${missing.join(', ')}`;
  if (title.trim().length < 5 || title.trim().length > 120) {
    return 'Title must be between 5 and 120 characters';
  }
  if (description.trim().length < 20 || description.trim().length > 5000) {
    return 'Description must be between 20 and 5,000 characters';
  }
  if (city.trim().length > 100 || area.trim().length > 150) {
    return 'Location fields are too long';
  }
  return null;
}

async function createJob(req, res) {
  const { title, description, category, budgetRange, urgency, city, area } = req.body;
  const validationError = validateJobInput(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const images = req.files ? req.files.map(f => f.path) : [];

  const job = await Job.create({
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    budgetRange: budgetRange.trim(),
    urgency: urgency.trim(),
    location: { city: city.trim(), area: area.trim() },
    customer: req.user._id,
    images,
  });

  return res.status(201).json({ message: 'Job posted successfully', job });
}

async function getJobs(req, res) {
  const { status, category, city, q, page = 1, limit = 10 } = req.query;
  const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 50);
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
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  const total = await Job.countDocuments(filter);

  return res.json({ jobs, total, page: pageNumber, totalPages: Math.ceil(total / pageSize) });
}

async function getJobById(req, res) {
  const job = await Job.findById(req.params.jobId)
    .populate('customer', 'name profilePicture city phone')
    .populate('assignedWorker', 'name profilePicture rating completedJobs')
    .populate('acceptedBid')
    .lean();

  if (!job) return res.status(404).json({ error: 'Job not found' });
  const userId = String(req.user._id);
  const isOwner = String(job.customer._id || job.customer) === userId;
  const isAssignedWorker = job.assignedWorker && String(job.assignedWorker._id || job.assignedWorker) === userId;
  if (req.user.role !== 'admin' && !isOwner && !isAssignedWorker && !(req.user.role === 'worker' && job.status === 'open')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (job.status === 'completed') {
    job.review = await Review.findOne({ job: job._id, customer: job.customer._id || job.customer })
      .populate('worker', 'name profilePicture')
      .lean();
  }

  return res.json({ job });
}

async function updateJob(req, res) {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.customer.toString() !== String(req.user._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (job.status !== 'open') {
    return res.status(400).json({ error: 'Only open jobs can be edited' });
  }

  const { title, description, category, budgetRange, urgency, city, area } = req.body;
  const validationError = validateJobInput({
    title: title ?? job.title,
    description: description ?? job.description,
    category: category ?? job.category,
    budgetRange: budgetRange ?? job.budgetRange,
    urgency: urgency ?? job.urgency,
    city: city ?? job.location.city,
    area: area ?? job.location.area,
  });
  if (validationError) return res.status(400).json({ error: validationError });

  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (category !== undefined) updates.category = category.trim();
  if (budgetRange !== undefined) updates.budgetRange = budgetRange.trim();
  if (urgency !== undefined) updates.urgency = urgency.trim();
  if (city !== undefined || area !== undefined) {
    updates.location = {
      city: city !== undefined ? city.trim() : job.location.city,
      area: area !== undefined ? area.trim() : job.location.area,
    };
  }

  const updatedJob = await Job.findByIdAndUpdate(req.params.jobId, updates, { new: true });
  return res.json({ message: 'Job updated', job: updatedJob });
}

async function deleteJob(req, res) {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.customer.toString() !== String(req.user._id)) {
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
  if (job.customer.toString() !== String(req.user._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (job.status !== 'active') {
    return res.status(400).json({ error: 'Only active jobs can be marked complete' });
  }

  job.status = 'completed';
  await job.save();
  emitToUsers([job.customer, job.assignedWorker], 'job:status', {
    jobId: String(job._id),
    status: job.status,
    job,
  });

  return res.json({ message: 'Job marked as completed', job });
}

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, markJobComplete };
