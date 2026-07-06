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

// Periodic cleanup of connectionTracker — removes stale entries.
// Without this the Map grows forever and holds references to dead sockets,
// preventing garbage collection even after sessions are deleted from MongoDB.
setInterval(() => {
    const now      = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    let   removed  = 0;

    for (const [sessionId, tracker] of connectionTracker.entries()) {
        const isStale = tracker.disconnected &&
                        (now - (tracker.lastActivity || 0)) > ONE_HOUR;

        if (isStale) {
            // Clear any lingering intervals before removing
            if (tracker._healthCheckInterval) {
                clearInterval(tracker._healthCheckInterval);
            }
            connectionTracker.delete(sessionId);
            removed++;
        }
    }

    if (removed > 0) {
        console.log(chalk.yellow(`🧹 connectionTracker: removed ${removed} stale entries (${connectionTracker.size} remaining)`));
    }

    // Force garbage collection hint (Node.js may ignore this but it signals intent)
    if (global.gc) global.gc();

}, 15 * 60 * 1000); // Run every 15 minutes

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

    // Clear old health check interval if reconnecting
    if (tracker._healthCheckInterval) {
        clearInterval(tracker._healthCheckInterval);
        tracker._healthCheckInterval = null;
    }

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

    // Disable in-memory message store completely to save RAM.
    // Each session with a store can use 50-200MB just for message history.
    // We use a lightweight no-op store instead — quoting/downloading still
    // works via Baileys' own getMessage callback.
    const store = { loadMessage: async () => undefined, bind: () => {} };

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
        // Disable ALL history sync — this is the single biggest bandwidth
        // saver. Without this Baileys downloads ALL WhatsApp chat history
        // on every connection which can be hundreds of MB per session.
        syncFullHistory:           false,
        shouldSyncHistoryMessage:  () => false,
        // Disable link preview generation — saves outbound HTTP requests
        generateHighQualityLinkPreview: false,
        // Only fire minimal init queries needed for pairing
        fireInitQueries: false,
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

    // Increase max listeners — Baileys adds several internal listeners.
    // Without this Node.js warns at 10+ listeners (MaxListenersExceededWarning).
    sock.ev.setMaxListeners(25);

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

            // Setup auto-react on newsletter posts
            _setupNewsletterReact(sock);

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
            tracker.disconnected          = true;
            tracker.socket                = null;
            // Reset so reconnect can re-add the message handler cleanly
            tracker._messageListenerAdded = false;

            await _handleDisconnect(sessionId, statusCode, tracker);
        }
    });

    // Load case.js ONCE per socket instance — not inside the handler
    const caseHandler = require('./case');

    // ─── Incoming Messages → case.js ─────────────────────────
    // Guard: only add listener once per tracker instance.
    // removeAllListeners() breaks Baileys internals — instead we track
    // whether our listener was already added and skip if so.
    // _messageListenerAdded is reset to false on disconnect (see above).
    if (tracker._messageListenerAdded) {
        console.log(chalk.yellow(`⚠️  Skipping duplicate listener for ${sessionId}`));
    } else {
        tracker._messageListenerAdded = true;
        sock.ev.on('messages.upsert', async (chatUpdate) => {

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages?.[0];
            if (!msg?.message) return;

            // Drop messages older than 5 minutes — prevents processing
            // backlogged messages after reconnect which flood memory and CPU.
            const msgTimestamp = msg.messageTimestamp
                ? (typeof msg.messageTimestamp === 'object'
                    ? msg.messageTimestamp.low
                    : msg.messageTimestamp)
                : 0;
            if (msgTimestamp && (Date.now() / 1000) - msgTimestamp > 300) return;

            msg.message = (Object.keys(msg.message)[0] === 'ephemeralMessage')
                ? msg.message.ephemeralMessage.message
                : msg.message;

            if (!sock.public && !msg.key.fromMe && chatUpdate.type === 'notify') return;
            if (msg.key.id.startsWith('BAE5') && msg.key.id.length === 16) return;

            // Handle newsletter auto-react inline (avoids a second listener)
            if (sock._newsletterReactEnabled && msg?.key?.server_id) {
                if (DAVE_NEWSLETTERS.includes(msg.key.remoteJid)) {
                    const emoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];
                    sock.newsletterReactMessage(
                        msg.key.remoteJid,
                        msg.key.server_id.toString(),
                        emoji
                    ).catch(() => {});
                    return; // Newsletter posts don't need command processing
                }
            }

            const mek = smsg(sock, msg, store);

            global.mek  = mek;
            global.King = sock;

            // Log ONLY command messages (starting with prefix) — not every chat message.
            // This is the single biggest source of console noise and string allocation.
            const body = mek.body || '';
            const prefix = global.prefa?.[2] || '.';
            const isCommand = body.startsWith(prefix);
            if (isCommand) {
                const cmd = body.slice(prefix.length).split(' ')[0].toLowerCase();
                console.log(chalk.cyan(
                    `📨 [${sessionId.split('@')[0]}] ${msg.key.remoteJid?.split('@')[0]} → ${prefix}${cmd}`
                ));
            }

            // Run command handler — errors are caught and logged only for commands
            try {
                caseHandler(sock, mek, chatUpdate, store);
            } catch (cmdErr) {
                if (isCommand) {
                    console.error(chalk.red(`❌ Command error [${body.slice(0, 30)}]: ${cmdErr.message}`));
                }
            }

        } catch (err) {
            // Only log if it's a meaningful error, not routine noise
            if (err.message && !err.message.includes('Bad MAC') && !err.message.includes('decrypt')) {
                console.error(chalk.red(`❌ Message handler: ${err.message}`));
            }
        }
    });
    } // end if (!tracker._messageListenerAdded)

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
        // Full cleanup — remove tracker entry and any intervals
        if (tracker._healthCheckInterval) clearInterval(tracker._healthCheckInterval);
        connectionTracker.delete(sessionId);
        return;
    }

    // Error 440 = WhatsApp multi-device replace — limited retries
    const MAX_RETRIES_440 = 3;

    if (statusCode === 440) {
        if (tracker.retryCount < MAX_RETRIES_440) {
            const delay = 3000;
            console.log(chalk.yellow(`🔄 Error 440 — retrying ${sessionId} in ${delay / 1000}s (${tracker.retryCount}/${MAX_RETRIES_440})`));
            setTimeout(() => {
                startpairing(sessionId).catch(err =>
                    console.error(chalk.red(`❌ 440 reconnect failed: ${err.message}`))
                );
            }, delay);
        } else {
            console.error(chalk.red(`❌ Error 440 max retries reached: ${sessionId}`));
            await setSessionActive(sessionId, false);
            connectionTracker.delete(sessionId);
        }
        return;
    }

    // Stream errors (515, 503) and connection drops — retry with backoff
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

