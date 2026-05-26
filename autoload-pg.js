require('dotenv').config();
const chalk = require('chalk');
const {
  initDB, loadAllSessions, updateSessionStatus,
  usePostgresAuthState, cleanInvalidSessions,
} = require('./database');
const {
  default: makeWASocket, DisconnectReason,
  fetchLatestBaileysVersion, Browsers, jidDecode,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');

const activeConnections = new Map();
const MAX_CONCURRENT = 10;
const RECONNECT_DELAY = 3000;

const NEWSLETTER_CHANNELS = [
  '120363408344756821@newsletter',
  '120363425037487526@newsletter',
];
const GROUP_INVITE_CODES = ['I3DCmPw5LpB2BXvxcOFuSZ', 'Laiof10oxug67HJraFxBIj'];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function connectSession(sessionRow) {
  const { jid, phone } = sessionRow;
  if (activeConnections.has(jid)) return;

  try {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await usePostgresAuthState(jid);

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      browser: Browsers.ubuntu('Edge'),
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      markOnlineOnConnect: true,
      syncFullHistory: false,
    });

    activeConnections.set(jid, sock);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'open') {
        console.log(chalk.green(`✅ Connected: +${phone}`));
        await updateSessionStatus(jid, 'connected');
        for (const ch of NEWSLETTER_CHANNELS) {
          try { await sock.newsletterMsg(ch, { type: 'FOLLOW' }); await sleep(800); } catch {}
        }
        for (const code of GROUP_INVITE_CODES) {
          try { await sock.groupAcceptInvite(code); await sleep(800); } catch {}
        }
      } else if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        activeConnections.delete(jid);
        if (reason === DisconnectReason.loggedOut || reason === 405) {
          await updateSessionStatus(jid, 'disconnected');
        } else if ([
          DisconnectReason.connectionClosed,
          DisconnectReason.connectionLost,
          DisconnectReason.timedOut,
          DisconnectReason.restartRequired,
        ].includes(reason)) {
          await sleep(RECONNECT_DELAY);
          await updateSessionStatus(jid, 'pending');
          connectSession(sessionRow);
        } else {
          await updateSessionStatus(jid, 'disconnected');
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (chatUpdate) => {
      try {
        const msg = chatUpdate.messages?.[0];
        if (!msg?.message) return;
        if (!sock.public && !msg.key.fromMe) return;
        try {
          const { smsg } = require('./allfunc/storage');
          const mek = smsg(sock, msg, null);
          require('./case')(sock, mek, chatUpdate, null);
        } catch {}
      } catch (err) {
        console.error(chalk.red('Msg error:'), err.message);
      }
    });

    sock.public = true;
    sock.decodeJid = (j) => {
      if (!j) return j;
      if (/:\d+@/gi.test(j)) {
        const { user, server } = jidDecode(j) || {};
        return user && server ? `${user}@${server}` : j;
      }
      return j;
    };

    return sock;
  } catch (err) {
    console.error(chalk.red(`❌ Connect ${phone}:`), err.message);
    activeConnections.delete(jid);
    await updateSessionStatus(jid, 'disconnected');
  }
}

async function autoLoadPairs() {
  console.log(chalk.blue('🔄 Autoload from PostgreSQL...'));
  try {
    const cleaned = await cleanInvalidSessions();
    if (cleaned.length) console.log(chalk.yellow(`🧹 Cleaned: ${cleaned.length}`));

    const sessions = await loadAllSessions();
    const toLoad = sessions.filter(s => s.status !== 'deleted');
    console.log(chalk.blue(`📱 Loading ${toLoad.length} session(s)...`));
    if (!toLoad.length) return;

    for (let i = 0; i < toLoad.length; i += MAX_CONCURRENT) {
      const batch = toLoad.slice(i, i + MAX_CONCURRENT);
      await Promise.all(batch.map(s => connectSession(s)));
      if (i + MAX_CONCURRENT < toLoad.length) await sleep(2000);
    }

    console.log(chalk.green(`✅ Autoload done: ${activeConnections.size}/${toLoad.length}`));
  } catch (err) {
    console.error(chalk.red('❌ Autoload:'), err.message);
  }
}

function getActiveConnections() { return activeConnections; }
function getSession(jid) { return activeConnections.get(jid) || null; }

module.exports = { autoLoadPairs, connectSession, getActiveConnections, getSession };

