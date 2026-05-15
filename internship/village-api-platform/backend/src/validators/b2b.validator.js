const { body, param } = require('express-validator');

const createApiKeyRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Key name must be 2-100 characters'),
];

const upgradePlanRules = [
  body('planType')
    .isIn(['FREE', 'PREMIUM', 'PRO', 'UNLIMITED'])
    .withMessage('Invalid plan type'),
];

const apiKeyIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Valid API key ID required'),
];

const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2-150 chars'),
  body('company').optional().trim().isLength({ max: 200 }).withMessage('Company max 200 chars'),
];

const adminUpdateUserRules = [
  param('id').isInt({ min: 1 }).withMessage('Valid user ID required'),
  body('planType').optional().isIn(['FREE', 'PREMIUM', 'PRO', 'UNLIMITED']),
  body('role').optional().isIn(['ADMIN', 'CLIENT']),
  body('isActive').optional().isBoolean(),
];

module.exports = {
  createApiKeyRules,
  upgradePlanRules,
  apiKeyIdParam,
  updateProfileRules,
  adminUpdateUserRules,
};
