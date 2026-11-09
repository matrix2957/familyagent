const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});
const ok = (req, res) => {
  if (!process.env.FAMILY_CODE || req.headers['x-code'] !== process.env.FAMILY_CODE) {
    res.status(401).json({ error: 'codice' });
    return false;
  }
  return true;
};
module.exports = { redis, ok };
