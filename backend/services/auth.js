const jwt = require('jsonwebtoken');

function createToken(user) {
  return jwt.sign(
    { _id: user._id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { createToken, verifyToken };
