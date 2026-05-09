const express = require('express');
const {
  getAnalytics,
  getUsers,
  updateUserStatus,
  getAllJobs,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getDisputes,
  resolveDispute,
} = require('../controllers/admin');
const { checkAuth, checkRole } = require('../middlewares/auth');

const router = express.Router();

router.use(checkAuth);
router.use(checkRole('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:userId/status', updateUserStatus);
router.get('/jobs', getAllJobs);
router.get('/verifications', getPendingVerifications);
router.put('/verifications/:userId/approve', approveVerification);
router.put('/verifications/:userId/reject', rejectVerification);
router.get('/disputes', getDisputes);
router.put('/disputes/:disputeId/resolve', resolveDispute);

module.exports = router;
