const prisma = require('../config/database');
const apiKeyRepo = require('../repositories/apiKey.repository');
const userRepo = require('../repositories/user.repository');
const cache = require('./cache.service');
const env = require('../config/env');
const { generateApiKey, generateApiSecret, hashSecret } = require('../utils/crypto');
const { NotFoundError, ConflictError } = require('../utils/errors');

const PLAN_LIMITS = {
  FREE: { maxKeys: 2, dailyLimit: env.DAILY_LIMITS.FREE },
  PREMIUM: { maxKeys: 5, dailyLimit: env.DAILY_LIMITS.PREMIUM },
  PRO: { maxKeys: 10, dailyLimit: env.DAILY_LIMITS.PRO },
  UNLIMITED: { maxKeys: 50, dailyLimit: env.DAILY_LIMITS.UNLIMITED },
};

const createApiKey = async (userId, { name }) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError('User');

  const planLimits = PLAN_LIMITS[user.planType] || PLAN_LIMITS.FREE;
  const activeCount = await apiKeyRepo.countActiveByUser(userId);

  if (activeCount >= planLimits.maxKeys) {
    throw new ConflictError(
      `Your ${user.planType} plan allows a maximum of ${planLimits.maxKeys} active API keys.`
    );
  }

  const key = generateApiKey();
  const secret = generateApiSecret();
  const secretHash = await hashSecret(secret);

  const apiKey = await apiKeyRepo.create({
    key,
    secretHash,
    name,
    userId,
    dailyLimit: planLimits.dailyLimit,
  });

  // Return raw secret ONCE — never stored in plain text
  return { ...apiKey, secret };
};

const listApiKeys = (userId) => apiKeyRepo.findAllByUser(userId);

const revokeApiKey = async (id, userId, userRole) => {
  const keys = await apiKeyRepo.findAllByUser(userId);
  const key = keys.find((k) => k.id === parseInt(id, 10));

  if (!key && userRole !== 'ADMIN') throw new NotFoundError('API key');
  if (!key) throw new NotFoundError('API key');

  // Invalidate Redis cache for this key
  await cache.del(`apikey:${key.key}`);

  return apiKeyRepo.deactivate(parseInt(id, 10), userId);
};

const upgradePlan = async (userId, planType) => {
  const validPlans = ['FREE', 'PREMIUM', 'PRO', 'UNLIMITED'];
  if (!validPlans.includes(planType)) throw new NotFoundError('Plan');

  const user = await userRepo.update(userId, { planType });

  // Update all active API keys' daily limits
  const keys = await apiKeyRepo.findAllByUser(userId);
  const newLimit = PLAN_LIMITS[planType].dailyLimit;
  await Promise.all(
    keys
      .filter((k) => k.isActive)
      .map((k) =>
        prisma.apiKey.update({
          where: { id: k.id },
          data: { dailyLimit: newLimit },
        })
      )
  );

  return user;
};

module.exports = { createApiKey, listApiKeys, revokeApiKey, upgradePlan, PLAN_LIMITS };
