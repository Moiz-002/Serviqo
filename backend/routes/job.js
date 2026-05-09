const express = require('express');
const { createJob, getJobs, getJobById, updateJob, deleteJob, markJobComplete } = require('../controllers/job');
const { checkAuth, checkRole } = require('../middlewares/auth');
const { uploadJobImages } = require('../middlewares/upload');

const router = express.Router();

router.use(checkAuth);

router.post('/', checkRole('customer'), uploadJobImages.array('images', 5), createJob);
router.get('/', getJobs);
router.get('/:jobId', getJobById);
router.put('/:jobId', checkRole('customer'), updateJob);
router.delete('/:jobId', checkRole('customer'), deleteJob);
router.patch('/:jobId/complete', checkRole('customer'), markJobComplete);

module.exports = router;
