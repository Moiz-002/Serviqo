const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Review = require('../models/Review');

async function searchWorkers(req, res) {
  const { category, city, q, page = 1, limit = 10 } = req.query;
  const filter = { role: 'worker', isVerified: true, isActive: true };
  if (category) filter.serviceCategory = category;
  if (city) filter.city = city;
  if (q) filter.name = { $regex: q, $options: 'i' };

  const workers = await User.find(filter)
    .select('-password -otp -otpExpiry -cnicFront -cnicBack')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ rating: -1, completedJobs: -1 });

  const total = await User.countDocuments(filter);

  return res.json({
    workers,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  });
}

async function getWorkerPublicProfile(req, res) {
  const worker = await User.findOne({
    _id: req.params.workerId,
    role: 'worker',
  }).select('name profilePicture city role serviceCategory skills bio experience hourlyRate portfolio availability responseTime rating totalReviews completedJobs');

  if (!worker) return res.status(404).json({ error: 'Worker not found' });

  const reviews = await Review.find({ worker: worker._id })
    .populate('customer', 'name profilePicture')
    .sort({ createdAt: -1 })
    .limit(10);

  return res.json({ worker, reviews });
}

async function getWorkerDashboard(req, res) {
  const workerId = req.user._id;

  const [pendingBids, activeJobs, completedJobs, recentReviews, worker] = await Promise.all([
    Bid.countDocuments({ worker: workerId, status: 'pending' }),
    Job.countDocuments({ assignedWorker: workerId, status: 'active' }),
    Job.countDocuments({ assignedWorker: workerId, status: 'completed' }),
    Review.find({ worker: workerId })
      .populate('customer', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(5),
    User.findById(workerId).select('-password -otp -otpExpiry'),
  ]);

  const recentJobs = await Job.find({ assignedWorker: workerId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('customer', 'name profilePicture');

  return res.json({
    stats: { pendingBids, activeJobs, completedJobs },
    recentReviews,
    recentJobs,
    worker,
  });
}

async function updateWorkerProfile(req, res) {
  const { bio, experience, hourlyRate, serviceCategory, city, address, name, email } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (email !== undefined) updates.email = String(email).trim().toLowerCase();
  if (bio !== undefined) updates.bio = bio;
  if (experience !== undefined) {
    const value = Number(experience);
    if (!Number.isFinite(value) || value < 0) {
      return res.status(400).json({ error: 'Experience must be a non-negative number' });
    }
    updates.experience = value;
  }
  if (hourlyRate !== undefined) {
    const value = Number(hourlyRate);
    if (!Number.isFinite(value) || value < 0) {
      return res.status(400).json({ error: 'Hourly rate must be a non-negative number' });
    }
    updates.hourlyRate = value;
  }
  if (serviceCategory !== undefined) updates.serviceCategory = serviceCategory;
  if (city !== undefined) updates.city = city;
  if (address !== undefined) updates.address = address;
  
  if (req.file) {
    const currentUser = await User.findById(req.user._id);
    if (currentUser.profilePicture) {
      const { deleteFromCloudinary } = require('../middlewares/upload');
      await deleteFromCloudinary(currentUser.profilePicture);
    }
    updates.profilePicture = req.file.path;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, select: '-password -otp -otpExpiry' }
  );

  if (!user) return res.status(404).json({ error: 'Worker not found' });
  return res.json({ message: 'Profile updated', user });
}

async function updateSkills(req, res) {
  const { skills, serviceCategory, hourlyRate } = req.body;
  const updates = {};
  if (skills !== undefined) {
    if (!Array.isArray(skills) || skills.some((skill) => typeof skill !== 'string')) {
      return res.status(400).json({ error: 'Skills must be an array of text values' });
    }
    updates.skills = skills.map((skill) => skill.trim()).filter(Boolean);
  }
  if (serviceCategory !== undefined) updates.serviceCategory = serviceCategory;
  if (hourlyRate !== undefined) {
    const value = Number(hourlyRate);
    if (!Number.isFinite(value) || value < 0) {
      return res.status(400).json({ error: 'Hourly rate must be a non-negative number' });
    }
    updates.hourlyRate = value;
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, select: 'skills serviceCategory hourlyRate' }
  );
  if (!user) return res.status(404).json({ error: 'Worker not found' });
  return res.json({ message: 'Skills updated', user });
}

async function updateAvailability(req, res) {
  const { availability, responseTime } = req.body;
  const updates = {};
  if (availability !== undefined) {
    if (!availability || typeof availability !== 'object' || Array.isArray(availability)) {
      return res.status(400).json({ error: 'Availability must be an object' });
    }
    updates.availability = availability;
  }
  if (responseTime !== undefined) updates.responseTime = responseTime;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, select: 'availability responseTime' }
  );
  if (!user) return res.status(404).json({ error: 'Worker not found' });
  return res.json({ message: 'Availability updated', availability: user.availability, responseTime: user.responseTime });
}

async function addPortfolioItem(req, res) {
  const { caption, title } = req.body;
  const image = req.file ? req.file.path : undefined;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { portfolio: { title: caption || title || 'Work photo', image } } },
    { new: true, select: 'portfolio' }
  );

  if (!user) return res.status(404).json({ error: 'Worker not found' });
  const newItem = user.portfolio[user.portfolio.length - 1];
  return res.status(201).json({ message: 'Portfolio item added', item: newItem });
}

async function removePortfolioItem(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: 'Worker not found' });
  const item = user.portfolio.id(req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Portfolio item not found' });
  
  if (item.image) {
    const { deleteFromCloudinary } = require('../middlewares/upload');
    await deleteFromCloudinary(item.image);
  }

  user.portfolio.pull(req.params.itemId);
  await user.save();

  return res.json({ message: 'Portfolio item removed', portfolio: user.portfolio });
}

async function uploadCnic(req, res) {
  const updates = {};
  if (req.files?.cnicFront?.[0]) {
    updates.cnicFront = req.files.cnicFront[0].path;
  }
  if (req.files?.cnicBack?.[0]) {
    updates.cnicBack = req.files.cnicBack[0].path;
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const user = await User.findById(req.user._id);
  
  // Optional: delete old CNICs if they exist
  const { deleteFromCloudinary } = require('../middlewares/upload');
  if (updates.cnicFront && user.cnicFront) await deleteFromCloudinary(user.cnicFront);
  if (updates.cnicBack && user.cnicBack) await deleteFromCloudinary(user.cnicBack);

  Object.assign(user, updates, { cnicVerified: false });
  user.cnicRejectionReason = undefined;
  await user.save();

  return res.json({ message: 'CNIC uploaded successfully', user: {
    cnicFront: user.cnicFront,
    cnicBack: user.cnicBack,
    cnicVerified: user.cnicVerified
  }});
}

module.exports = {
  searchWorkers,
  getWorkerPublicProfile,
  getWorkerDashboard,
  updateWorkerProfile,
  updateSkills,
  updateAvailability,
  addPortfolioItem,
  removePortfolioItem,
  uploadCnic,
};
