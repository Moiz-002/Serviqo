
const { verifyToken } = require('../services/auth');
const User = require('../models/User');

class SessionUserError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'SessionUserError';
    this.status = status;
  }
}

async function resolveSessionUser(tokenUser) {
  if (!tokenUser) throw new SessionUserError(401, 'Unauthorized');
  if (tokenUser.role === 'admin') return tokenUser;

  const user = await User.findById(tokenUser._id).select('_id phone role isActive');
  if (!user) {
    throw new SessionUserError(401, 'Session expired. Please sign in again.');
  }
  if (user.isActive === false) {
    throw new SessionUserError(403, 'Account suspended. Contact support.');
  }
  return user;
}

async function checkAuth(req, res, next) {
  const token = req.cookies?.token || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const tokenUser = verifyToken(token);
  if (!tokenUser) return res.status(401).json({ error: 'Invalid or expired token' });

  try {
    req.user = await resolveSessionUser(tokenUser);
  } catch (error) {
    if (!(error instanceof SessionUserError)) throw error;
    return res.status(error.status).json({ error: error.message });
  }
  return next();
}

function checkRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { checkAuth, checkRole, resolveSessionUser, SessionUserError };
