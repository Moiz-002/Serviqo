const express = require('express');
const { getProfile, updateProfile } = require('../controllers/user');
const { checkAuth } = require('../middlewares/auth');
const { uploadProfile } = require('../middlewares/upload');

const router = express.Router();

router.use(checkAuth);

router.get('/me', getProfile);
router.put('/profile', uploadProfile.single('profilePicture'), updateProfile);

module.exports = router;
