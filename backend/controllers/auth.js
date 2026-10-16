const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const { createToken } = require('../services/auth');
const { sendWhatsAppOtp } = require('../services/whatsapp');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeIdentifier(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  const email = normalizeIdentifier(value);
  return email ? email.toLowerCase() : undefined;
}

function normalizePhone(value) {
  const phone = normalizeIdentifier(value).replace(/[^\d+]/g, '');
  return /^\d{10}$/.test(phone) ? `+92${phone}` : phone;
}

function isValidPassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && /[A-Z]/.test(password)
    && /[0-9]/.test(password)
    && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
}

function hashPasswordResetOtp(otp) {
  return crypto.createHmac('sha256', process.env.JWT_SECRET)
    .update(otp)
    .digest();
}

async function deliverOtp(phone, otp) {
  try {
    await sendWhatsAppOtp(phone, otp);
    return null;
  } catch (error) {
    console.error('WhatsApp OTP delivery failed:', error.message);
    return 'OTP delivery is temporarily unavailable. Please try again.';
  }
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
  const {
    name: rawName,
    phone: rawPhone,
    email: rawEmail,
    password,
    role,
  } = req.body || {};
  const name = normalizeIdentifier(rawName);
  const phone = normalizePhone(rawPhone);
  const email = normalizeEmail(rawEmail);

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone, and password are required' });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and include an uppercase letter, number, and special character',
    });
  }
  if (role && !['customer', 'worker'].includes(role)) {
    return res.status(400).json({ error: 'Invalid account role' });
  }

  const existing = await User.findOne({ phone });
  if (existing) return res.status(400).json({ error: 'Phone number already registered' });
  if (email && await User.findOne({ email })) {
    return res.status(400).json({ error: 'Email address already registered' });
  }

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

  const deliveryError = await deliverOtp(phone, otp);
  if (deliveryError) return res.status(503).json({ error: deliveryError });

  return res.status(201).json({
    message: 'Account created. Please verify your phone number.',
    userId: user._id,
    ...(process.env.NODE_ENV === 'development' && { otp }),
  });
}

async function handleVerifyOtp(req, res) {
  const { userId, otp } = req.body || {};

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!user.otpExpiry || new Date() > user.otpExpiry) {
    return res.status(400).json({ error: 'OTP expired' });
  }
  if (user.otp !== normalizeIdentifier(otp)) return res.status(400).json({ error: 'Invalid OTP' });

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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_2FA_SECRET = process.env.ADMIN_2FA_SECRET?.replace(/\s+/g, '').toUpperCase();

function verifyTotp(secret, token) {
  if (!secret || !/^\d{6}$/.test(token)) return false;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const character of secret) {
    const value = alphabet.indexOf(character);
    if (value < 0) return false;
    bits += value.toString(2).padStart(5, '0');
  }
  const key = Buffer.from(
    bits.match(/.{8}/g)?.map((byte) => Number.parseInt(byte, 2)) || [],
  );
  const counter = Math.floor(Date.now() / 30000);
  for (let offset = -1; offset <= 1; offset += 1) {
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter + offset));
    const digest = crypto.createHmac('sha1', key).update(counterBuffer).digest();
    const index = digest[digest.length - 1] & 15;
    const value = (
      ((digest[index] & 127) << 24)
      | (digest[index + 1] << 16)
      | (digest[index + 2] << 8)
      | digest[index + 3]
    ) % 1000000;
    const expected = String(value).padStart(6, '0');
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))) return true;
  }
  return false;
}

async function resolveAdminCredentials(identifier, password) {
  const user = await User.findOne({
    $or: [{ phone: identifier }, { email: identifier }],
    role: 'admin',
  });
  if (user) {
    return await bcrypt.compare(password, user.password) ? user : null;
  }

  if (!ADMIN_EMAIL || identifier.toLowerCase() !== ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    return null;
  }
  return await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    ? {
      _id: process.env.ADMIN_USER_ID || '000000000000000000000000',
      name: 'System Admin',
      phone: '0000000000',
      email: ADMIN_EMAIL,
      role: 'admin',
    }
    : null;
}

