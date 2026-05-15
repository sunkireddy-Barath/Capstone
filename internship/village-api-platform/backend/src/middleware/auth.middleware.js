const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    throw new AuthenticationError('Bearer token required');

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      throw new AuthenticationError('Access token expired');
    throw new AuthenticationError('Invalid access token');
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN')
    throw new AuthorizationError('Admin access required');
  next();
};

const requireClient = (req, res, next) => {
  if (!['ADMIN', 'CLIENT'].includes(req.user?.role))
    throw new AuthorizationError('Client access required');
  next();
};

module.exports = { authenticate, requireAdmin, requireClient };
