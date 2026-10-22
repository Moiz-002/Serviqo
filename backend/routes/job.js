const express = require('express');
const {
  createJob,
  getJobs,
  getPublicJobs,
  getPublicJobById,
  getJobById,
  updateJob,
  deleteJob,
  markJobComplete,
} = require('../controllers/job');
const { checkAuth, checkRole } = require('../middlewares/auth');
const { uploadJobImages } = require('../middlewares/upload');
const {
  getJobRecommendations,
  submitRecommendationFeedback,
  inviteRecommendedWorker,
} = require('../controllers/recommendation');

const router = express.Router();

router.get('/public', getPublicJobs);
router.get('/public/:jobId', getPublicJobById);

router.use(checkAuth);

router.post('/', checkRole('customer'), uploadJobImages.array('images', 5), createJob);
router.get('/', getJobs);
router.post('/:jobId/recommendations/invite', checkRole('customer'), inviteRecommendedWorker);
router.get('/:jobId/recommendations', checkRole('customer'), getJobRecommendations);
router.put('/:jobId/recommendations/feedback', checkRole('customer'), submitRecommendationFeedback);
router.get('/:jobId', getJobById);
router.put('/:jobId', checkRole('customer'), updateJob);
router.delete('/:jobId', checkRole('customer'), deleteJob);
router.patch('/:jobId/complete', checkRole('customer'), markJobComplete);

module.exports = router;
