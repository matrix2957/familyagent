const { redis, ok } = require('./_lib');
module.exports = async (req, res) => {
  if (!ok(req, res)) return;
  if (req.method === 'POST') {
    const { sub, name } = req.body || {};
    if (!sub || !sub.endpoint) return res.status(400).json({ error: 'dati' });
    await redis.hset('subs', { [sub.endpoint]: { sub, name: String(name || '').trim() } });
    return res.json({ ok: 1 });
  }
  res.json({ key: process.env.VAPID_PUBLIC });
};
