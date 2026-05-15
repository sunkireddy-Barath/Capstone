const geoRepo = require('../repositories/geography.repository');
const cache = require('./cache.service');
const env = require('../config/env');
const { parsePagination } = require('../utils/pagination');
const { ValidationError } = require('../utils/errors');

const formatResult = (village) => {
  const sd = village.subDistrict;
  const d = sd?.district;
  const s = d?.state;
  return {
    id: village.id,
    code: village.code,
    name: village.name,
    fullAddress: `${village.name}, ${sd?.name}, ${d?.name}, ${s?.name}, India`,
    subDistrict: { code: sd?.code, name: sd?.name },
    district: { code: d?.code, name: d?.name },
    state: { code: s?.code, name: s?.name },
  };
};

const searchVillages = async (query) => {
  const q = (query.q || '').trim();
  if (!q || q.length < 2) throw new ValidationError('Search query must be at least 2 characters');

  const { page, limit, skip } = parsePagination(query);
  const stateCode = query.stateCode || null;
  const cacheKey = `search:villages:${q}:${stateCode || 'all'}:${page}:${limit}`;

  const { data: cached, cacheHit } = await cache.wrap(
    cacheKey,
    env.CACHE_TTL.SEARCH,
    async () => {
      if (stateCode) {
        return geoRepo.searchVillagesByStateCode(q, stateCode, { skip, limit });
      }
      return geoRepo.searchVillages(q, {}, { skip, limit });
    }
  );

  const formatted = cached?.data?.map(formatResult) || [];
  return { data: formatted, total: cached?.total || 0, page, limit, cacheHit };
};

const autocomplete = async (query) => {
  const q = (query.q || '').trim();
  if (!q || q.length < 2) throw new ValidationError('Query must be at least 2 characters');

  const limit = Math.min(parseInt(query.limit, 10) || 10, 20);
  const stateCode = query.stateCode || null;
  const cacheKey = `autocomplete:${q}:${stateCode || 'all'}:${limit}`;

  const { data: cached, cacheHit } = await cache.wrap(
    cacheKey,
    env.CACHE_TTL.AUTOCOMPLETE,
    () => geoRepo.autocompleteVillages(q, stateCode, limit)
  );

  const suggestions = (cached || []).map((v) => {
    const sd = v.subDistrict;
    const d = sd?.district;
    const s = d?.state;
    return {
      id: v.id,
      code: v.code,
      label: v.name,
      fullAddress: `${v.name}, ${sd?.name}, ${d?.name}, ${s?.name}, India`,
      state: { code: s?.code, name: s?.name },
    };
  });

  return { suggestions, cacheHit };
};

module.exports = { searchVillages, autocomplete };
