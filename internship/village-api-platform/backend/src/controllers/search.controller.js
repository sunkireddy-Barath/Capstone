const searchService = require('../services/search.service');
const { success, paginated } = require('../utils/response');

const searchVillages = async (req, res) => {
  const { data, total, page, limit, cacheHit } = await searchService.searchVillages(req.query);
  if (cacheHit) res.setHeader('X-Cache', 'HIT');
  return paginated(res, data, page, limit, total);
};

const autocomplete = async (req, res) => {
  const { suggestions, cacheHit } = await searchService.autocomplete(req.query);
  if (cacheHit) res.setHeader('X-Cache', 'HIT');
  return success(res, { suggestions, count: suggestions.length });
};

module.exports = { searchVillages, autocomplete };
