const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter, loginLimiter } = require('../middleware/rateLimit.middleware');
const validate = require('../middleware/validate.middleware');
const {
  registerRules, loginRules, refreshRules, changePasswordRules,
} = require('../validators/auth.validator');

router.post('/register', authLimiter, registerRules, validate, ctrl.register);
router.post('/login', loginLimiter, loginRules, validate, ctrl.login);
router.post('/refresh', refreshRules, validate, ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);
router.get('/profile', authenticate, ctrl.getProfile);
router.put('/profile', authenticate, ctrl.updateProfile);
router.put('/change-password', authenticate, changePasswordRules, validate, ctrl.changePassword);

module.exports = router;
