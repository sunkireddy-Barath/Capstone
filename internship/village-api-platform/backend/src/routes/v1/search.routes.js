const router = require('express').Router();
const ctrl = require('../../controllers/search.controller');
const { validateApiKey } = require('../../middleware/apiKey.middleware');
const validate = require('../../middleware/validate.middleware');
const { searchRules, autocompleteRules } = require('../../validators/geography.validator');

router.use(validateApiKey);

router.get('/villages', searchRules, validate, ctrl.searchVillages);
router.get('/autocomplete', autocompleteRules, validate, ctrl.autocomplete);

module.exports = router;
