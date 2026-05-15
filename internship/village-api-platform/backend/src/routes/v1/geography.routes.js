const router = require('express').Router();
const ctrl = require('../../controllers/geography.controller');
const { validateApiKey } = require('../../middleware/apiKey.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  paginationRules, stateCodeParam, districtCodeParam, subDistrictCodeParam,
} = require('../../validators/geography.validator');

// All geography routes require API key + secret authentication
router.use(validateApiKey);

router.get('/states', paginationRules, validate, ctrl.getStates);
router.get('/states/:stateCode/districts', [...stateCodeParam, ...paginationRules], validate, ctrl.getDistricts);
router.get('/states/:stateCode/districts/:districtCode/subdistricts', [...districtCodeParam, ...paginationRules], validate, ctrl.getSubDistricts);
router.get('/states/:stateCode/districts/:districtCode/subdistricts/:subDistrictCode/villages', [...subDistrictCodeParam, ...paginationRules], validate, ctrl.getVillages);

module.exports = router;
