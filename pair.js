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

require('dotenv').config();

const {
    default: makeWASocket,
    jidDecode,
    DisconnectReason,
    Browsers,
    getContentType,
    proto,
    downloadContentFromMessage,
    fetchLatestBaileysVersion,
    makeInMemoryStore
} = require('@whiskeysockets/baileys');

const pino     = require('pino');
const chalk    = require('chalk');
const FileType = require('file-type');
const fs       = require('fs');
const path     = require('path');

const { connectDB, Session, ServerStats } = require('./db');
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

    // In-memory message store (for quoting, downloading, etc.)
    const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });

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
        syncFullHistory:     false,   // Keep memory usage low
        markOnlineOnConnect: true,
        getMessage: async key => {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg?.message || '';
        }
    });

    store.bind(sock.ev);
    tracker.socket = sock;

    // ─── Request Pairing Code ─────────────────────────────────
    if (!state.creds?.registered) {
        const phoneNumber = sessionId.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');

        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code     = code?.match(/.{1,4}/g)?.join('-') || code;

                console.log(chalk.bgGreen.black(
                    `📱 Pairing code for ${phoneNumber}: ${chalk.white.bold(code)}`
                ));

                // Save to MongoDB (replaces Firebase + pairing.json)
                await savePairingCode(phoneNumber, code, 'telegram');

            } catch (err) {
                console.error(chalk.red(`❌ Pairing code error [${phoneNumber}]: ${err.message}`));
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

            await setSessionActive(sessionId, true);
            await _updateServerStats();
            await _autoJoin(sock);

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

    // Fatal errors - delete session, do not retry
    if ([405, DR.loggedOut, DR.badSession].includes(statusCode)) {
        const reason = statusCode === 405
            ? 'Error 405 (banned/replaced)'
            : statusCode === DR.loggedOut
                ? 'Logged out'
                : 'Bad session';

        console.log(chalk.red(`❌ ${reason} — deleting session: ${sessionId}`));
        await deleteSession(sessionId);
        connectionTracker.delete(sessionId);
        return;
    }

    // Retriable errors - exponential backoff up to 5 attempts
    const MAX_RETRIES = 5;
    if (tracker.retryCount < MAX_RETRIES) {
        const delay = Math.min(3000 * tracker.retryCount, 30000);
        console.log(chalk.yellow(
            `🔄 Reconnecting ${sessionId} in ${delay / 1000}s (${tracker.retryCount}/${MAX_RETRIES})`
        ));

        setTimeout(() => {
            startpairing(sessionId).catch(err =>
                console.error(chalk.red(`❌ Reconnect failed: ${err.message}`))
            );
        }, delay);
    } else {
        console.error(chalk.red(`❌ Max retries reached: ${sessionId}`));
        connectionTracker.delete(sessionId);
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
        let data = Buffer.isBuffer(PATH)                          ? PATH
            : /^data:.*?\/.*?;base64,/i.test(PATH)              ? Buffer.from(PATH.split(',')[1], 'base64')
            : /^https?:\/\//.test(PATH)                          ? await getBuffer(PATH)
            : fs.existsSync(PATH)                                ? fs.readFileSync(PATH)
            : Buffer.alloc(0);

        const type     = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' };
        const filename = path.join(__dirname, 'src', `${Date.now()}.${type.ext}`);
        if (data && save) { if (!fs.existsSync(path.dirname(filename))) fs.mkdirSync(path.dirname(filename), { recursive: true }); fs.writeFileSync(filename, data); }
        return { filename, size: await getSizeMedia(data), ...type, data };
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
