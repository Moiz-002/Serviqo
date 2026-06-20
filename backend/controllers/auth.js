const bcrypt = require('bcrypt');
const User = require('../models/User');
const { createToken } = require('../services/auth');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function setAuthCookies(res, token, user) {
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge,
  });

  res.cookie('serviqo_session', `${user.role}:${user._id}`, {
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge,
  });
}

async function handleSignup(req, res) {
  const { name, phone, email, password, role } = req.body;

  const existing = await User.findOne({ phone });
  if (existing) return res.status(400).json({ error: 'Phone number already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    name,
    phone,
    email: email || undefined,
    password: hashedPassword,
    role: role || 'customer',
    otp,
    otpExpiry,
  });

  console.log(`OTP for ${phone}: ${otp}`);

  return res.status(201).json({
    message: 'Account created. Please verify your phone number.',
    userId: user._id,
    ...(process.env.NODE_ENV === 'development' && { otp }),
  });
}

async function handleVerifyOtp(req, res) {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  if (new Date() > user.otpExpiry) return res.status(400).json({ error: 'OTP expired' });

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const token = createToken(user);
  setAuthCookies(res, token, user);

  return res.json({
    message: 'Account verified successfully',
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
  });
}

const HARDCODED_ADMIN_EMAIL = 'admin@serviqo.com';
const HARDCODED_ADMIN_PASS = 'VeryStrongAdminPass1172';
const ADMIN_TOTP = '123456';
const PLACEHOLDER_ADMIN_ID = '000000000000000000000000';

async function resolveAdminCredentials(identifier, password) {
  if (identifier === HARDCODED_ADMIN_EMAIL && password === HARDCODED_ADMIN_PASS) {
    let user = await User.findOne({ email: identifier, role: 'admin' });
    if (!user) user = await User.findOne({ role: 'admin' });
    if (user) return user;
    return {
      _id: PLACEHOLDER_ADMIN_ID,
      name: 'System Admin',
      phone: '0000000000',
      email: HARDCODED_ADMIN_EMAIL,
      role: 'admin',
    };
  }

  const user = await User.findOne({
    $or: [{ phone: identifier }, { email: identifier }],
    role: 'admin',
  });
  if (!user) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;
  return user;
}

async function handleLogin(req, res) {
  const { identifier, password } = req.body;

  // Block all admin logins from the customer/worker login flow.
  // Admin authentication must go through /auth/admin-login only.
  if (identifier === HARDCODED_ADMIN_EMAIL) {
    return res.status(403).json({
      error: 'Admin accounts must sign in through the admin portal at /admin/login.',
    });
  }

  const user = await User.findOne({
    $or: [{ phone: identifier }, { email: identifier }],
  });

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  if (user.role === 'admin') {
    return res.status(403).json({
      error: 'Admin accounts must sign in through the admin portal at /admin/login.',
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  if (!user.isVerified) {
    return res.status(403).json({ error: 'Account not verified', userId: user._id });
  }
  if (!user.isActive) {
    return res.status(403).json({ error: 'Account suspended. Contact support.' });
  }

  const token = createToken(user);
  setAuthCookies(res, token, user);

  return res.json({
    message: 'Login successful',
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
  });
}

async function handleAdminLogin(req, res) {
  const { identifier, password, totp } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (!totp) {
    return res.status(400).json({ error: 'Verification code is required.' });
  }

  // TOTP check (demo: hardcoded 123456). In production replace with a real TOTP/HOTP verifier.
  if (totp !== ADMIN_TOTP) {
    return res.status(401).json({ error: 'Invalid verification code.' });
  }

  const user = await resolveAdminCredentials(identifier.trim(), password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = createToken(user);
  setAuthCookies(res, token, user);

  return res.json({
    message: 'Admin login successful',
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: 'admin',
    },
  });
}

async function handleVerifyAdminCredentials(req, res) {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const user = await resolveAdminCredentials(identifier.trim(), password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }
  return res.json({ message: 'Credentials valid. Proceed to verification.' });
}

async function handleLogout(req, res) {
  const isProd = process.env.NODE_ENV === 'production';
  // Clear cookies using the same attributes they were set with.
  res.clearCookie('token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
  res.clearCookie('serviqo_session', { secure: isProd, sameSite: isProd ? 'none' : 'lax' });
  return res.json({ message: 'Logged out successfully' });
}

async function handleForgotPassword(req, res) {
  const { identifier } = req.body;

  const user = await User.findOne({
    $or: [{ phone: identifier }, { email: identifier }],
  });

  if (!user) return res.status(404).json({ error: 'No account found with this phone or email' });

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  console.log(`Password reset OTP for ${identifier}: ${otp}`);

  return res.json({
    message: 'OTP sent for password reset',
    userId: user._id,
    ...(process.env.NODE_ENV === 'development' && { otp }),
  });
}

async function handleResetPassword(req, res) {
  const { userId, otp, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  if (new Date() > user.otpExpiry) return res.status(400).json({ error: 'OTP expired' });

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  return res.json({ message: 'Password reset successfully' });
}

async function handleResendOtp(req, res) {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  console.log(`Resent OTP for ${user.phone}: ${otp}`);

  return res.json({
    message: 'OTP resent',
    ...(process.env.NODE_ENV === 'development' && { otp }),
  });
}

async function handleRequestLoginOtp(req, res) {
  const { phone, role } = req.body;

  const user = await User.findOne({ phone, role });
  if (!user) {
    return res.status(404).json({ error: 'This phone number is not registered for the selected role' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account suspended. Contact support.' });
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  console.log(`Login OTP for ${phone}: ${otp}`);

  return res.json({
    message: 'OTP sent successfully',
    userId: user._id,
    ...(process.env.NODE_ENV === 'development' && { otp }),
  });
}

async function handleVerifyLoginOtp(req, res) {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  if (new Date() > user.otpExpiry) return res.status(400).json({ error: 'OTP expired' });

  user.otp = undefined;
  user.otpExpiry = undefined;
  user.isVerified = true; // Ensure user is marked verified if logging in via OTP
  await user.save();

  const token = createToken(user);
  setAuthCookies(res, token, user);

  return res.json({
    message: 'Login successful',
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
  });
}

async function createAdminAccount(req, res) {
  const { name, phone, email, password, adminSecret } = req.body;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const existing = await User.findOne({ phone });
  if (existing) return res.status(400).json({ error: 'Phone already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    email: email || undefined,
    password: hashedPassword,
    role: 'admin',
    isVerified: true,
  });

  return res.status(201).json({
    message: 'Admin account created',
    userId: user._id,
  });
}

async function checkAvailability(req, res) {
  const { phone, email } = req.body;
  const results = { phoneAvailable: true, emailAvailable: true };

  if (phone) {
    const phoneExists = await User.exists({ phone });
    if (phoneExists) results.phoneAvailable = false;
  }

  if (email) {
    const emailExists = await User.exists({ email });
    if (emailExists) results.emailAvailable = false;
  }

  return res.json(results);
}

module.exports = {
  handleSignup,
  handleVerifyOtp,
  handleLogin,
  handleAdminLogin,
  handleVerifyAdminCredentials,
  handleLogout,
  handleForgotPassword,
  handleResetPassword,
  handleResendOtp,
  handleRequestLoginOtp,
  handleVerifyLoginOtp,
  createAdminAccount,
  checkAvailability,
};
