const User = require('../models/User');
const Job = require('../models/Job');
const Dispute = require('../models/Dispute');
const Review = require('../models/Review');

async function getAnalytics(req, res) {
  const [
    totalUsers,
    totalWorkers,
    totalCustomers,
    totalJobs,
    activeJobs,
    completedJobs,
    pendingVerifications,
    openDisputes,
  ] = await Promise.all([
    User.countDocuments({ role: { $in: ['customer', 'worker'] } }),
    User.countDocuments({ role: 'worker' }),
    User.countDocuments({ role: 'customer' }),
    Job.countDocuments(),
    Job.countDocuments({ status: 'active' }),
    Job.countDocuments({ status: 'completed' }),
    User.countDocuments({ role: 'worker', cnicFront: { $exists: true, $ne: null }, cnicVerified: false }),
    Dispute.countDocuments({ status: 'open' }),
  ]);

  return res.json({
    users: { total: totalUsers, workers: totalWorkers, customers: totalCustomers },
    jobs: { total: totalJobs, active: activeJobs, completed: completedJobs },
    pendingVerifications,
    openDisputes,
  });
}

async function getUsers(req, res) {
  const { role, status, q, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (q) filter.$or = [
    { name: { $regex: q, $options: 'i' } },
    { phone: { $regex: q, $options: 'i' } },
  ];

  const users = await User.find(filter)
    .select('-password -otp -otpExpiry')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  return res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
}

async function updateUserStatus(req, res) {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isActive },
    { new: true, select: '-password -otp -otpExpiry' }
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ message: `User ${isActive ? 'activated' : 'deactivated'}`, user });
}

async function getAllJobs(req, res) {
  const { status, category, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const jobs = await Job.find(filter)
    .populate('customer', 'name phone')
    .populate('assignedWorker', 'name phone')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Job.countDocuments(filter);

  return res.json({ jobs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
}

async function getPendingVerifications(req, res) {
  const workers = await User.find({
    role: 'worker',
    cnicFront: { $exists: true, $ne: null },
    cnicVerified: false,
  }).select('name phone email city cnicFront cnicBack createdAt cnicRejectionReason');

  return res.json({ verifications: workers });
}

async function approveVerification(req, res) {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { cnicVerified: true, $unset: { cnicRejectionReason: 1 } },
    { new: true, select: '-password -otp -otpExpiry' }
  );
  if (!user) return res.status(404).json({ error: 'Worker not found' });
  return res.json({ message: 'Worker CNIC verified', user });
}

async function rejectVerification(req, res) {
  const { reason } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { cnicVerified: false, cnicRejectionReason: reason },
    { new: true, select: '-password -otp -otpExpiry' }
  );
  if (!user) return res.status(404).json({ error: 'Worker not found' });
  return res.json({ message: 'Verification rejected', user });
}

async function getDisputes(req, res) {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const disputes = await Dispute.find(filter)
    .populate('job', 'title status')
    .populate('raisedBy', 'name role')
    .populate('against', 'name role')
    .populate('resolvedBy', 'name')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Dispute.countDocuments(filter);

  return res.json({ disputes, total, page: Number(page), totalPages: Math.ceil(total / limit) });
}

async function resolveDispute(req, res) {
  const { resolution, status } = req.body;
  const dispute = await Dispute.findByIdAndUpdate(
    req.params.disputeId,
    { status: status || 'resolved', resolution, resolvedBy: req.user._id },
    { new: true }
  ).populate('job', 'title').populate('raisedBy', 'name').populate('against', 'name');

  if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
  return res.json({ message: 'Dispute resolved', dispute });
}

async function createDispute(req, res) {
  const { jobId, againstUserId, reason, description } = req.body;

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const dispute = await Dispute.create({
    job: jobId,
    raisedBy: req.user._id,
    against: againstUserId,
    reason,
    description,
  });

  return res.status(201).json({ message: 'Dispute raised successfully', dispute });
}

module.exports = {
  getAnalytics,
  getUsers,
  updateUserStatus,
  getAllJobs,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getDisputes,
  resolveDispute,
  createDispute,
};
