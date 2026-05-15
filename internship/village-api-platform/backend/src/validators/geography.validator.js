const { query, param } = require('express-validator');

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('sortBy').optional().isIn(['name', 'code', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
];

const stateCodeParam = [
  param('stateCode').trim().notEmpty().withMessage('State code required'),
];

const districtCodeParam = [
  param('stateCode').trim().notEmpty().withMessage('State code required'),
  param('districtCode').trim().notEmpty().withMessage('District code required'),
];

const subDistrictCodeParam = [
  param('stateCode').trim().notEmpty().withMessage('State code required'),
  param('districtCode').trim().notEmpty().withMessage('District code required'),
  param('subDistrictCode').trim().notEmpty().withMessage('SubDistrict code required'),
];

const searchRules = [
  query('q').trim().isLength({ min: 2, max: 100 }).withMessage('Search query must be 2-100 chars'),
  query('stateCode').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const autocompleteRules = [
  query('q').trim().isLength({ min: 2, max: 50 }).withMessage('Query must be 2-50 chars'),
  query('stateCode').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 20 }),
];

module.exports = {
  paginationRules,
  stateCodeParam,
  districtCodeParam,
  subDistrictCodeParam,
  searchRules,
  autocompleteRules,
};
