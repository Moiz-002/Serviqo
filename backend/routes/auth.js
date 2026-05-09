const express = require('express');
const {
  handleSignup,
  handleVerifyOtp,
  handleLogin,
  handleAdminLogin,
  handleVerifyAdminCredentials,
  handleRequestLoginOtp,
  handleVerifyLoginOtp,
  handleLogout,
  handleForgotPassword,
  handleResetPassword,
  handleResendOtp,
  createAdminAccount,
  checkAvailability,
} = require('../controllers/auth');

const router = express.Router();

router.post('/signup', handleSignup);
router.post('/check-availability', checkAvailability);
router.post('/verify-otp', handleVerifyOtp);
router.post('/login', handleLogin);
router.post('/admin-login/verify-credentials', handleVerifyAdminCredentials);
router.post('/admin-login', handleAdminLogin);
router.post('/request-login-otp', handleRequestLoginOtp);
router.post('/verify-login-otp', handleVerifyLoginOtp);
router.post('/logout', handleLogout);
router.post('/forgot-password', handleForgotPassword);
router.post('/reset-password', handleResetPassword);
router.post('/resend-otp', handleResendOtp);
router.post('/create-admin', createAdminAccount);

module.exports = router;
