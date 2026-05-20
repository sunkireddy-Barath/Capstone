const analyticsRepo = require('../repositories/analytics.repository');
const userRepo = require('../repositories/user.repository');
const apiKeyRepo = require('../repositories/apiKey.repository');

const getSystemStats = async () => {
  const [
    totalUsers,
    totalApiKeys,
    activeApiKeys,
    totalRequests,
    requestsToday,
    avgResponseTime,
    newUsersToday,
  ] = await Promise.all([
    userRepo.countAll(),
    apiKeyRepo.countAll(),
    apiKeyRepo.countActive(),
    analyticsRepo.getTotalRequests(),
    analyticsRepo.getRequestsToday(),
    analyticsRepo.getAverageResponseTime(),
    userRepo.countNewToday(),
  ]);

  return {
    totalUsers,
    totalApiKeys,
    activeApiKeys,
    totalRequests,
    requestsToday,
    avgResponseTime,
    newUsersToday,
  };
};

const getSystemDailyUsage = (days = 30) => analyticsRepo.getDailyUsageSystem(days);

const getTopEndpoints = (limit = 10) => analyticsRepo.getTopEndpoints(limit);

const getUserDashboard = async (userId) => {
  const apiKeys = await apiKeyRepo.findAllByUser(userId);

  const [
    totalRequests,
    requestsToday,
    dailyUsage,
    recentLogs,
  ] = await Promise.all([
    analyticsRepo.getRequestsByUser(userId, 9999),
    analyticsRepo.getRequestsToday(),
    analyticsRepo.getDailyUsageByUser(userId, 30),
    analyticsRepo.getRecentLogs(20, userId),
  ]);

  return {
    totalRequests,
    requestsToday,
    activeApiKeys: apiKeys.filter((k) => k.isActive).length,
    totalApiKeys: apiKeys.length,
    dailyUsage,
    recentLogs,
    apiKeys,
  };
};

const getAdminLogs = (filters, pagination) =>
  analyticsRepo.getPaginatedLogs({ ...filters, ...pagination });

module.exports = {
  getSystemStats,
  getSystemDailyUsage,
  getTopEndpoints,
  getUserDashboard,
  getAdminLogs,
};
