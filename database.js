// ─────────────────────────────────────────────────────────────────────────────
// database.js — PostgreSQL session storage for Adevos Min-Bot
// Replaces file-based nexstore/pairing/ with PostgreSQL
// Works with Heroku PostgreSQL or any PostgreSQL instance
// ─────────────────────────────────────────────────────────────────────────────

const { Pool } = require('pg');
const chalk    = require('chalk');

// ── Connection pool ───────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },  // required for Heroku PostgreSQL
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error(chalk.red('❌ PostgreSQL pool error:'), err.message);
});

// ── Initialise tables ────────────────────────────────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id           SERIAL PRIMARY KEY,
        jid          TEXT UNIQUE NOT NULL,       -- e.g. 255712345678@s.whatsapp.net
        phone        TEXT NOT NULL,              -- e.g. 255712345678
        creds        JSONB,                      -- baileys creds.json content
        keys         JSONB DEFAULT '{}',         -- baileys keys store
        status       TEXT DEFAULT 'pending',     -- pending | connected | disconnected
        registered   BOOLEAN DEFAULT FALSE,
        server_num   INTEGER DEFAULT 1,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        user_id    TEXT UNIQUE NOT NULL,
        platform   TEXT DEFAULT 'telegram',     -- telegram | whatsapp
        joined_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS owners (
        id     SERIAL PRIMARY KEY,
        jid    TEXT UNIQUE NOT NULL,
        type   TEXT DEFAULT 'owner'             -- owner | premium | admin
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS banned_users (
        id        SERIAL PRIMARY KEY,
        user_id   TEXT UNIQUE NOT NULL,
        reason    TEXT,
        banned_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Index for faster jid lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_jid
      ON sessions(jid);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_status
      ON sessions(status);
    `);

    console.log(chalk.green('✅ Database tables ready'));
  } catch (err) {
    console.error(chalk.red('❌ DB init error:'), err.message);
    throw err;
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save or update a session
 */
async function saveSession(jid, creds, keys = {}, status = 'pending', serverNum = 1) {
  const phone = jid.split('@')[0];
  const registered = !!(creds?.me?.id && creds?.registered);

  await pool.query(`
    INSERT INTO sessions (jid, phone, creds, keys, status, registered, server_num, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    ON CONFLICT (jid) DO UPDATE SET
      creds      = EXCLUDED.creds,
      keys       = EXCLUDED.keys,
      status     = EXCLUDED.status,
      registered = EXCLUDED.registered,
      updated_at = NOW()
  `, [jid, phone, JSON.stringify(creds), JSON.stringify(keys), status, registered, serverNum]);
}

/**
 * Load a session by JID
 */
async function loadSession(jid) {
  const result = await pool.query(
    'SELECT * FROM sessions WHERE jid = $1',
    [jid]
  );
  return result.rows[0] || null;
}

/**
 * Load ALL connected sessions (for autoload)
 */
async function loadAllSessions() {
  const result = await pool.query(
    "SELECT * FROM sessions WHERE status != 'deleted' ORDER BY created_at ASC"
  );
  return result.rows;
}

/**
 * Update session status
 */
async function updateSessionStatus(jid, status) {
  await pool.query(
    'UPDATE sessions SET status = $1, updated_at = NOW() WHERE jid = $2',
    [status, jid]
  );
}

/**
 * Delete a session
 */
async function deleteSession(jid) {
  await pool.query('DELETE FROM sessions WHERE jid = $1', [jid]);
}

/**
 * Get active session count
 */
async function getSessionCount() {
  const result = await pool.query(
    "SELECT COUNT(*) FROM sessions WHERE status NOT IN ('deleted', 'disconnected')"
  );
  return parseInt(result.rows[0].count);
}

/**
 * Get all sessions (for admin panel)
 */
async function getAllSessions() {
  const result = await pool.query(
    'SELECT jid, phone, status, registered, server_num, created_at, updated_at FROM sessions ORDER BY created_at DESC'
  );
  return result.rows;
}

/**
 * Clean invalid/unregistered sessions
 */
async function cleanInvalidSessions() {
  const result = await pool.query(
    "DELETE FROM sessions WHERE registered = FALSE AND created_at < NOW() - INTERVAL '1 hour' RETURNING jid"
  );
  return result.rows.map(r => r.jid);
}

/**
 * Check if JID already paired
 */
async function isAlreadyPaired(jid) {
  const result = await pool.query(
    "SELECT jid FROM sessions WHERE jid = $1 AND status != 'deleted'",
    [jid]
  );
  return result.rows.length > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function trackUser(userId, platform = 'telegram') {
  await pool.query(`
    INSERT INTO users (user_id, platform)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO NOTHING
  `, [String(userId), platform]);
}

async function getUserCount() {
  const result = await pool.query('SELECT COUNT(*) FROM users');
  return parseInt(result.rows[0].count);
}

async function getAllUsers() {
  const result = await pool.query('SELECT user_id FROM users');
  return result.rows.map(r => r.user_id);
}

// ─────────────────────────────────────────────────────────────────────────────
// OWNER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function addOwner(jid, type = 'owner') {
  await pool.query(`
    INSERT INTO owners (jid, type)
    VALUES ($1, $2)
    ON CONFLICT (jid) DO NOTHING
  `, [jid, type]);
}

async function removeOwner(jid) {
  await pool.query('DELETE FROM owners WHERE jid = $1', [jid]);
}

async function getOwners(type = 'owner') {
  const result = await pool.query(
    'SELECT jid FROM owners WHERE type = $1',
    [type]
  );
  return result.rows.map(r => r.jid);
}

async function isOwner(jid) {
  const result = await pool.query(
    "SELECT jid FROM owners WHERE jid = $1 AND type = 'owner'",
    [jid]
  );
  return result.rows.length > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// BAN FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function banUser(userId, reason = '') {
  await pool.query(`
    INSERT INTO banned_users (user_id, reason)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO NOTHING
  `, [String(userId), reason]);
}

async function unbanUser(userId) {
  await pool.query('DELETE FROM banned_users WHERE user_id = $1', [String(userId)]);
}

async function isBanned(userId) {
  const result = await pool.query(
    'SELECT user_id FROM banned_users WHERE user_id = $1',
    [String(userId)]
  );
  return result.rows.length > 0;
}

async function getBannedUsers() {
  const result = await pool.query('SELECT user_id, reason FROM banned_users');
  return result.rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// BAILEYS AUTH STATE — PostgreSQL version
// Replaces useMultiFileAuthState(folder)
// ─────────────────────────────────────────────────────────────────────────────

async function usePostgresAuthState(jid) {
  // Load existing session
  const existing = await loadSession(jid);

  let creds = existing?.creds || null;
  let keys  = existing?.keys  || {};

  // Parse if stored as string
  if (typeof creds === 'string') creds = JSON.parse(creds);
  if (typeof keys  === 'string') keys  = JSON.parse(keys);

  const state = {
    creds: creds || {},
    keys: {
      get: (type, ids) => {
        const data = {};
        for (const id of ids) {
          const val = keys[`${type}-${id}`];
          if (val !== undefined) data[id] = val;
        }
        return data;
      },
      set: async (data) => {
        for (const [category, categoryData] of Object.entries(data)) {
          if (!categoryData) continue;
          for (const [id, value] of Object.entries(categoryData)) {
            if (value) {
              keys[`${category}-${id}`] = value;
            } else {
              delete keys[`${category}-${id}`];
            }
          }
        }
        // Save updated keys to DB
        await pool.query(
          'UPDATE sessions SET keys = $1, updated_at = NOW() WHERE jid = $2',
          [JSON.stringify(keys), jid]
        );
      }
    }
  };

  const saveCreds = async () => {
    await saveSession(jid, state.creds, keys, 'pending');
  };

  return { state, saveCreds };
}

// ─────────────────────────────────────────────────────────────────────────────
// MIGRATION — Copy existing file sessions to PostgreSQL
// Run once: node database.js --migrate
// ─────────────────────────────────────────────────────────────────────────────

async function migrateFileSessions() {
  const fs   = require('fs');
  const path = require('path');
  const PAIRING_DIR = path.join(__dirname, 'nexstore', 'pairing');

  if (!fs.existsSync(PAIRING_DIR)) {
    console.log('No pairing directory found — nothing to migrate.');
    return;
  }

  const entries = fs.readdirSync(PAIRING_DIR, { withFileTypes: true });
  const folders = entries.filter(e => e.isDirectory() && e.name.endsWith('@s.whatsapp.net'));

  console.log(chalk.blue(`Found ${folders.length} session(s) to migrate...`));

  let migrated = 0, failed = 0;

  for (const folder of folders) {
    const jid       = folder.name;
    const sessPath  = path.join(PAIRING_DIR, jid);
    const credsPath = path.join(sessPath, 'creds.json');

    try {
      if (!fs.existsSync(credsPath)) {
        console.log(chalk.yellow(`⚠ No creds.json for ${jid}, skipping`));
        failed++;
        continue;
      }

      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

      // Read keys files
      const keys = {};
      const files = fs.readdirSync(sessPath).filter(f => f !== 'creds.json');
      for (const file of files) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(sessPath, file), 'utf8'));
          const key = file.replace('.json', '');
          // Flatten all key entries
          if (typeof content === 'object') {
            for (const [k, v] of Object.entries(content)) {
              keys[`${key}-${k}`] = v;
            }
          }
        } catch { /* ignore */ }
      }

      await saveSession(jid, creds, keys, 'connected');
      migrated++;
      console.log(chalk.green(`✅ Migrated: ${jid.split('@')[0]}`));

    } catch (err) {
      console.error(chalk.red(`❌ Failed ${jid}:`), err.message);
      failed++;
    }
  }

  console.log(chalk.green(`\nMigration complete: ${migrated} migrated, ${failed} failed`));
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  pool,
  initDB,
  // Sessions
  saveSession,
  loadSession,
  loadAllSessions,
  updateSessionStatus,
  deleteSession,
  getSessionCount,
  getAllSessions,
  cleanInvalidSessions,
  isAlreadyPaired,
  usePostgresAuthState,
  // Users
  trackUser,
  getUserCount,
  getAllUsers,
  // Owners
  addOwner,
  removeOwner,
  getOwners,
  isOwner,
  // Bans
  banUser,
  unbanUser,
  isBanned,
  getBannedUsers,
  // Migration
  migrateFileSessions,
};

// ── CLI migration ──────────────────────────────────────────────────────────
if (require.main === module) {
  const arg = process.argv[2];
  if (arg === '--migrate') {
    initDB()
      .then(() => migrateFileSessions())
      .then(() => process.exit(0))
      .catch(err => { console.error(err); process.exit(1); });
  } else if (arg === '--init') {
    initDB()
      .then(() => { console.log('DB initialized'); process.exit(0); })
      .catch(err => { console.error(err); process.exit(1); });
  } else {
    console.log('Usage: node database.js --init | --migrate');
    process.exit(0);
  }
}

