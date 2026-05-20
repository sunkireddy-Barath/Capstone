const geoRepo = require('../repositories/geography.repository');
const cache = require('./cache.service');
const env = require('../config/env');
const { parsePagination, parseSorting } = require('../utils/pagination');
const { NotFoundError } = require('../utils/errors');

const SORT_FIELDS = ['name', 'code', 'createdAt'];

const formatVillageAddress = (village) => {
  const sd = village.subDistrict;
  const d = sd?.district;
  const s = d?.state;
  return {
    id: village.id,
    code: village.code,
    name: village.name,
    fullAddress: `${village.name}, ${sd?.name}, ${d?.name}, ${s?.name}, India`,
    hierarchy: {
      state: { code: s?.code, name: s?.name },
      district: { code: d?.code, name: d?.name },
      subDistrict: { code: sd?.code, name: sd?.name },
      village: { code: village.code, name: village.name },
    },
  };
};

const getStates = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const orderBy = parseSorting(query, SORT_FIELDS);
  const cacheKey = `states:${page}:${limit}:${JSON.stringify(orderBy)}`;

  const { data: cached, cacheHit } = await cache.wrap(
    cacheKey,
    env.CACHE_TTL.STATES,
    () => geoRepo.findAllStates({ skip, limit, orderBy })
  );

  return { result: cached, page, limit, cacheHit };
};

const getDistricts = async (stateCode, query) => {
  const { page, limit, skip } = parsePagination(query);
  const orderBy = parseSorting(query, SORT_FIELDS);
  const cacheKey = `districts:${stateCode}:${page}:${limit}:${JSON.stringify(orderBy)}`;

  const { data: cached, cacheHit } = await cache.wrap(
    cacheKey,
    env.CACHE_TTL.DISTRICTS,
    async () => {
      const result = await geoRepo.findDistrictsByState(stateCode, { skip, limit, orderBy });
      if (!result) throw new NotFoundError('State');
      return result;
    }
  );

  return { result: cached, page, limit, cacheHit };
};

const getSubDistricts = async (stateCode, districtCode, query) => {
  const { page, limit, skip } = parsePagination(query);
  const orderBy = parseSorting(query, SORT_FIELDS);
  const cacheKey = `subdistricts:${stateCode}:${districtCode}:${page}:${limit}:${JSON.stringify(orderBy)}`;

  const { data: cached, cacheHit } = await cache.wrap(
    cacheKey,
    env.CACHE_TTL.SUBDISTRICTS,
    async () => {
      const result = await geoRepo.findSubDistrictsByDistrict(stateCode, districtCode, { skip, limit, orderBy });
      if (!result) throw new NotFoundError('District');
      return result;
    }
  );

  return { result: cached, page, limit, cacheHit };
};

const getVillages = async (stateCode, districtCode, subDistrictCode, query) => {
  const { page, limit, skip } = parsePagination(query);
  const orderBy = parseSorting(query, SORT_FIELDS);
  const cacheKey = `villages:${stateCode}:${districtCode}:${subDistrictCode}:${page}:${limit}:${JSON.stringify(orderBy)}`;

  const { data: cached, cacheHit } = await cache.wrap(
    cacheKey,
    env.CACHE_TTL.VILLAGES,
    async () => {
      const result = await geoRepo.findVillagesBySubDistrict(stateCode, districtCode, subDistrictCode, { skip, limit, orderBy });
      if (!result) throw new NotFoundError('SubDistrict');
      return result;
    }
  );

  return { result: cached, page, limit, cacheHit };
};

module.exports = { getStates, getDistricts, getSubDistricts, getVillages, formatVillageAddress };
