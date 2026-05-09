const express = require('express');
const {
  getWorkerDashboard,
  updateWorkerProfile,
  updateSkills,
  updateAvailability,
  addPortfolioItem,
  removePortfolioItem,
  uploadCnic,
} = require('../controllers/worker');
const { checkAuth, checkRole } = require('../middlewares/auth');
const { uploadProfile, uploadCnic: cnicUpload, uploadPortfolio } = require('../middlewares/upload');

const router = express.Router();

router.use(checkAuth);
router.use(checkRole('worker'));

router.get('/dashboard', getWorkerDashboard);
router.put('/profile', uploadProfile.single('profilePicture'), updateWorkerProfile);
router.put('/skills', updateSkills);
router.put('/availability', updateAvailability);
router.post('/portfolio', uploadPortfolio.single('image'), addPortfolioItem);
router.delete('/portfolio/:itemId', removePortfolioItem);
router.post('/cnic', cnicUpload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
]), uploadCnic);

module.exports = router;
