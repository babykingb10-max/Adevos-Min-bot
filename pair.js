/**
 * pair.js - WhatsApp Pairing Manager
 * Adevos Min-Bot
 *
 * Changes from previous version:
 * - Removed: disk storage (./nexstore/pairing/<number>/)
 * - Removed: Firebase integration
 * - Removed: pairing.json file writing
 * - Removed: Server 1-5 system
 * - Added:   MongoDB session storage via useMongoAuthState()
 * - Added:   Connection queue supporting 100+ concurrent users
 * - Kept:    case.js integration (unchanged)
 * - Kept:    All socket extensions (sendFile, sticker, etc.)
 */

'use strict';

// Initialize globals expected by case.js
global.mek  = null;
global.King = null;

require('dotenv').config();

const {
    default: makeWASocket,
    jidDecode,
    DisconnectReason,
    Browsers,
    getContentType,
    proto,
    downloadContentFromMessage,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

// makeInMemoryStore was removed from default exports in newer Baileys versions.
// Import it separately and fall back to null if unavailable.
let makeInMemoryStore = null;
let initAuthCreds     = null;
try {
    const baileys = require('@whiskeysockets/baileys');
    if (typeof baileys.makeInMemoryStore === 'function') {
        makeInMemoryStore = baileys.makeInMemoryStore;
    }
    if (typeof baileys.initAuthCreds === 'function') {
        initAuthCreds = baileys.initAuthCreds;
    }
} catch {}

const pino     = require('pino');
const chalk    = require('chalk');
const FileType = require('file-type');
const fs       = require('fs');
const path     = require('path');

const { connectDB, Session, ServerStats, logToDb } = require('./db');
const {
    useMongoAuthState,
    saveSession,
    deleteSession,
    setSessionActive,
    savePairingCode
} = require('./sessionStore');

const { writeExifImg, imageToWebp } = require('./allfunc/exif');
const { getBuffer, getSizeMedia }   = require('./allfunc/myfunc');

// ─── Config ───────────────────────────────────────────────────
const SERVER_NAME     = process.env.SERVER_NAME     || 'Main Server';
const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS || '100');

// ─── Connection Tracker ───────────────────────────────────────
// In-memory map of all active and pending connections.
// Key:   sessionId (e.g. "255712345678@s.whatsapp.net")
// Value: { socket, retryCount, disconnected, lastActivity }
const connectionTracker = new Map();

// ─── Connection Queue ─────────────────────────────────────────
// Prevents overwhelming the server by limiting simultaneous
// new connections being established at once.
const connectionQueue = [];
let   activeCount     = 0;
const MAX_CONCURRENT  = 10;   // Max new connections being set up at one time
const QUEUE_DELAY_MS  = 300;  // Delay between queue processing cycles

function processQueue() {
    if (activeCount >= MAX_CONCURRENT || connectionQueue.length === 0) return;

    activeCount++;
    const { sessionId, resolve, reject } = connectionQueue.shift();

    _startPairing(sessionId)
        .then(result => {
            activeCount--;
            resolve(result);
            setTimeout(processQueue, QUEUE_DELAY_MS);
        })
        .catch(err => {
            activeCount--;
            reject(err);
            setTimeout(processQueue, QUEUE_DELAY_MS);
        });
}

// ─── Public Entry Point ───────────────────────────────────────

/**
 * startpairing
 * Main function called by bot.js and autoload.js.
 * Queues the connection request to prevent overload.
 *
 * @param {string} sessionId - WhatsApp JID "255712345678@s.whatsapp.net"
 * @returns {Promise<WASocket>}
 */
async function startpairing(sessionId) {
    // Return existing socket if already connected
    const existing = connectionTracker.get(sessionId);
    if (existing && !existing.disconnected && existing.socket) {
        console.log(chalk.yellow(`⚠️ Already connected: ${sessionId}`));
        return existing.socket;
    }

    // Enforce max connections limit
    if (connectionTracker.size >= MAX_CONNECTIONS) {
        throw new Error(
            `Server is full (${connectionTracker.size}/${MAX_CONNECTIONS}). Try again later.`
        );
    }

    return new Promise((resolve, reject) => {
        connectionQueue.push({ sessionId, resolve, reject });
        processQueue();
    });
}

