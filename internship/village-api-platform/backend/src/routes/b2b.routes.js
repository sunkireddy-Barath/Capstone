const router = require('express').Router();
const ctrl = require('../controllers/b2b.controller');
const paymentCtrl = require('../controllers/payment.controller');
const { authenticate, requireClient } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createApiKeyRules, upgradePlanRules, apiKeyIdParam } = require('../validators/b2b.validator');

router.use(authenticate, requireClient);

router.get('/dashboard', ctrl.getDashboard);
router.get('/analytics', ctrl.getAnalytics);

router.post('/api-keys', createApiKeyRules, validate, ctrl.createApiKey);
router.get('/api-keys', ctrl.listApiKeys);
router.delete('/api-keys/:id', apiKeyIdParam, validate, ctrl.revokeApiKey);

// Direct plan change (FREE downgrade only)
router.put('/plan', upgradePlanRules, validate, ctrl.upgradePlan);

// Razorpay payment flow for paid plans
router.post('/payment/create-order', paymentCtrl.createOrder);
router.post('/payment/verify', paymentCtrl.verifyAndUpgrade);

module.exports = router;
