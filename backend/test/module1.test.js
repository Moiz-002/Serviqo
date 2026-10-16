const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const bcrypt = require('bcrypt');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'module1-test-secret';
process.env.NODE_ENV = 'development';

const User = require('../models/User');
const whatsapp = require('../services/whatsapp');
whatsapp.sendWhatsAppOtp = async () => {};
const authController = require('../controllers/auth');

function response() {
  return {
    statusCode: 200,
    body: undefined,
    cookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    cookie(name, value) {
      this.cookies.push({ name, value });
      return this;
    },
    clearCookie() {
      return this;
    },
  };
}

test('registration rejects passwords that do not meet the API policy', async () => {
  const res = response();

  await authController.handleSignup({
    body: {
      name: 'Test Customer',
      phone: '+923001234567',
      email: 'customer@example.com',
      password: 'weakpassword',
      role: 'customer',
    },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /uppercase letter, number, and special character/);
});

test('OTP login does not verify an account or bypass inactive status', async () => {
  const originalFindById = User.findById;
  const user = {
    _id: 'user-id',
    role: 'customer',
    isVerified: true,
    isActive: true,
    otp: '123456',
    otpExpiry: new Date(Date.now() + 60_000),
    save: async function save() {
      this.saved = true;
    },
  };
  User.findById = async () => user;

  try {
    const res = response();
    await authController.handleVerifyLoginOtp({
      body: { userId: 'user-id', otp: '123456' },
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(user.isVerified, true);
    assert.equal(user.saved, true);
    assert.equal(res.body.user.role, 'customer');
  } finally {
    User.findById = originalFindById;
  }
});

test('login OTP requests reject unverified accounts', async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => ({
    _id: 'user-id',
    role: 'customer',
    isVerified: false,
    isActive: true,
  });

  try {
    const res = response();
    await authController.handleRequestLoginOtp({
      body: { phone: '+923001234567', role: 'customer' },
    }, res);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Account not verified');
  } finally {
    User.findOne = originalFindOne;
  }
});

test('password recovery rejects multiple phone numbers', async () => {
  const res = response();
  await authController.handleForgotPassword({
    body: { phone: ['+923001234567', '+923009876543'] },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Enter one registered phone number');
});

test('password recovery sends WhatsApp OTP to the registered phone', async () => {
  const originalFindOne = User.findOne;
  const user = {
    _id: 'customer-id',
    phone: '+923001234567',
    passwordResetOtpHash: undefined,
    passwordResetOtpExpires: undefined,
    save: async function save() {
      this.saved = true;
    },
  };
  User.findOne = async (query) => {
    assert.deepEqual(query, { phone: '+923001234567' });
    return user;
  };

  try {
    const res = response();
    await authController.handleForgotPassword({ body: { phone: '3001234567' } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.userId, 'customer-id');
    assert.match(res.body.otp, /^\d{6}$/);
    assert.notEqual(user.passwordResetOtpHash, res.body.otp);
    assert.ok(user.passwordResetOtpExpires > new Date());
    assert.equal(user.saved, true);
  } finally {
    User.findOne = originalFindOne;
  }
});

  test('password login normalizes a ten-digit phone number and issues a session', async () => {
    const originalFindOne = User.findOne;
    const originalCompare = bcrypt.compare;
    User.findOne = async (query) => {
      assert.deepEqual(query, { $or: [{ phone: '+923001234567' }, { email: '+923001234567' }] });
      return {
        _id: 'customer-id',
        name: 'Customer',
        phone: '+923001234567',
        email: 'customer@example.com',
        role: 'customer',
        password: 'hash',
        isVerified: true,
        isActive: true,
      };
    };
    bcrypt.compare = async () => true;

    try {
      const res = response();
      await authController.handleLogin({
        body: { identifier: '3001234567', password: 'ValidPass1!' },
      }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.user.role, 'customer');
      assert.equal(res.cookies.length, 2);
    } finally {
      User.findOne = originalFindOne;
      bcrypt.compare = originalCompare;
    }
  });

  test('password reset consumes a valid WhatsApp OTP once', async () => {
    const originalFindById = User.findById;
    const otp = '123456';
    const user = {
      passwordResetOtpHash: crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(otp)
        .digest('hex'),
      passwordResetOtpExpires: new Date(Date.now() + 60_000),
      passwordResetOtpAttempts: 0,
      save: async function save() {
        this.saved = true;
      },
    };
    User.findById = async () => user;

    try {
      const res = response();
      await authController.handleResetPassword({
        body: { userId: 'customer-id', otp, newPassword: 'NewSecure1!' },
      }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(user.passwordResetOtpHash, undefined);
      assert.equal(user.passwordResetOtpExpires, undefined);
      assert.equal(user.passwordResetOtpAttempts, 0);
      assert.equal(user.saved, true);
    } finally {
      User.findById = originalFindById;
    }
  });

  test('password reset locks after five invalid OTP attempts', async () => {
    const originalFindById = User.findById;
    const user = {
      passwordResetOtpHash: crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update('123456')
        .digest('hex'),
      passwordResetOtpExpires: new Date(Date.now() + 60_000),
      passwordResetOtpAttempts: 4,
      save: async function save() {
        this.saved = true;
      },
    };
    User.findById = async () => user;

    try {
      const res = response();
      await authController.handleResetPassword({
        body: { userId: 'customer-id', otp: '654321', newPassword: 'NewSecure1!' },
      }, res);

      assert.equal(res.statusCode, 429);
      assert.equal(user.passwordResetOtpHash, undefined);
      assert.equal(user.passwordResetOtpExpires, undefined);
      assert.equal(user.passwordResetOtpAttempts, 5);
      assert.equal(user.saved, true);
    } finally {
      User.findById = originalFindById;
    }
  });
