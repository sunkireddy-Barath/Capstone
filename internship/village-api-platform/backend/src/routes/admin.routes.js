const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');

const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { adminUpdateUserRules, createApiKeyRules } = require('../validators/b2b.validator');

router.use(authenticate, requireAdmin);

// Users
router.get('/users', ctrl.getUsers);
router.get('/users/:id', ctrl.getUser);
router.put('/users/:id', adminUpdateUserRules, validate, ctrl.updateUser);

// API Keys
router.get('/api-keys', ctrl.getAllApiKeys);
router.post('/users/:userId/api-keys', createApiKeyRules, validate, ctrl.createApiKeyForUser);

// Analytics & Stats
router.get('/stats', ctrl.getSystemStats);
router.get('/analytics/daily', ctrl.getSystemDailyUsage);
router.get('/analytics/endpoints', ctrl.getTopEndpoints);

// Logs
router.get('/logs', ctrl.getLogs);

// Cache Management
router.post('/cache/flush', ctrl.flushGeographyCache);

module.exports = router;
