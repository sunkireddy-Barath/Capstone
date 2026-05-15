const router = require('express').Router();
const ctrl = require('../controllers/b2b.controller');
const { authenticate, requireClient } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createApiKeyRules, upgradePlanRules, apiKeyIdParam } = require('../validators/b2b.validator');

router.use(authenticate, requireClient);

router.get('/dashboard', ctrl.getDashboard);
router.get('/analytics', ctrl.getAnalytics);

router.post('/api-keys', createApiKeyRules, validate, ctrl.createApiKey);
router.get('/api-keys', ctrl.listApiKeys);
router.delete('/api-keys/:id', apiKeyIdParam, validate, ctrl.revokeApiKey);

router.put('/plan', upgradePlanRules, validate, ctrl.upgradePlan);

module.exports = router;
