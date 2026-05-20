const prisma = require('../config/database');

const findAllStates = async ({ skip, limit, orderBy }) => {
  const [data, total] = await prisma.$transaction([
    prisma.state.findMany({
      skip,
      take: limit,
      orderBy,
      select: { id: true, code: true, name: true },
    }),
    prisma.state.count(),
  ]);
  return { data, total };
};

const findStateByCode = async (code) =>
  prisma.state.findUnique({ where: { code }, select: { id: true, code: true, name: true } });

const findDistrictsByState = async (stateCode, { skip, limit, orderBy }) => {
  const state = await prisma.state.findUnique({ where: { code: stateCode }, select: { id: true } });
  if (!state) return null;

  const [data, total] = await prisma.$transaction([
    prisma.district.findMany({
      where: { stateId: state.id },
      skip,
      take: limit,
      orderBy,
      select: { id: true, code: true, name: true, stateId: true },
    }),
    prisma.district.count({ where: { stateId: state.id } }),
  ]);
  return { data, total, stateId: state.id };
};

const findDistrictByCode = async (code, stateId) =>
  prisma.district.findFirst({
    where: { code, stateId },
    select: { id: true, code: true, name: true },
  });

const findSubDistrictsByDistrict = async (stateCode, districtCode, { skip, limit, orderBy }) => {
  const state = await prisma.state.findUnique({ where: { code: stateCode }, select: { id: true } });
  if (!state) return null;
  const district = await prisma.district.findFirst({
    where: { code: districtCode, stateId: state.id },
    select: { id: true },
  });
  if (!district) return null;

  const [data, total] = await prisma.$transaction([
    prisma.subDistrict.findMany({
      where: { districtId: district.id },
      skip,
      take: limit,
      orderBy,
      select: { id: true, code: true, name: true, districtId: true },
    }),
    prisma.subDistrict.count({ where: { districtId: district.id } }),
  ]);
  return { data, total, districtId: district.id };
};

const findVillagesBySubDistrict = async (
  stateCode,
  districtCode,
  subDistrictCode,
  { skip, limit, orderBy }
) => {
  const state = await prisma.state.findUnique({ where: { code: stateCode }, select: { id: true } });
  if (!state) return null;
  const district = await prisma.district.findFirst({
    where: { code: districtCode, stateId: state.id },
    select: { id: true },
  });
  if (!district) return null;
  const subDistrict = await prisma.subDistrict.findFirst({
    where: { code: subDistrictCode, districtId: district.id },
    select: { id: true },
  });
  if (!subDistrict) return null;

  const [data, total] = await prisma.$transaction([
    prisma.village.findMany({
      where: { subDistrictId: subDistrict.id },
      skip,
      take: limit,
      orderBy,
      select: { id: true, code: true, name: true },
    }),
    prisma.village.count({ where: { subDistrictId: subDistrict.id } }),
  ]);
  return { data, total, subDistrictId: subDistrict.id };
};

const searchVillages = async (query, filters, { skip, limit }) => {
  const where = {
    name: { contains: query, mode: 'insensitive' },
    ...(filters.subDistrictId && { subDistrictId: filters.subDistrictId }),
  };

  const [data, total] = await prisma.$transaction([
    prisma.village.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        subDistrict: {
          select: {
            id: true,
            code: true,
            name: true,
            district: {
              select: {
                id: true,
                code: true,
                name: true,
                state: { select: { id: true, code: true, name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.village.count({ where }),
  ]);
  return { data, total };
};

const searchVillagesByStateCode = async (query, stateCode, { skip, limit }) => {
  const state = await prisma.state.findUnique({ where: { code: stateCode }, select: { id: true } });
  if (!state) return null;

  const where = {
    name: { contains: query, mode: 'insensitive' },
    subDistrict: { district: { stateId: state.id } },
  };

  const [data, total] = await prisma.$transaction([
    prisma.village.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        subDistrict: {
          select: {
            code: true,
            name: true,
            district: {
              select: {
                code: true,
                name: true,
                state: { select: { code: true, name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.village.count({ where }),
  ]);
  return { data, total };
};

const autocompleteVillages = async (query, stateCode, limit = 10) => {
  const where = stateCode
    ? {
        name: { startsWith: query, mode: 'insensitive' },
        subDistrict: {
          district: { state: { code: stateCode } },
        },
      }
    : { name: { startsWith: query, mode: 'insensitive' } };

  return prisma.village.findMany({
    where,
    take: limit,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      code: true,
      name: true,
      subDistrict: {
        select: {
          name: true,
          district: {
            select: { name: true, state: { select: { name: true, code: true } } },
          },
        },
      },
    },
  });
};

module.exports = {
  findAllStates,
  findStateByCode,
  findDistrictsByState,
  findDistrictByCode,
  findSubDistrictsByDistrict,
  findVillagesBySubDistrict,
  searchVillages,
  searchVillagesByStateCode,
  autocompleteVillages,
};
