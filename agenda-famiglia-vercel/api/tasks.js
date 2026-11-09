const { redis, ok } = require('./_lib');
module.exports = async (req, res) => {
  if (!ok(req, res)) return;
  if (req.method === 'POST') {
    const t = req.body;
    if (!t || !t.id) return res.status(400).json({ error: 'dati' });
    await redis.hset('tasks', { [t.id]: t });
    return res.json({ ok: 1 });
  }
  if (req.method === 'DELETE') {
    await redis.hdel('tasks', String(req.query.id));
    return res.json({ ok: 1 });
  }
  res.json(Object.values((await redis.hgetall('tasks')) || {}));
};
