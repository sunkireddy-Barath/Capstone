const { PrismaClient } = require('@prisma/client');
const env = require('./env');
const logger = require('../utils/logger');

const globalForPrisma = globalThis;

// NeonDB serverless: use connection pool via pgbouncer for production
// For 50K+ daily users: pool_size=10 handles ~10 concurrent DB connections
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.IS_PRODUCTION ? ['error'] : ['warn', 'error'],
    errorFormat: 'minimal',
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

if (!env.IS_PRODUCTION) globalForPrisma.prisma = prisma;

// Graceful shutdown
const shutdown = async () => {
  await prisma.$disconnect();
};

process.on('beforeExit', shutdown);
process.on('SIGINT', async () => { await shutdown(); process.exit(0); });
process.on('SIGTERM', async () => { await shutdown(); process.exit(0); });

prisma.$connect().catch((err) => {
  logger.error('Database connection failed:', err.message);
});

module.exports = prisma;
