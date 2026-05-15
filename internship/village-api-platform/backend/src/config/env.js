require('dotenv').config();

const required = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
};

const optional = (key, fallback) => process.env[key] || fallback;

module.exports = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '4000'), 10),
  API_VERSION: optional('API_VERSION', 'v1'),

  DATABASE_URL: required('DATABASE_URL'),

  REDIS_URL: required('UPSTASH_REDIS_REST_URL'),
  REDIS_TOKEN: required('UPSTASH_REDIS_REST_TOKEN'),

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  BCRYPT_ROUNDS: parseInt(optional('BCRYPT_ROUNDS', '12'), 10),
  CORS_ORIGIN: optional('CORS_ORIGIN', 'http://localhost:5173'),

  DAILY_LIMITS: {
    FREE: parseInt(optional('FREE_DAILY_LIMIT', '1000'), 10),
    PREMIUM: parseInt(optional('PREMIUM_DAILY_LIMIT', '10000'), 10),
    PRO: parseInt(optional('PRO_DAILY_LIMIT', '100000'), 10),
    UNLIMITED: parseInt(optional('UNLIMITED_DAILY_LIMIT', '999999999'), 10),
  },

  CACHE_TTL: {
    STATES: parseInt(optional('CACHE_TTL_STATES', '3600'), 10),
    DISTRICTS: parseInt(optional('CACHE_TTL_DISTRICTS', '3600'), 10),
    SUBDISTRICTS: parseInt(optional('CACHE_TTL_SUBDISTRICTS', '1800'), 10),
    VILLAGES: parseInt(optional('CACHE_TTL_VILLAGES', '900'), 10),
    SEARCH: parseInt(optional('CACHE_TTL_SEARCH', '300'), 10),
    AUTOCOMPLETE: parseInt(optional('CACHE_TTL_AUTOCOMPLETE', '300'), 10),
    APIKEY: parseInt(optional('CACHE_TTL_APIKEY', '86400'), 10),
  },

  IS_PRODUCTION: optional('NODE_ENV', 'development') === 'production',
};
