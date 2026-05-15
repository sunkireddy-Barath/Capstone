const redis = require('../config/redis');
const prisma = require('../config/database');
const env = require('../config/env');
const { AuthenticationError, RateLimitError } = require('../utils/errors');
const { verifySecret } = require('../utils/crypto');

const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];

  if (!apiKey) throw new AuthenticationError('X-API-Key header required');
  if (!apiSecret) throw new AuthenticationError('X-API-Secret header required');

  // Check key from Redis cache first
  const cacheKey = `apikey:${apiKey}`;
  let keyData = await redis.get(cacheKey);

  if (!keyData) {
    const record = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: { select: { id: true, role: true, planType: true, isActive: true } } },
    });

    if (!record) throw new AuthenticationError('Invalid API key');
    if (!record.isActive) throw new AuthenticationError('API key is revoked');
    if (!record.user.isActive) throw new AuthenticationError('Account is suspended');
    if (record.expiresAt && record.expiresAt < new Date())
      throw new AuthenticationError('API key has expired');

    keyData = {
      id: record.id,
      secretHash: record.secretHash,
      userId: record.userId,
      dailyLimit: record.dailyLimit,
      planType: record.user.planType,
      role: record.user.role,
    };

    await redis.set(cacheKey, JSON.stringify(keyData), { ex: env.CACHE_TTL.APIKEY });
  } else {
    keyData = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;
  }

  const isValidSecret = await verifySecret(apiSecret, keyData.secretHash);
  if (!isValidSecret) throw new AuthenticationError('Invalid API secret');

  // Rate limiting via Redis
  const today = new Date().toISOString().slice(0, 10);
  const rateLimitKey = `ratelimit:${keyData.id}:${today}`;

  const currentCount = (await redis.get(rateLimitKey)) || 0;
  const limit = env.DAILY_LIMITS[keyData.planType] || env.DAILY_LIMITS.FREE;

  if (Number(currentCount) >= limit) {
    throw new RateLimitError(
      `Daily limit of ${limit} requests exceeded. Upgrade your plan for more requests.`
    );
  }

  // Increment usage atomically
  await redis.incr(rateLimitKey);
  // Set expiry only on first request of the day
  if (Number(currentCount) === 0) {
    await redis.expire(rateLimitKey, 86400);
  }

  req.apiKeyData = { ...keyData, usageToday: Number(currentCount) + 1 };

  // Update lastUsedAt asynchronously (fire-and-forget)
  prisma.apiKey
    .update({ where: { id: keyData.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  next();
};

module.exports = { validateApiKey };
