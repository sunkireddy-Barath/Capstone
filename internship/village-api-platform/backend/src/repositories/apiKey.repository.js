const prisma = require('../config/database');

const create = (data) =>
  prisma.apiKey.create({
    data,
    select: { id: true, key: true, name: true, isActive: true, dailyLimit: true, expiresAt: true, createdAt: true },
  });

const findByKey = (key) =>
  prisma.apiKey.findUnique({
    where: { key },
    include: { user: { select: { id: true, role: true, planType: true, isActive: true } } },
  });

const findAllByUser = (userId) =>
  prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, key: true, name: true, isActive: true,
      dailyLimit: true, lastUsedAt: true, expiresAt: true, createdAt: true,
    },
  });

const countActiveByUser = (userId) =>
  prisma.apiKey.count({ where: { userId, isActive: true } });

const findById = (id) =>
  prisma.apiKey.findUnique({
    where: { id },
    select: { id: true, key: true, name: true, isActive: true, userId: true },
  });

const deactivate = (id) =>
  prisma.apiKey.update({
    where: { id },
    data: { isActive: false },
    select: { id: true, key: true, isActive: true },
  });

const findAll = async ({ skip, limit, search }) => {
  const where = search
    ? {
        OR: [
          { key: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.apiKey.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, key: true, name: true, isActive: true, dailyLimit: true,
        lastUsedAt: true, createdAt: true,
        user: { select: { id: true, email: true, name: true, planType: true } },
      },
    }),
    prisma.apiKey.count({ where }),
  ]);
  return { data, total };
};

const countAll = () => prisma.apiKey.count();
const countActive = () => prisma.apiKey.count({ where: { isActive: true } });

module.exports = {
  create, findByKey, findById, findAllByUser, countActiveByUser,
  deactivate, findAll, countAll, countActive,
};