async function handleLogin(req, res) {
  const { password } = req.body || {};
  const rawIdentifier = normalizeIdentifier(req.body?.identifier);
  const isEmailIdentifier = rawIdentifier.includes('@');
  const identifier = isEmailIdentifier ? normalizeEmail(rawIdentifier) : normalizePhone(rawIdentifier);
  const lookupIdentifier = identifier;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/phone and password are required' });
  }

  // Block all admin logins from the customer/worker login flow.
  // Admin authentication must go through /auth/admin-login only.
  if (ADMIN_EMAIL && lookupIdentifier === ADMIN_EMAIL) {
    return res.status(403).json({
      error: 'Admin accounts must sign in through the admin portal at /admin/login.',
    });
  }

  const user = await User.findOne({
    $or: [{ phone: identifier }, { email: lookupIdentifier }],
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
  const {
    identifier: rawIdentifier,
    password,
    totp,
  } = req.body || {};
  const identifier = normalizeIdentifier(rawIdentifier);

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (!totp) {
    return res.status(400).json({ error: 'Verification code is required.' });
  }

  if (!ADMIN_2FA_SECRET) {
    return res.status(503).json({ error: 'Admin two-factor authentication is not configured.' });
  }
  if (!verifyTotp(ADMIN_2FA_SECRET, totp)) {
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
  const {
    identifier: rawIdentifier,
    password,
  } = req.body || {};
  const identifier = normalizeIdentifier(rawIdentifier);
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
  const rawPhone = req.body?.phone;
  if (Array.isArray(rawPhone) || typeof rawPhone !== 'string') {
    return res.status(400).json({ error: 'Enter one registered phone number' });
  }
  const phone = normalizePhone(rawPhone);
  if (!/^\+92\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit Pakistani phone number' });
  }

  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ error: 'No account found with this phone number' });

  const otp = crypto.randomInt(100000, 1000000).toString();
  user.passwordResetOtpHash = hashPasswordResetOtp(otp).toString('hex');
  user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetOtpAttempts = 0;
  await user.save();

  const deliveryError = await deliverOtp(phone, otp);
  if (deliveryError) {
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save();
    return res.status(503).json({ error: deliveryError });
  }

  return res.json({
    message: 'Password reset OTP sent via WhatsApp',
    userId: user._id,
    ...(process.env.NODE_ENV === 'development' && { otp }),
  });
}

async function handleResetPassword(req, res) {
  const { userId, otp: rawOtp, newPassword } = req.body || {};
  const otp = normalizeIdentifier(rawOtp);
  if (!userId || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'A user ID and 6-digit WhatsApp OTP are required' });
  }
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'Password reset request not found' });
  if (!user.passwordResetOtpExpires || user.passwordResetOtpExpires <= new Date()) {
    return res.status(400).json({ error: 'Password reset OTP expired. Request a new code.' });
  }
  if (user.passwordResetOtpAttempts >= 5) {
    return res.status(429).json({ error: 'Too many incorrect codes. Request a new OTP.' });
  }
  const submittedHash = hashPasswordResetOtp(otp);
  const storedHash = Buffer.from(user.passwordResetOtpHash || '', 'hex');
  if (storedHash.length !== submittedHash.length || !crypto.timingSafeEqual(storedHash, submittedHash)) {
    user.passwordResetOtpAttempts = (user.passwordResetOtpAttempts || 0) + 1;
    if (user.passwordResetOtpAttempts >= 5) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpires = undefined;
    }
    await user.save();
    if (user.passwordResetOtpAttempts >= 5) {
      return res.status(429).json({ error: 'Too many incorrect codes. Request a new OTP.' });
    }
    return res.status(400).json({ error: 'Invalid password reset OTP' });
  }
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and include an uppercase letter, number, and special character',
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetOtpHash = undefined;
  user.passwordResetOtpExpires = undefined;
  user.passwordResetOtpAttempts = 0;
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

  const deliveryError = await deliverOtp(user.phone, otp);
  if (deliveryError) return res.status(503).json({ error: deliveryError });

  return res.json({
    message: 'OTP resent',
    ...(process.env.NODE_ENV === 'development' && { otp }),
  });
}

async function handleRequestLoginOtp(req, res) {
  const { phone: rawPhone, role } = req.body || {};
  const phone = normalizeIdentifier(rawPhone);
  if (!phone || !['customer', 'worker'].includes(role)) {
    return res.status(400).json({ error: 'A valid customer or worker phone and role are required' });
  }

  const user = await User.findOne({ phone, role });
  if (!user) {
    return res.status(404).json({ error: 'This phone number is not registered for the selected role' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account suspended. Contact support.' });
  }
  if (!user.isVerified) {
    return res.status(403).json({ error: 'Account not verified', userId: user._id });
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  const deliveryError = await deliverOtp(phone, otp);
  if (deliveryError) return res.status(503).json({ error: deliveryError });

  return res.json({
    message: 'OTP sent successfully',
    userId: user._id,
    ...(process.env.NODE_ENV === 'development' && { otp }),
  });
}

async function handleVerifyLoginOtp(req, res) {
  const { userId, otp } = req.body || {};

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!user.otpExpiry || new Date() > user.otpExpiry) {
    return res.status(400).json({ error: 'OTP expired' });
  }
  if (user.otp !== normalizeIdentifier(otp)) return res.status(400).json({ error: 'Invalid OTP' });

  user.otp = undefined;
  user.otpExpiry = undefined;
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
  const { phone: rawPhone, email: rawEmail } = req.body || {};
  const phone = normalizeIdentifier(rawPhone);
  const email = normalizeEmail(rawEmail);
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
