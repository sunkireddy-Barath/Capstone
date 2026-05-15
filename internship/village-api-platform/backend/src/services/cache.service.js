const redis = require('../config/redis');
const logger = require('../utils/logger');

const get = async (key) => {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (err) {
    logger.warn(`Cache GET failed for key "${key}":`, err.message);
    return null;
  }
};

const set = async (key, value, ttl) => {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  } catch (err) {
    logger.warn(`Cache SET failed for key "${key}":`, err.message);
  }
};

const del = async (...keys) => {
  try {
    await Promise.all(keys.map((k) => redis.del(k)));
  } catch (err) {
    logger.warn('Cache DEL failed:', err.message);
  }
};

const wrap = async (key, ttl, fetchFn) => {
  const cached = await get(key);
  if (cached !== null) return { data: cached, cacheHit: true };
  const fresh = await fetchFn();
  if (fresh !== null && fresh !== undefined) {
    await set(key, fresh, ttl);
  }
  return { data: fresh, cacheHit: false };
};

const invalidatePattern = async (pattern) => {
  // Upstash does not support SCAN — track keys explicitly or use prefix-based sets
  // For now we skip pattern invalidation and let TTL handle expiry
  logger.debug(`Cache invalidate pattern: ${pattern} (TTL-based)`);
};

module.exports = { get, set, del, wrap, invalidatePattern };
