const User = require('../models/User');
const Job = require('../models/Job');
const Dispute = require('../models/Dispute');
const Review = require('../models/Review');
const { emitToUser, createNotification } = require('../services/realtime');

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
  const { role, status, q, search, page = 1, limit = 10 } = req.query;
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
  const filter = {};
  if (role && ['customer', 'worker', 'admin'].includes(role)) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (status === 'approved') {
    filter.$and = [{
      $or: [
      { role: 'worker', cnicVerified: true },
      { role: 'customer', isVerified: true },
      ],
    }];
  }
  if (status === 'rejected') filter.cnicRejectionReason = { $exists: true, $ne: '' };
  if (status === 'pending') {
    filter.role = 'worker';
    filter.cnicVerified = false;
    filter.cnicRejectionReason = { $exists: false };
  }
  const searchTerm = String(search || q || '').trim().slice(0, 100);
  if (searchTerm) {
    const searchClause = {
      $or: [
    { name: { $regex: searchTerm, $options: 'i' } },
    { phone: { $regex: searchTerm, $options: 'i' } },
    { email: { $regex: searchTerm, $options: 'i' } },
      ],
    };
    filter.$and = [...(filter.$and || []), searchClause];
  }

  const users = await User.find(filter)
    .select('-password -otp -otpExpiry')
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  return res.json({ users, total, page: currentPage, totalPages: Math.ceil(total / pageSize) });
}

async function updateUserStatus(req, res) {
  const { isActive, status } = req.body;
  const nextIsActive = typeof isActive === 'boolean'
    ? isActive
    : status === 'active'
      ? true
      : status === 'suspended' || status === 'inactive'
        ? false
        : undefined;
  if (nextIsActive === undefined) {
    return res.status(400).json({ error: 'isActive or a valid status is required' });
  }
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isActive: nextIsActive },
    { new: true, select: '-password -otp -otpExpiry' }
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ message: `User ${nextIsActive ? 'activated' : 'deactivated'}`, user });
}

async function getAllJobs(req, res) {
  const { status, category, page = 1, limit = 10 } = req.query;
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const jobs = await Job.find(filter)
    .populate('customer', 'name phone')
    .populate('assignedWorker', 'name phone')
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  const total = await Job.countDocuments(filter);

  return res.json({ jobs, total, page: currentPage, totalPages: Math.ceil(total / pageSize) });
}

async function getPendingVerifications(req, res) {
  const workers = await User.find({
    role: 'worker',
    cnicFront: { $exists: true, $ne: null },
    cnicVerified: false,
    cnicRejectionReason: { $exists: false },
  }).select('name phone email city cnicFront cnicBack createdAt cnicRejectionReason');

  return res.json({ verifications: workers, workers });
}

async function approveVerification(req, res) {
  const user = await User.findByIdAndUpdate(
    { _id: req.params.userId, role: 'worker' },
    { cnicVerified: true, $unset: { cnicRejectionReason: 1 } },
    { new: true, select: '-password -otp -otpExpiry' }
  );
  if (!user) return res.status(404).json({ error: 'Worker not found' });
  emitToUser(user._id, 'worker:verification', {
    status: 'approved',
    message: 'Your worker verification has been approved. You can now submit bids.',
  });
  await createNotification(user._id, {
    type: 'worker_verification',
    title: 'Verification approved',
    message: 'Your worker verification was approved. You can now submit bids.',
  });
  return res.json({ message: 'Worker CNIC verified', user });
}

async function rejectVerification(req, res) {
  const reason = String(req.body.reason || '').trim();
  if (!reason) return res.status(400).json({ error: 'A rejection reason is required' });
  const user = await User.findByIdAndUpdate(
    { _id: req.params.userId, role: 'worker' },
    { cnicVerified: false, cnicRejectionReason: reason },
    { new: true, select: '-password -otp -otpExpiry' }
  );
  if (!user) return res.status(404).json({ error: 'Worker not found' });
  emitToUser(user._id, 'worker:verification', {
    status: 'rejected',
    reason,
    message: `Your worker verification needs changes: ${reason}`,
  });
  await createNotification(user._id, {
    type: 'worker_verification',
    title: 'Verification needs changes',
    message: reason,
  });
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
