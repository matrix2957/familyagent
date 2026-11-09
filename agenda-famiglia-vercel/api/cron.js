const webpush = require('web-push');
const { redis } = require('./_lib');
module.exports = async (req, res) => {
  if (!process.env.CRON_SECRET || req.query.key !== process.env.CRON_SECRET) return res.status(401).end();
  webpush.setVapidDetails(process.env.VAPID_EMAIL, process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);
  const now = Date.now();
  const tasks = Object.values((await redis.hgetall('tasks')) || {});
  const subs = Object.values((await redis.hgetall('subs')) || {});
  const due = tasks.filter(t => !t.done && !t.sent && t.at && t.at <= now && now - t.at < 15 * 60000);
  let sent = 0;
  for (const t of due) {
    const body = JSON.stringify({ title: t.title, body: (t.time || '') + (t.who ? ' · ' + t.who : '') });
    const targets = subs.filter(s => !t.who || s.name.toLowerCase() === String(t.who).toLowerCase());
    for (const s of targets) {
      try { await webpush.sendNotification(s.sub, body); sent++; }
      catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await redis.hdel('subs', s.sub.endpoint); }
    }
    await redis.hset('tasks', { [t.id]: { ...t, sent: true } });
  }
  res.json({ due: due.length, sent });
};
