const prisma = require('../config/database');

const getTotalRequests = () => prisma.apiLog.count();

const getRequestsToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.apiLog.count({ where: { createdAt: { gte: start } } });
};

const getRequestsByUser = (userId, days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return prisma.apiLog.count({ where: { userId, createdAt: { gte: since } } });
};

const getRequestsByApiKey = (apiKeyId, days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return prisma.apiLog.count({ where: { apiKeyId, createdAt: { gte: since } } });
};

const getDailyUsageByUser = async (userId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.apiLog.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { createdAt: true, statusCode: true, responseTime: true, cacheHit: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by day
  const grouped = {};
  logs.forEach((log) => {
    const day = log.createdAt.toISOString().slice(0, 10);
    if (!grouped[day]) grouped[day] = { date: day, requests: 0, errors: 0, cacheHits: 0, avgResponseTime: 0, totalTime: 0 };
    grouped[day].requests++;
    if (log.statusCode >= 400) grouped[day].errors++;
    if (log.cacheHit) grouped[day].cacheHits++;
    grouped[day].totalTime += log.responseTime;
  });

  return Object.values(grouped).map((d) => ({
    ...d,
    avgResponseTime: d.requests > 0 ? Math.round(d.totalTime / d.requests) : 0,
    totalTime: undefined,
  }));
};

const getDailyUsageSystem = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.apiLog.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, statusCode: true, responseTime: true, cacheHit: true },
    orderBy: { createdAt: 'asc' },
  });

  const grouped = {};
  logs.forEach((log) => {
    const day = log.createdAt.toISOString().slice(0, 10);
    if (!grouped[day]) grouped[day] = { date: day, requests: 0, errors: 0, cacheHits: 0, totalTime: 0 };
    grouped[day].requests++;
    if (log.statusCode >= 400) grouped[day].errors++;
    if (log.cacheHit) grouped[day].cacheHits++;
    grouped[day].totalTime += log.responseTime;
  });

  return Object.values(grouped).map((d) => ({
    ...d,
    avgResponseTime: d.requests > 0 ? Math.round(d.totalTime / d.requests) : 0,
    totalTime: undefined,
  }));
};

const getTopEndpoints = (limit = 10) =>
  prisma.apiLog.groupBy({
    by: ['endpoint'],
    _count: { endpoint: true },
    orderBy: { _count: { endpoint: 'desc' } },
    take: limit,
  });

const getAverageResponseTime = async () => {
  const result = await prisma.apiLog.aggregate({ _avg: { responseTime: true } });
  return Math.round(result._avg.responseTime || 0);
};

const getRecentLogs = (limit = 50, userId = null) => {
  const where = userId ? { userId } : {};
  return prisma.apiLog.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, endpoint: true, method: true, statusCode: true,
      responseTime: true, cacheHit: true, ipAddress: true, createdAt: true,
      user: { select: { id: true, email: true, name: true } },
      apiKey: { select: { key: true, name: true } },
    },
  });
};

const getPaginatedLogs = async ({ skip, limit, userId, apiKeyId, statusCode, from, to }) => {
  const where = {};
  if (userId) where.userId = Number(userId);
  if (apiKeyId) where.apiKeyId = Number(apiKeyId);
  if (statusCode) where.statusCode = Number(statusCode);
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [data, total] = await prisma.$transaction([
    prisma.apiLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, endpoint: true, method: true, statusCode: true,
        responseTime: true, cacheHit: true, ipAddress: true, createdAt: true,
        user: { select: { id: true, email: true, name: true } },
        apiKey: { select: { key: true, name: true } },
      },
    }),
    prisma.apiLog.count({ where }),
  ]);
  return { data, total };
};

const getTodayUsageByApiKey = async (apiKeyId) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.apiLog.count({ where: { apiKeyId, createdAt: { gte: start } } });
};

const getRequestsTodayByUser = (userId) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.apiLog.count({ where: { userId, createdAt: { gte: start } } });
};

module.exports = {
  getTotalRequests,
  getRequestsToday,
  getRequestsByUser,
  getRequestsByApiKey,
  getRequestsTodayByUser,
  getDailyUsageByUser,
  getDailyUsageSystem,
  getTopEndpoints,
  getAverageResponseTime,
  getRecentLogs,
  getPaginatedLogs,
  getTodayUsageByApiKey,
};