// ─── Core Pairing Logic ───────────────────────────────────────

async function _startPairing(sessionId) {
    await connectDB();

    // Initialise tracker entry
    if (!connectionTracker.has(sessionId)) {
        connectionTracker.set(sessionId, {
            socket:       null,
            retryCount:   0,
            disconnected: false,
            lastActivity: Date.now()
        });
    }

    const tracker     = connectionTracker.get(sessionId);
    tracker.retryCount++;
    tracker.disconnected  = false;
    tracker.lastActivity  = Date.now();

    const { version }           = await fetchLatestBaileysVersion();
    const { state, saveCreds }  = await useMongoAuthState(sessionId);

    // Ensure creds is never null — Baileys crashes if state.creds is null.
    if (!state.creds && initAuthCreds) {
        state.creds = initAuthCreds();
    } else if (!state.creds) {
        state.creds = {};
    }

    // If this is a fresh pairing (not registered yet) and we have stale keys
    // from a previous failed attempt, clear them to prevent NaN size errors.
    // Stale signal keys from incomplete sessions cause Baileys frame size = NaN.
    if (!state.creds?.registered && state.keys && Object.keys(state.keys).length > 0) {
        console.log(chalk.yellow(`🧹 Clearing stale signal keys for fresh pair: ${sessionId}`));
        try {
            const { saveSession } = require('./sessionStore');
            await saveSession(sessionId, { keys: {} });
            state.keys = {};
        } catch (e) {
            console.error(chalk.red(`❌ Could not clear stale keys: ${e.message}`));
        }
    }

    // In-memory message store — only created if makeInMemoryStore is available.
    // Newer Baileys versions removed it; we fall back to a lightweight no-op.
    const store = makeInMemoryStore
        ? makeInMemoryStore({ logger: pino({ level: 'silent' }) })
        : { loadMessage: async () => undefined, bind: () => {} };

    // ─── Create Socket ────────────────────────────────────────
    const sock = makeWASocket({
        version,
        logger:              pino({ level: 'silent' }),
        printQRInTerminal:   false,
        auth:                state,
        browser:             Browsers.ubuntu('Edge'),
        connectTimeoutMs:    60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        emitOwnEvents:       true,
        syncFullHistory:     false,
        markOnlineOnConnect: true,
        // Return undefined (not null) so Baileys skips size calculation safely
        getMessage: async (key) => {
            try {
                if (!store || !store.loadMessage) return undefined;
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            } catch {
                return undefined;
            }
        }
    });

    if (store && typeof store.bind === 'function') store.bind(sock.ev);
    tracker.socket = sock;

    // ─── Request Pairing Code ─────────────────────────────────
    if (!state.creds?.registered) {
        const phoneNumber = sessionId.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');

        setTimeout(async () => {
            try {
                // Validate phoneNumber before calling requestPairingCode
                // NaN error occurs when phoneNumber is empty or not a valid number
                if (!phoneNumber || isNaN(Number(phoneNumber)) || phoneNumber.length < 7) {
                    console.error(chalk.red(`❌ Invalid phone number: ${phoneNumber} from sessionId: ${sessionId}`));
                    return;
                }

                console.log(chalk.blue(`📱 Requesting pairing code for: ${phoneNumber}`));

                let code = await sock.requestPairingCode(phoneNumber);
                code     = code?.match(/.{1,4}/g)?.join('-') || code;

                console.log(chalk.bgGreen.black(
                    `📱 Pairing code for ${phoneNumber}: ${chalk.white.bold(code)}`
                ));

                // Save to MongoDB
                await savePairingCode(phoneNumber, code, 'telegram');

            } catch (err) {
                console.error(chalk.red(`❌ Pairing code error [${phoneNumber}]: ${err.message}`));

                // If NaN size error occurs during pairing, clear stale session keys
                // and retry once with clean state
                if (err.message && err.message.includes('out of range')) {
                    console.log(chalk.yellow(`🔄 NaN size error detected — clearing stale session keys for ${sessionId}`));
                    try {
                        const { saveSession } = require('./sessionStore');
                        await saveSession(sessionId, { keys: {}, creds: state.creds });
                        console.log(chalk.green(`✅ Stale keys cleared for ${sessionId}`));
                    } catch (clearErr) {
                        console.error(chalk.red(`❌ Failed to clear keys: ${clearErr.message}`));
                    }
                }
            }
        }, 3000);
    }

    // ─── Connection Events ────────────────────────────────────
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        const tracker = connectionTracker.get(sessionId);

        if (connection === 'open') {
            console.log(chalk.bgGreen.black(`✅ Connected: ${sessionId}`));
            tracker.retryCount   = 0;
            tracker.disconnected = false;
            tracker.lastActivity = Date.now();

            logToDb('success', `WhatsApp connected: ${sessionId}`, 'pairing', { sessionId });

            await setSessionActive(sessionId, true);
            await _updateServerStats();
            await _autoJoin(sock);

            // Restore saved bot mode (public/private) from MongoDB.
            // Prevents mode from resetting to public after every restart.
            await _restoreBotMode(sock, sessionId);

            // Send a "connected" confirmation message to the owner's chat.
            // Only sent once per process lifetime for this session — guards
            // against spamming the owner on flaky-network reconnect loops.
            if (!tracker.connectedMessageSent) {
                await _sendConnectedMessage(sock, sessionId);
                tracker.connectedMessageSent = true;
            }

        } else if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(chalk.yellow(`🔌 Disconnected: ${sessionId} [${statusCode}]`));

            await setSessionActive(sessionId, false);
            tracker.disconnected = true;
            tracker.socket       = null;

            await _handleDisconnect(sessionId, statusCode, tracker);
        }
    });

    // ─── Incoming Messages → case.js ─────────────────────────
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages?.[0];
            if (!msg?.message) return;

            msg.message = (Object.keys(msg.message)[0] === 'ephemeralMessage')
                ? msg.message.ephemeralMessage.message
                : msg.message;

            if (!sock.public && !msg.key.fromMe && chatUpdate.type === 'notify') return;
            if (msg.key.id.startsWith('BAE5') && msg.key.id.length === 16) return;

            // case.js is not modified - passes through as-is
            const mek = smsg(sock, msg, store);

            // case.js uses 'mek' and 'King' (socket) as global variables (legacy pattern).
            // Set them globally so case.js works without modification.
            global.mek  = mek;
            global.King = sock;

            require('./case')(sock, mek, chatUpdate, store);

        } catch (err) {
            console.error(chalk.red(`❌ Message handler: ${err.message}`));
        }
    });

    sock.ev.on('creds.update', saveCreds);

    _extendSocket(sock, store);

    return sock;
}

