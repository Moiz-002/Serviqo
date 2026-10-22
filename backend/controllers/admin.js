const User = require('../models/User');
const Job = require('../models/Job');
const Dispute = require('../models/Dispute');
const Review = require('../models/Review');
const { emitToUser, createNotification } = require('../services/realtime');

function parseAnalyticsDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
    ? null
    : parsed;
}

async function getAnalytics(req, res) {
  const { startDate, endDate } = req.query;
  if (Boolean(startDate) !== Boolean(endDate)) {
    return res.status(400).json({ error: 'Both startDate and endDate are required' });
  }

  let dateFilter;
  let dates = [];
  if (startDate && endDate) {
    const start = parseAnalyticsDate(startDate);
    const end = parseAnalyticsDate(endDate);
    if (!start || !end || start > end) {
      return res.status(400).json({ error: 'A valid date range is required' });
    }
    const endExclusive = new Date(end);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    if (endExclusive.getTime() - start.getTime() > 366 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({ error: 'Analytics date ranges cannot exceed 366 days' });
    }
    dateFilter = { $gte: start, $lt: endExclusive };
    for (let cursor = new Date(start); cursor < endExclusive; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      dates.push(cursor.toISOString().slice(0, 10));
    }
  }

  const userDateCriteria = dateFilter ? { createdAt: dateFilter } : {};
  const jobDateCriteria = dateFilter ? { createdAt: dateFilter } : {};
  const [
    totalUsers,
    totalWorkers,
    totalCustomers,
    totalJobs,
    activeJobs,
    completedJobs,
    pendingVerifications,
    openDisputes,
    userActivity,
    jobActivity,
    jobCategories,
  ] = await Promise.all([
    User.countDocuments({ ...userDateCriteria, role: { $in: ['customer', 'worker'] } }),
    User.countDocuments({ ...userDateCriteria, role: 'worker' }),
    User.countDocuments({ ...userDateCriteria, role: 'customer' }),
    Job.countDocuments(jobDateCriteria),
    Job.countDocuments({ ...jobDateCriteria, status: 'active' }),
    Job.countDocuments({ ...jobDateCriteria, status: 'completed' }),
    User.countDocuments({
      ...userDateCriteria,
      role: 'worker',
      cnicFront: { $exists: true, $ne: null },
      cnicVerified: false,
    }),
    Dispute.countDocuments({ ...(dateFilter ? { createdAt: dateFilter } : {}), status: 'open' }),
    dateFilter ? User.aggregate([
      { $match: { ...userDateCriteria, role: { $in: ['customer', 'worker'] } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
    ]) : [],
    dateFilter ? Job.aggregate([
      { $match: jobDateCriteria },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
    ]) : [],
    dateFilter ? Job.aggregate([
      { $match: jobDateCriteria },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]) : [],
  ]);

  const usersByDate = new Map(dates.map((date) => [date, 0]));
  const jobsByDate = new Map(dates.map((date) => [date, 0]));
  const categoriesTotal = jobCategories.reduce((sum, item) => sum + item.count, 0);
  for (const item of userActivity) {
    usersByDate.set(item._id.date, (usersByDate.get(item._id.date) || 0) + item.count);
  }
  for (const item of jobActivity) {
    jobsByDate.set(item._id.date, (jobsByDate.get(item._id.date) || 0) + item.count);
  }

  return res.json({
    users: { total: totalUsers, workers: totalWorkers, customers: totalCustomers },
    jobs: { total: totalJobs, active: activeJobs, completed: completedJobs },
    pendingVerifications,
    openDisputes,
    dateRange: startDate && endDate ? { startDate, endDate } : null,
    trend: dates.map((date) => ({
      date,
      users: usersByDate.get(date) || 0,
      jobs: jobsByDate.get(date) || 0,
    })),
    categories: jobCategories.map((item) => ({
      name: item._id || 'Uncategorized',
      count: item.count,
      percentage: categoriesTotal ? Math.round((item.count / categoriesTotal) * 100) : 0,
    })),
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
  }).select('name phone email city profilePicture serviceCategory cnicFront cnicBack createdAt cnicRejectionReason');

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
