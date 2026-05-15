const geoService = require('../services/geography.service');
const { success, paginated } = require('../utils/response');

const getStates = async (req, res) => {
  const { result, page, limit, cacheHit } = await geoService.getStates(req.query);
  if (cacheHit) res.setHeader('X-Cache', 'HIT');
  return paginated(res, result.data, page, limit, result.total);
};

const getDistricts = async (req, res) => {
  const { stateCode } = req.params;
  const { result, page, limit, cacheHit } = await geoService.getDistricts(stateCode, req.query);
  if (cacheHit) res.setHeader('X-Cache', 'HIT');
  return paginated(res, result.data, page, limit, result.total);
};

const getSubDistricts = async (req, res) => {
  const { stateCode, districtCode } = req.params;
  const { result, page, limit, cacheHit } = await geoService.getSubDistricts(stateCode, districtCode, req.query);
  if (cacheHit) res.setHeader('X-Cache', 'HIT');
  return paginated(res, result.data, page, limit, result.total);
};

const getVillages = async (req, res) => {
  const { stateCode, districtCode, subDistrictCode } = req.params;
  const { result, page, limit, cacheHit } = await geoService.getVillages(
    stateCode, districtCode, subDistrictCode, req.query
  );
  if (cacheHit) res.setHeader('X-Cache', 'HIT');
  return paginated(res, result.data, page, limit, result.total);
};

module.exports = { getStates, getDistricts, getSubDistricts, getVillages };