// ─── Disconnect Handler ───────────────────────────────────────

async function _handleDisconnect(sessionId, statusCode, tracker) {
    const DR = DisconnectReason;

    console.log(chalk.yellow(`🔌 Disconnect reason code: ${statusCode} for ${sessionId}`));

    // Fatal errors — delete session completely, do not retry
    const FATAL_CODES = [
        405,
        DR.loggedOut,
        DR.badSession,
        DR.forbidden
    ];

    if (FATAL_CODES.includes(statusCode)) {
        const reasons = {
            405:             'Error 405 (banned/replaced)',
            [DR.loggedOut]:  'Logged out by user',
            [DR.badSession]: 'Bad session data',
            [DR.forbidden]:  'Forbidden'
        };
        const reason = reasons[statusCode] || `Fatal error (${statusCode})`;

        console.log(chalk.red(`❌ ${reason} — deleting session: ${sessionId}`));
        logToDb('warn', `Session removed: ${reason}`, 'pairing', { sessionId, statusCode });

        // Mark as inactive AND unregistered in MongoDB
        await setSessionActive(sessionId, false);
        await deleteSession(sessionId);
        connectionTracker.delete(sessionId);
        return;
    }

    // Stream errors (515, 503) and connection drops — retry with backoff
    const RETRIABLE_CODES = [
        515,  // Stream error (the NaN error appears with this code)
        503,  // Service unavailable
        DisconnectReason.connectionClosed,
        DisconnectReason.connectionLost,
        DisconnectReason.connectionReplaced,
        DisconnectReason.timedOut,
        DisconnectReason.restartRequired
    ];

    const MAX_RETRIES = 5;
    if (tracker.retryCount < MAX_RETRIES) {
        const delay = Math.min(3000 * tracker.retryCount, 30000);
        console.log(chalk.yellow(
            `🔄 Reconnecting ${sessionId} in ${delay / 1000}s (attempt ${tracker.retryCount}/${MAX_RETRIES})`
        ));

        setTimeout(() => {
            startpairing(sessionId).catch(err =>
                console.error(chalk.red(`❌ Reconnect failed: ${err.message}`))
            );
        }, delay);
    } else {
        console.error(chalk.red(`❌ Max retries reached: ${sessionId}`));
        // Mark inactive but keep session in MongoDB (user can reconnect via /autoload)
        await setSessionActive(sessionId, false);
        connectionTracker.delete(sessionId);
    }
}

