const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

const generateApiKey = () => {
  const random = crypto.randomBytes(24).toString('hex');
  return `vaip_${random}`;
};

const generateApiSecret = () => crypto.randomBytes(32).toString('hex');

const hashSecret = async (secret) => bcrypt.hash(secret, env.BCRYPT_ROUNDS);

const verifySecret = async (secret, hash) => bcrypt.compare(secret, hash);

const hashPassword = async (password) => bcrypt.hash(password, env.BCRYPT_ROUNDS);

const verifyPassword = async (password, hash) => bcrypt.compare(password, hash);

const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');

module.exports = {
  generateApiKey,
  generateApiSecret,
  hashSecret,
  verifySecret,
  hashPassword,
  verifyPassword,
  generateRefreshToken,
};
