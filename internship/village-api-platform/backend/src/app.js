require('dotenv').config();
require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const corsMiddleware = require('./middleware/cors.middleware');
const requestLogger = require('./middleware/requestLogger.middleware');
const { error } = require('./utils/response');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth.routes');
const b2bRoutes = require('./routes/b2b.routes');
const adminRoutes = require('./routes/admin.routes');
const geoRoutes = require('./routes/v1/geography.routes');
const searchRoutes = require('./routes/v1/search.routes');

const app = express();

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);
app.use(corsMiddleware);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

if (!env.IS_PRODUCTION) {
  app.use(morgan('dev'));
}

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Root ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'CapStone',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      ready: '/ready',
      auth: '/api/auth',
      geography: `/api/${env.API_VERSION}`,
      search: `/api/${env.API_VERSION}/search`,
      b2b: '/api/b2b',
      admin: '/api/admin',
    },
  });
});

// ─── Health & Readiness ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

app.get('/ready', async (req, res) => {
  try {
    const prisma = require('./config/database');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected' });
  }
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const API = `/api/${env.API_VERSION}`;

app.use('/api/auth', authRoutes);
app.use('/api/b2b', b2bRoutes);
app.use('/api/admin', adminRoutes);
app.use(`${API}`, geoRoutes);
app.use(`${API}/search`, searchRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  return error(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND');
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.isOperational) {
    return error(res, err.message, err.statusCode, err.code, err.details);
  }
  // Prisma error: unique constraint
  if (err.code === 'P2002') {
    return error(res, 'A record with that value already exists', 409, 'CONFLICT');
  }
  // Prisma error: record not found
  if (err.code === 'P2025') {
    return error(res, 'Record not found', 404, 'NOT_FOUND');
  }

  logger.error('Unhandled error:', { message: err.message, stack: err.stack, code: err.code });
  return error(res, 'An unexpected error occurred', 500, 'INTERNAL_ERROR');
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (require.main === module) {
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 CapStone running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`📡 API base: http://localhost:${env.PORT}${API}`);
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    server.close(() => process.exit(1));
  });
}

module.exports = app;
