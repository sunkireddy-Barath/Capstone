const userRepo = require('../repositories/user.repository');
const apiKeyRepo = require('../repositories/apiKey.repository');
const analyticsService = require('../services/analytics.service');
const apiKeyService = require('../services/apiKey.service');
const { parsePagination, parseSorting } = require('../utils/pagination');
const { success, paginated } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

// ─── Users ────────────────────────────────────────────────────────────────────

const getUsers = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const orderBy = parseSorting(req.query, ['name', 'email', 'createdAt', 'planType']);
  const where = {};
  if (req.query.role) where.role = req.query.role;
  if (req.query.planType) where.planType = req.query.planType;
  if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';

  const { data, total } = await userRepo.findAll({ skip, limit, orderBy, where });
  return paginated(res, data, page, limit, total);
};

const getUser = async (req, res) => {
  const user = await userRepo.findById(parseInt(req.params.id, 10));
  if (!user) throw new NotFoundError('User');
  return success(res, user);
};

const updateUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError('User');

  const allowed = ['name', 'company', 'planType', 'role', 'isActive'];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const updated = await userRepo.update(id, data);
  return success(res, updated);
};

// ─── API Keys ─────────────────────────────────────────────────────────────────

const getAllApiKeys = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { data, total } = await apiKeyRepo.findAll({ skip, limit });
  return paginated(res, data, page, limit, total);
};

const createApiKeyForUser = async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const result = await apiKeyService.createApiKey(userId, req.body);
  return success(res, result, null, 201);
};

// ─── Analytics ────────────────────────────────────────────────────────────────

const getSystemStats = async (req, res) => {
  const stats = await analyticsService.getSystemStats();
  return success(res, stats);
};

const getSystemDailyUsage = async (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 30, 90);
  const data = await analyticsService.getSystemDailyUsage(days);
  return success(res, data);
};

const getTopEndpoints = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const data = await analyticsService.getTopEndpoints(limit);
  return success(res, data);
};

// ─── Logs ─────────────────────────────────────────────────────────────────────

const getLogs = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filters = {
    userId: req.query.userId,
    apiKeyId: req.query.apiKeyId,
    statusCode: req.query.statusCode,
    from: req.query.from,
    to: req.query.to,
  };
  const { data, total } = await analyticsService.getAdminLogs(filters, { skip, limit });
  return paginated(res, data, page, limit, total);
};

// ─── Cache Management ─────────────────────────────────────────────────────────

const flushGeographyCache = async (req, res) => {
  const redis = require('../config/redis');
  const prefixes = ['states:', 'districts:', 'subdistricts:', 'villages:', 'search:', 'autocomplete:'];
  let flushed = 0;
  for (const prefix of prefixes) {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) {
      await Promise.all(keys.map((k) => redis.del(k)));
      flushed += keys.length;
    }
  }
  return success(res, { message: `Flushed ${flushed} cache keys`, flushed });
};

module.exports = {
  getUsers, getUser, updateUser,
  getAllApiKeys, createApiKeyForUser,
  getSystemStats, getSystemDailyUsage, getTopEndpoints,
  getLogs, flushGeographyCache,
};
