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

  return { ...apiKey, secret };
};

const listApiKeys = (userId) => apiKeyRepo.findAllByUser(userId);

const revokeApiKey = async (id, userId, userRole) => {
  const keyId = parseInt(id, 10);
  const keys = await apiKeyRepo.findAllByUser(userId);
  const ownedKey = keys.find((k) => k.id === keyId);

  if (!ownedKey && userRole !== 'ADMIN') throw new NotFoundError('API key');

  if (ownedKey) {
    await cache.del(`apikey:${ownedKey.key}`);
    return apiKeyRepo.deactivate(keyId);
  }

  const anyKey = await apiKeyRepo.findById(keyId);
  if (!anyKey) throw new NotFoundError('API key');
  await cache.del(`apikey:${anyKey.key}`);
  return apiKeyRepo.deactivate(keyId);
};

const upgradePlan = async (userId, planType) => {
  const validPlans = ['FREE', 'PREMIUM', 'PRO', 'UNLIMITED'];
  if (!validPlans.includes(planType)) throw new NotFoundError('Plan');

  const user = await userRepo.update(userId, { planType });

  const keys = await apiKeyRepo.findAllByUser(userId);
  const newLimit = PLAN_LIMITS[planType].dailyLimit;
  await Promise.all(
    keys
      .filter((k) => k.isActive)
      .map((k) =>
        Promise.all([
          prisma.apiKey.update({ where: { id: k.id }, data: { dailyLimit: newLimit } }),
          cache.del(`apikey:${k.key}`),
        ])
      )
  );

  return user;
};

module.exports = { createApiKey, listApiKeys, revokeApiKey, upgradePlan, PLAN_LIMITS };