// ─── Restore Bot Mode ────────────────────────────────────────
/**
 * Reads saved bot mode from MongoDB and applies it to the socket.
 * This ensures .private / .public settings survive restarts.
 */
async function _restoreBotMode(sock, sessionId) {
    try {
        const { getSetting } = require('./setting/Settings');
        const botJid = sessionId; // use sessionId as key for bot-level settings
        const savedMode = getSetting(botJid, 'mode', 'public');
        sock.public = (savedMode !== 'self' && savedMode !== 'private');
        console.log(chalk.blue(
            `⚙️  Bot mode restored: ${sock.public ? 'Public' : 'Private'} for ${sessionId}`
        ));
    } catch (err) {
        // Settings module may not be available — default to public
        console.log(chalk.yellow(`⚠️  Could not restore bot mode: ${err.message}`));
        sock.public = true;
    }
}

// ─── Connected Confirmation Message ──────────────────────────
/**
 * Sends a styled "connected" confirmation message to the owner's own
 * WhatsApp chat (Message yourself) once pairing succeeds.
 * Mirrors the prefix, mode, and bot name actually in use so the owner
 * gets accurate confirmation rather than hardcoded placeholder text.
 */
async function _sendConnectedMessage(sock, sessionId) {
    try {
        const prefix = (global.prefa && global.prefa[2]) || '.';
        const mode   = sock.public ? 'public' : 'private';
        const botName = global.botname || global.BOT_NAME || 'Adevos Min-Bot';
        const devName = global.OWNER_NAME || 'Adevos';

        const text =
`╭──━ CONNECTED ━───
┃✧ Prefix: [ ${prefix} ]
┃✧ Mode: ${mode}
┃✧ Platform: Panel
┃✧ Status: Active
┃✧ Dev: ${devName}
┃✧ Bot: ${botName}
╰─────━━━━───────`;

        // Send to "Message yourself" (the bot's own number)
        const ownJid = sock.user?.id ? sock.decodeJid(sock.user.id) : sessionId;
        await sock.sendMessage(ownJid, { text });

        console.log(chalk.green(`✅ Connected message sent to ${sessionId}`));

    } catch (err) {
        // Non-fatal — don't let a failed confirmation message break the connection
        console.log(chalk.yellow(`⚠️  Could not send connected message: ${err.message}`));
    }
}

// ─── Auto Join ────────────────────────────────────────────────

const NEWSLETTER_CHANNELS = ['120363408344756821@newsletter'];
const GROUP_INVITE_CODES  = ['I3DCmPw5LpB2BXvxcOFuSZ'];

