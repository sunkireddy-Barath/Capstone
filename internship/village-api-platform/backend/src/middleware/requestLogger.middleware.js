const prisma = require('../config/database');
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const endpoint = req.originalUrl;
    const method = req.method;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const cacheHit = res.getHeader('X-Cache') === 'HIT';

    const logData = {
      method,
      endpoint: endpoint.slice(0, 500),
      statusCode,
      responseTime,
      ipAddress: ipAddress.slice(0, 45),
      userAgent: userAgent.slice(0, 500),
      cacheHit,
    };

    if (req.apiKeyData) {
      logData.apiKeyId = req.apiKeyData.id;
      logData.userId = req.apiKeyData.userId;
    } else if (req.user) {
      logData.userId = req.user.id;
    }

    logger.debug(`${method} ${endpoint} ${statusCode} ${responseTime}ms`);

    prisma.apiLog.create({ data: logData }).catch((err) =>
      logger.warn('Failed to write API log:', err.message)
    );
  });

  next();
};

module.exports = requestLogger;
