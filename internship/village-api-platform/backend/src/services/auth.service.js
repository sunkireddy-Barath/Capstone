const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const userRepo = require('../repositories/user.repository');
const env = require('../config/env');
const { hashPassword, verifyPassword } = require('../utils/crypto');
const { AuthenticationError, ConflictError, NotFoundError } = require('../utils/errors');

const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });

const signRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

const register = async ({ email, password, name, company }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ConflictError('Email already registered');

  const hashedPassword = await hashPassword(password);
  const user = await userRepo.create({ email, password: hashedPassword, name, company });

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ id: user.id });

  await redis.set(`refresh:${user.id}`, refreshToken, { ex: 7 * 24 * 3600 });

  return { user, accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new AuthenticationError('Invalid email or password');
  if (!user.isActive) throw new AuthenticationError('Account is suspended');

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) throw new AuthenticationError('Invalid email or password');

  const tokenPayload = { id: user.id, email: user.email, role: user.role, planType: user.planType };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ id: user.id });

  await redis.set(`refresh:${user.id}`, refreshToken, { ex: 7 * 24 * 3600 });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

const refresh = async (token) => {
  if (!token) throw new AuthenticationError('Refresh token required');

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  const stored = await redis.get(`refresh:${payload.id}`);
  if (!stored || stored !== token) throw new AuthenticationError('Refresh token revoked');

  const user = await userRepo.findById(payload.id);
  if (!user || !user.isActive) throw new AuthenticationError('Account not found or suspended');

  const newAccessToken = signAccessToken({ id: user.id, email: user.email, role: user.role, planType: user.planType });
  const newRefreshToken = signRefreshToken({ id: user.id });

  await redis.set(`refresh:${user.id}`, newRefreshToken, { ex: 7 * 24 * 3600 });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logout = async (userId) => {
  await redis.del(`refresh:${userId}`);
};

const getProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError('User');
  return user;
};

const updateProfile = async (userId, data) => {
  const allowed = ['name', 'company'];
  const sanitized = Object.fromEntries(
    Object.entries(data).filter(([k]) => allowed.includes(k))
  );
  return userRepo.update(userId, sanitized);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await userRepo.findByIdWithPassword(userId);
  if (!user) throw new NotFoundError('User');

  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) throw new AuthenticationError('Current password is incorrect');

  const hashed = await hashPassword(newPassword);
  await userRepo.update(userId, { password: hashed });
  await redis.del(`refresh:${userId}`);
};

module.exports = { register, login, refresh, logout, getProfile, updateProfile, changePassword };