async function _autoJoin(sock) {
    for (const ch of NEWSLETTER_CHANNELS) {
        try { await sock.newsletterMsg?.(ch, { type: 'FOLLOW' }); await _sleep(800); } catch {}
    }
    for (const code of GROUP_INVITE_CODES) {
        try { await sock.groupAcceptInvite(code); await _sleep(800); } catch {}
    }
}

// ─── Server Stats ─────────────────────────────────────────────

async function _updateServerStats() {
    try {
        await ServerStats.findOneAndUpdate(
            { serverName: SERVER_NAME },
            { $set: { lastSeen: new Date() }, $inc: { totalPaired: 1 } },
            { upsert: true }
        );
    } catch {}
}

// ─── Socket Extensions ────────────────────────────────────────

function _extendSocket(sock, store) {
    // Default to public mode — will be overridden below if saved mode exists
    sock.public = true;

    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
        }
        return jid;
    };

    sock.sendText = (jid, text, quoted = '', options) =>
        sock.sendMessage(jid, { text, ...options }, { quoted });

    sock.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
        sock.sendMessage(
            jid,
            { text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options },
            { quoted }
        );

    sock.getFile = async (PATH, save) => {
        try {
            if (!PATH) return { filename: '', size: 0, mime: 'application/octet-stream', ext: '.bin', data: Buffer.alloc(0) };

            let data = Buffer.isBuffer(PATH)                          ? PATH
                : /^data:.*?\/.*?;base64,/i.test(PATH)              ? Buffer.from(PATH.split(',')[1], 'base64')
                : /^https?:\/\//.test(PATH)                          ? await getBuffer(PATH)
                : fs.existsSync(PATH)                                ? fs.readFileSync(PATH)
                : Buffer.alloc(0);

            const type     = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' };
            const filename = path.join(__dirname, 'src', `${Date.now()}.${type.ext}`);
            if (data && save) {
                if (!fs.existsSync(path.dirname(filename))) fs.mkdirSync(path.dirname(filename), { recursive: true });
                fs.writeFileSync(filename, data);
            }
            const size = data ? data.length : 0;  // Use buffer length directly, avoid NaN
            return { filename, size, ...type, data };
        } catch (err) {
            console.error('getFile error:', err.message);
            return { filename: '', size: 0, mime: 'application/octet-stream', ext: '.bin', data: Buffer.alloc(0) };
        }
    };

    sock.downloadMediaMessage = async (message) => {
        const mime        = (message.msg || message).mimetype || '';
        const messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream      = await downloadContentFromMessage(message, messageType);
        let   buffer      = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
    };

    sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        const quoted      = message.msg ? message.msg : message;
        const mime        = (message.msg || message).mimetype || '';
        const messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream      = await downloadContentFromMessage(quoted, messageType);
        let   buffer      = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        const type        = await FileType.fromBuffer(buffer);
        const stickerDir  = path.join(__dirname, 'sticker');
        if (!fs.existsSync(stickerDir)) fs.mkdirSync(stickerDir, { recursive: true });
        const filePath    = attachExtension ? path.join(stickerDir, `${filename}.${type.ext}`) : path.join(stickerDir, filename);
        fs.writeFileSync(filePath, buffer);
        return filePath;
    };

    sock.sendImageAsSticker = async (jid, filePath, quoted, options = {}) => {
        let buff = Buffer.isBuffer(filePath)                        ? filePath
            : /^data:.*?\/.*?;base64,/i.test(filePath)            ? Buffer.from(filePath.split(',')[1], 'base64')
            : /^https?:\/\//.test(filePath)                        ? await getBuffer(filePath)
            : fs.existsSync(filePath)                              ? fs.readFileSync(filePath)
            : Buffer.alloc(0);

        const buffer = (options?.packname || options?.author)
            ? await writeExifImg(buff, options)
            : await imageToWebp(buff);

        await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        try { fs.unlinkSync(buffer); } catch {}
    };

    sock.sendFile = async (jid, filePath, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        const type = await sock.getFile(filePath, true);
        const { data: file, filename: pathFile } = type;

        let mtype = /webp/.test(type.mime) ? 'sticker'
            : /image/.test(type.mime)      ? 'image'
            : /video/.test(type.mime)      ? 'video'
            : /audio/.test(type.mime)      ? 'audio'
            : 'document';

        if (options.asDocument) mtype = 'document';

        const message = { ...options, caption, ptt, [mtype]: { url: pathFile }, mimetype: type.mime };

        try {
            return await sock.sendMessage(jid, message, { quoted, ...options });
        } catch {
            return await sock.sendMessage(jid, { ...message, [mtype]: file }, { quoted, ...options });
        }
    };
}

