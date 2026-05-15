const { Redis } = require('@upstash/redis');
const env = require('./env');

const redis = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_TOKEN,
});

module.exports = redis;
