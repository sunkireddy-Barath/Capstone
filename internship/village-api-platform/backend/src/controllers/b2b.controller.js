const apiKeyService = require('../services/apiKey.service');
const analyticsService = require('../services/analytics.service');
const { success, created } = require('../utils/response');

const createApiKey = async (req, res) => {
  const result = await apiKeyService.createApiKey(req.user.id, req.body);
  return created(res, result);
};

const listApiKeys = async (req, res) => {
  const keys = await apiKeyService.listApiKeys(req.user.id);
  return success(res, keys);
};

const revokeApiKey = async (req, res) => {
  const result = await apiKeyService.revokeApiKey(req.params.id, req.user.id, req.user.role);
  return success(res, result);
};

const getDashboard = async (req, res) => {
  const data = await analyticsService.getUserDashboard(req.user.id);
  return success(res, data);
};

const getAnalytics = async (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 30, 90);
  const data = await analyticsService.getUserDashboard(req.user.id);
  return success(res, { dailyUsage: data.dailyUsage, recentLogs: data.recentLogs });
};

const upgradePlan = async (req, res) => {
  const user = await apiKeyService.upgradePlan(req.user.id, req.body.planType);
  return success(res, user);
};

module.exports = { createApiKey, listApiKeys, revokeApiKey, getDashboard, getAnalytics, upgradePlan };