// ─── smsg Helper ──────────────────────────────────────────────

function smsg(sock, m, store) {
    if (!m) return m;
    const M = proto.WebMessageInfo;

    if (m.key) {
        m.id        = m.key.id;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat      = m.key.remoteJid;
        m.fromMe    = m.key.fromMe;
        m.isGroup   = m.chat.endsWith('@g.us');
        m.sender    = sock.decodeJid(m.fromMe && sock.user.id || m.participant || m.key.participant || m.chat || '');
        if (m.isGroup) m.participant = sock.decodeJid(m.key.participant) || '';
    }

    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg   = (m.mtype === 'viewOnceMessage'
            ? m.message[m.mtype]?.message?.[getContentType(m.message[m.mtype]?.message)]
            : m.message[m.mtype]) || {};

        m.body = m.message.conversation || m.msg?.caption || m.msg?.text
            || (m.mtype === 'listResponseMessage' && m.msg?.singleSelectReply?.selectedRowId)
            || (m.mtype === 'buttonsResponseMessage' && m.msg?.selectedButtonId)
            || m.text || '';

        let quoted         = m.quoted = m.msg?.contextInfo?.quotedMessage || null;
        m.mentionedJid     = m.msg?.contextInfo?.mentionedJid || [];

        if (m.quoted) {
            const type     = getContentType(quoted);
            m.quoted       = m.quoted[type];
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted };
            m.quoted.mtype  = type;
            m.quoted.id     = m.msg.contextInfo.stanzaId;
            m.quoted.chat   = m.msg.contextInfo.remoteJid || m.chat;
            m.quoted.sender = sock.decodeJid(m.msg.contextInfo.participant);
            m.quoted.fromMe = m.quoted.sender === sock.decodeJid(sock.user.id);
            m.quoted.text   = m.quoted.text || m.quoted.caption || m.quoted.conversation || '';
            m.quoted.mentionedJid = m.msg.contextInfo?.mentionedJid || [];
            m.quoted.download     = () => sock.downloadMediaMessage(m.quoted);
            m.quoted.fakeObj      = M.fromObject({
                key:     { remoteJid: m.quoted.chat, fromMe: m.quoted.fromMe, id: m.quoted.id },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            });
        }
    }

    if (m.msg?.url) m.download = () => sock.downloadMediaMessage(m.msg);
    m.text  = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || '';
    m.reply = (text, chatId = m.chat, options = {}) =>
        Buffer.isBuffer(text) ? sock.sendFile(chatId, text, 'file', '', m, { ...options })
                              : sock.sendText(chatId, text, m, { ...options });

    return m;
}

// ─── Utilities ────────────────────────────────────────────────

function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getConnection(sessionId)  { return connectionTracker.get(sessionId); }
function getActiveCount()          { return connectionTracker.size; }

// Hot reload in development
const file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright('🔄 pair.js updated'));
    delete require.cache[file];
    require(file);
});

// ─── Exports ──────────────────────────────────────────────────
module.exports                          = startpairing;
module.exports.getConnection            = getConnection;
module.exports.getActiveCount           = getActiveCount;
module.exports.connectionTracker        = connectionTracker;
