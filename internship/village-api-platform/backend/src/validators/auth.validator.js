const { body } = require('express-validator');

const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2-150 characters'),
  body('company').optional().trim().isLength({ max: 200 }).withMessage('Company max 200 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const refreshRules = [
  body('refreshToken').notEmpty().withMessage('Refresh token required'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
];

module.exports = { registerRules, loginRules, refreshRules, changePasswordRules };
