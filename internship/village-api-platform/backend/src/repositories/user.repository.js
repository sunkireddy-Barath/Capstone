const prisma = require('../config/database');

const findById = (id) =>
  prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, company: true, role: true, planType: true, isActive: true, createdAt: true },
  });

const findByIdWithPassword = (id) => prisma.user.findUnique({ where: { id } });

const findByEmail = (email) => prisma.user.findUnique({ where: { email } });

const create = (data) =>
  prisma.user.create({
    data,
    select: { id: true, email: true, name: true, company: true, role: true, planType: true, createdAt: true },
  });

const update = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, company: true, role: true, planType: true, isActive: true, updatedAt: true },
  });

const findAll = async ({ skip, limit, orderBy, where = {} }) => {
  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        role: true,
        planType: true,
        isActive: true,
        createdAt: true,
        _count: { select: { apiKeys: true, apiLogs: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { data, total };
};

const countAll = () => prisma.user.count();

const countByPlan = () =>
  prisma.user.groupBy({ by: ['planType'], _count: { planType: true } });

const countNewToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.user.count({ where: { createdAt: { gte: start } } });
};

module.exports = {
  findById,
  findByIdWithPassword,
  findByEmail,
  create,
  update,
  findAll,
  countAll,
  countByPlan,
  countNewToday,
};
