require('dotenv').config();
const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const chalk     = require('chalk');

const db = require('./database');
const { autoLoadPairs, getActiveConnections } = require('./autoload-pg');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/', rateLimit({ windowMs: 60000, max: 60 }));

const pairLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, max: 10,
  message: { success: false, error: 'Too many requests. Wait 5 minutes.' },
});

const isAdmin = req => {
  const t = req.headers['x-admin-token'] || req.body?.adminToken || req.query?.token;
  return t === (process.env.ADMIN_TOKEN || 'adevos2025');
};

const BLOCKED = ['252'];

// ── GET /api/status ──────────────────────────────────────────────────────────
app.get('/api/status', async (req, res) => {
  const up = process.uptime();
  const h = Math.floor(up / 3600), m = Math.floor((up % 3600) / 60), s = Math.floor(up % 60);
  const allSessions  = await db.getAllSessions().catch(() => []);
  const connected    = allSessions.filter(x => x.status === 'connected').length;
  const userCount    = await db.getUserCount().catch(() => 0);
  res.json({
    success: true, online: true, version: 'V2.0',
    uptime: `${h}h ${m}m ${s}s`, uptimeSeconds: Math.floor(up),
    sessions: {
      total: allSessions.length, connected,
      active: getActiveConnections().size,
      limit: parseInt(process.env.SESSION_LIMIT || '15'),
    },
    users: userCount, storage: 'postgresql',
  });
});

// ── POST /api/pair ────────────────────────────────────────────────────────────
app.post('/api/pair', pairLimiter, async (req, res) => {
  const { number, server = 1 } = req.body;
  if (!number) return res.status(400).json({ success: false, error: 'Phone number required.' });

  const clean = number.replace(/[^0-9]/g, '');
  if (clean.length < 7 || clean.length > 15)
    return res.status(400).json({ success: false, error: 'Invalid phone number.' });
  if (clean.startsWith('0'))
    return res.status(400).json({ success: false, error: 'Include country code (no leading 0).' });
  if (BLOCKED.includes(clean.slice(0, 3)))
    return res.status(400).json({ success: false, error: 'Country not supported.' });

  const jid = `${clean}@s.whatsapp.net`;

  const count = await db.getSessionCount();
  const limit = parseInt(process.env.SESSION_LIMIT || '15');
  if (count >= limit)
    return res.status(429).json({ success: false, error: `Server ${server} is full. Try another.` });

  if (await db.isAlreadyPaired(jid))
    return res.status(409).json({ success: false, error: `+${clean} already paired. Delete first.` });

  try {
    console.log(chalk.blue(`⚡ Pair: +${clean} | Server ${server}`));
    const startpairing = require('./pair.js');
    await startpairing(jid);
    await new Promise(r => setTimeout(r, 4000));

    const pairingFile = path.join(__dirname, 'nexstore', 'pairing', 'pairing.json');
    if (!fs.existsSync(pairingFile))
      return res.status(500).json({ success: false, error: 'Code not generated. Try again.' });

    const { code } = JSON.parse(fs.readFileSync(pairingFile, 'utf8'));
    if (!code) return res.status(500).json({ success: false, error: 'Failed to read code.' });

    delete require.cache[require.resolve('./pair.js')];

    await db.saveSession(jid, {}, {}, 'pending', server);
    await db.addOwner(jid);
    await db.addOwner(`${clean}@lid`);

    console.log(chalk.green(`✅ Paired: +${clean} | Code: ${code}`));
    res.json({
      success: true, code, phone: clean, server,
      message: 'Open WhatsApp → Linked Devices → Link Device → Enter code',
    });
  } catch (err) {
    delete require.cache[require.resolve('./pair.js')];
    console.error(chalk.red('❌ Pair error:'), err.message);
    res.status(500).json({ success: false, error: err.message || 'Connection failed.' });
  }
});

// ── DELETE /api/delpair ───────────────────────────────────────────────────────
app.delete('/api/delpair', async (req, res) => {
  const { number } = req.body;
  if (!number) return res.status(400).json({ success: false, error: 'Number required.' });
  const clean = number.replace(/[^0-9]/g, '');
  const jid   = `${clean}@s.whatsapp.net`;
  if (!(await db.loadSession(jid)))
    return res.status(404).json({ success: false, error: `+${clean} not found.` });
  await db.deleteSession(jid);
  await db.removeOwner(jid);
  await db.removeOwner(`${clean}@lid`);
  console.log(chalk.yellow(`🗑️ Deleted: +${clean}`));
  res.json({ success: true, message: `Session for +${clean} deleted.` });
});

// ── GET /api/sessions ─────────────────────────────────────────────────────────
app.get('/api/sessions', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized.' });
  const sessions = await db.getAllSessions();
  res.json({ success: true, sessions, total: sessions.length });
});

// ── POST /api/clean ───────────────────────────────────────────────────────────
app.post('/api/clean', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized.' });
  const cleaned = await db.cleanInvalidSessions();
  res.json({ success: true, cleaned: cleaned.length, jids: cleaned });
});

// ── GET /api/users ────────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized.' });
  const users = await db.getAllUsers();
  res.json({ success: true, total: users.length, users });
});

// ── POST /api/autoload ────────────────────────────────────────────────────────
app.post('/api/autoload', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized.' });
  autoLoadPairs().catch(console.error);
  res.json({ success: true, message: 'Autoload started.' });
});

// ── POST /api/ban ─────────────────────────────────────────────────────────────
app.post('/api/ban', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized.' });
  const { userId, reason } = req.body;
  if (!userId) return res.status(400).json({ success: false, error: 'userId required.' });
  await db.banUser(userId, reason || '');
  res.json({ success: true, message: `${userId} banned.` });
});

// ── POST /api/unban ───────────────────────────────────────────────────────────
app.post('/api/unban', async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized.' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, error: 'userId required.' });
  await db.unbanUser(userId);
  res.json({ success: true, message: `${userId} unbanned.` });
});

// ── GET /health ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  const idx = path.join(__dirname, 'public', 'index.html');
  fs.existsSync(idx) ? res.sendFile(idx) : res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(chalk.red('🔥 Error:'), err.message);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await db.initDB();
    app.listen(PORT, () => {
      console.log(chalk.green(`\n🌐 Adevos Min-Bot (PostgreSQL) on port ${PORT}`));
      console.log(chalk.blue(`   Website: http://localhost:${PORT}`));
      console.log(chalk.cyan(`   API:     http://localhost:${PORT}/api/status\n`));
    });
    setTimeout(() => autoLoadPairs().catch(console.error), 3000);
  } catch (err) {
    console.error(chalk.red('❌ Startup:'), err.message);
    process.exit(1);
  }
}

start();
module.exports = app;