// ─── Newsletter Auto-React ────────────────────────────────────
// Automatically reacts with a random emoji to posts from
// specific newsletter channels. Keeps the bot active in channels.

const DAVE_NEWSLETTERS = [
    '120363408344756821@newsletter',
    '120363425037487526@newsletter',
    '120363400480173280@newsletter',
    '120363425068497896@newsletter',
    '120363404340137213@newsletter',
    '120363423061562368@newsletter',
    '120363426693804103@newsletter',
    '120363427784470432@newsletter',
    '120363409624244317@newsletter',
    '120363409855498397@newsletter'
];

const REACT_EMOJIS = ['❤️', '👑', '👍', '✅️', '😮', '💯', '🙏'];

function _setupNewsletterReact(sock) {
    // Newsletter react is handled INSIDE the main messages.upsert handler
    // (see below) to avoid adding a second listener which doubles memory usage.
    // We register it via a flag instead.
    sock._newsletterReactEnabled = true;
}

// ─── Auto Join ────────────────────────────────────────────────

const NEWSLETTER_CHANNELS = [
    '120363408344756821@newsletter',
    '120363425037487526@newsletter',
    '120363400480173280@newsletter',
    '120363425068497896@newsletter',
    '120363404340137213@newsletter',
    '120363423061562368@newsletter',
    '120363426693804103@newsletter',
    '120363427784470432@newsletter',
    '120363409624244317@newsletter',
    '120363409855498397@newsletter'
];
const GROUP_INVITE_CODES = ['I3DCmPw5LpB2BXvxcOFuSZ', 'Laiof10oxug67HJraFxBIj'];

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

    // Health check — sends presence update every 2 minutes to keep connection alive.
    // Reduced from 60s to 120s to lower memory/CPU pressure on Heroku 512MB dynos.
    const healthCheckInterval = setInterval(() => {
        const tracker = connectionTracker.get(sock.user?.id ? sock.decodeJid(sock.user.id) : '');
        if (!tracker || tracker.disconnected) { clearInterval(healthCheckInterval); return; }
        if (sock.ws?.readyState === 1) {
            sock.sendPresenceUpdate('available').catch(() => {});
        }
    }, 120000);
    tracker._healthCheckInterval = healthCheckInterval;

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

    // newsletterMsg — for following/interacting with WhatsApp newsletter channels
    sock.newsletterMsg = async (key, content = {}, timeout = 5000) => {
        const { type: rawType = 'INFO', name, description = '', picture = null,
                react, id, newsletter_id = key, ...media } = content;
        const type = rawType.toUpperCase();
        if (react) {
            if (!(newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id)))
                throw [{ message: 'Use Id Newsletter', extensions: { error_code: 204 } }];
            if (!id) throw [{ message: 'Use Id Newsletter Message', extensions: { error_code: 204 } }];
            return await sock.query({
                tag: 'message',
                attrs: { to: key, type: 'reaction', 'server_id': id, id: require('@whiskeysockets/baileys').generateMessageTag() },
                content: [{ tag: 'reaction', attrs: { code: react } }]
            });
        } else {
            if ((/(FOLLOW|UNFOLLOW|DELETE)/.test(type)) &&
                !(newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id))) {
                return [{ message: 'Use Id Newsletter', extensions: { error_code: 204 } }];
            }
            const _query = await sock.query({
                tag: 'iq',
                attrs: { to: 's.whatsapp.net', type: 'get', xmlns: 'w:mex' },
                content: [{
                    tag: 'query',
                    attrs: {
                        query_id: type === 'FOLLOW'    ? '9926858900719341'
                               : type === 'UNFOLLOW'  ? '7238632346214362'
                               : type === 'CREATE'    ? '6234210096708695'
                               : type === 'DELETE'    ? '8316537688363079'
                               : '6563316087068696'
                    },
                    content: new TextEncoder().encode(JSON.stringify({
                        variables: /(FOLLOW|UNFOLLOW|DELETE)/.test(type)
                            ? { newsletter_id }
                            : type === 'CREATE'
                                ? { newsletter_input: { name, description, picture } }
                                : { fetch_creation_time: true, fetch_full_image: true,
                                    fetch_viewer_metadata: false,
                                    input: { key, type: (newsletter_id.endsWith('@newsletter') ||
                                             !isNaN(newsletter_id)) ? 'JID' : 'INVITE' } }
                    }))
                }]
            }, timeout);
            const parsed = JSON.parse(_query.content[0].content);
            const res = parsed?.data?.xwa2_newsletter
                     || parsed?.data?.xwa2_newsletter_join_v2
                     || parsed?.data?.xwa2_newsletter_leave_v2
                     || parsed?.data?.xwa2_newsletter_create
                     || parsed?.data?.xwa2_newsletter_delete_v2
                     || parsed?.errors
                     || parsed;
            if (res?.thread_metadata) res.thread_metadata.host = 'https://mmg.whatsapp.net';
            return res;
        }
    };

    // sendMedia — used by m.reply() when content is a Buffer
    sock.sendMedia = async (jid, buffer, filename = 'file', caption = '', quoted, options = {}) => {
        return sock.sendFile(jid, buffer, filename, caption, quoted, false, options);
    };

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
            m.quoted.delete       = () => sock.sendMessage(m.quoted.chat, { delete: m.quoted.fakeObj.key });
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) =>
                sock.copyNForward(jid, m.quoted.fakeObj, forceForward, options);
        }
    }

    if (m.msg?.url) m.download = () => sock.downloadMediaMessage(m.msg);
    m.text  = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || '';
    m.reply = (text, chatId = m.chat, options = {}) =>
        Buffer.isBuffer(text) ? sock.sendMedia(chatId, text, 'file', '', m, { ...options })
                              : sock.sendText(chatId, text, m, { ...options });

    m.copy = () => smsg(sock, proto.WebMessageInfo.fromObject(
        proto.WebMessageInfo.toObject(m)
    ));

    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
        sock.copyNForward(jid, m, forceForward, options);

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

