/**
 * db.js - MongoDB Connection Manager
 * Adevos Min-Bot
 *
 * Handles:
 * - MongoDB Atlas connection with auto-reconnect
 * - All schema definitions and model exports
 * - TTL indexes for automatic document cleanup
 * - Session statistics and server health tracking
 */

'use strict';

const mongoose = require('mongoose');
const chalk    = require('chalk');

// ─── Connection State ─────────────────────────────────────────
let isConnected       = false;
let reconnectAttempts = 0;

const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY_MS     = 5000;

// ─── Schemas ──────────────────────────────────────────────────

/**
 * Session Schema
 * Stores WhatsApp session data (creds + signal keys).
 * Replaces the old disk-based ./nexstore/pairing/<number>/ folders.
 */
const SessionSchema = new mongoose.Schema({
    sessionId: {
        type:     String,
        required: true,
        unique:   true,
        index:    true
        // e.g. "255712345678@s.whatsapp.net"
    },
    creds: {
        type:    mongoose.Schema.Types.Mixed,
        default: null
        // Full creds.json object from Baileys
    },
    keys: {
        type:    mongoose.Schema.Types.Mixed,
        default: {}
        // Signal protocol keys (pre-keys, sender-keys, etc.)
    },
    isActive: {
        type:    Boolean,
        default: false
        // true = currently connected to WhatsApp
    },
    isRegistered: {
        type:    Boolean,
        default: false
        // true = pairing completed successfully at least once
    },
    source: {
        type:    String,
        enum:    ['telegram', 'website', 'manual'],
        default: 'telegram'
    },
    lastSeen: {
        type:    Date,
        default: Date.now
        // Updated every time the session becomes active
    },
    createdAt: {
        type:    Date,
        default: Date.now
    },
    // TTL field: MongoDB will auto-delete the document after this date.
    // Reset to +30 days every time the session is active.
    expiresAt: {
        type:    Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
}, {
    timestamps: false,
    strict:     false  // Allow extra fields (Baileys creds have dynamic structure)
});

/**
 * Pairing Schema
 * Stores temporary pairing codes generated for users.
 * Auto-deleted after 1 hour via TTL index.
 */
const PairingSchema = new mongoose.Schema({
    number: {
        type:     String,
        required: true,
        unique:   true,
        index:    true
        // Clean number: "255712345678"
    },
    code: {
        type:    String,
        default: null
        // e.g. "ABCD-1234"
    },
    status: {
        type:    String,
        enum:    ['pending', 'processing', 'ready', 'done', 'failed'],
        default: 'pending'
    },
    source: {
        type:    String,
        enum:    ['telegram', 'website'],
        default: 'website'
    },
    createdAt: {
        type:    Date,
        default: Date.now
    },
    expiresAt: {
        type:    Date,
        default: () => new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    }
});

/**
 * Request Schema
 * Tracks pairing requests from website or Telegram bot.
 * Auto-deleted after 7 days via TTL index.
 */
const RequestSchema = new mongoose.Schema({
    requestId: {
        type:     String,
        required: true,
        unique:   true,
        index:    true
    },
    number: {
        type:  String,
        required: true,
        index: true
    },
    status: {
        type:    String,
        enum:    ['pending', 'processing', 'done', 'failed'],
        default: 'pending'
    },
    source: {
        type:    String,
        enum:    ['telegram', 'website'],
        default: 'website'
    },
    timestamp: {
        type:    Date,
        default: Date.now
    },
    expiresAt: {
        type:    Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
});

/**
 * User Schema
 * Keeps a record of every user who has paired a session.
 * Used by the admin panel for user management.
 */
const UserSchema = new mongoose.Schema({
    number: {
        type:     String,
        required: true,
        unique:   true,
        index:    true
    },
    lastServer: {
        type:    String,
        default: 'Main Server'
    },
    lastPaired: {
        type:    Date,
        default: Date.now
    },
    source: {
        type:    String,
        enum:    ['telegram', 'website', 'manual'],
        default: 'website'
    },
    totalPairings: {
        type:    Number,
        default: 1
    }
}, { timestamps: true });

/**
 * Blocked Schema
 * Numbers that are not allowed to pair.
 */
const BlockedSchema = new mongoose.Schema({
    number: {
        type:     String,
        required: true,
        unique:   true,
        index:    true
    },
    reason: {
        type:    String,
        default: 'Blocked by admin'
    },
    blockedAt: {
        type:    Date,
        default: Date.now
    }
});

/**
 * ServerStats Schema
 * Tracks pairing counts and online status for the admin dashboard.
 */
const ServerStatsSchema = new mongoose.Schema({
    serverName: {
        type:     String,
        required: true,
        unique:   true,
        default:  'Main Server'
    },
    totalPaired: {
        type:    Number,
        default: 0
    },
    websitePaired: {
        type:    Number,
        default: 0
    },
    telegramPaired: {
        type:    Number,
        default: 0
    },
    lastSeen: {
        type:    Date,
        default: Date.now
    }
});

/**
 * Store Schema
 * Backing store for lib/store.js — replaces data/store.json disk file.
 * Holds all group settings (antilink, badwords, warns, welcome, etc.)
 * that survive Render restarts.
 */
const StoreSchema = new mongoose.Schema({
    key:   { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null }
}, { strict: false });

/**
 * Log Schema
 * Stores important bot logs so they can be viewed from the admin panel
 * instead of relying on Render's log dashboard (saves bandwidth + gives
 * persistent history that survives service restarts).
 *
 * Only IMPORTANT events are logged here (errors, pairings, disconnects) —
 * not every single message, to keep this collection small.
 */
const LogSchema = new mongoose.Schema({
    level: {
        type:    String,
        enum:    ['info', 'warn', 'error', 'success'],
        default: 'info'
    },
    message: {
        type:     String,
        required: true
    },
    source: {
        type:    String,
        default: 'bot'  // 'bot' | 'website' | 'pairing'
    },
    meta: {
        type:    mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type:    Date,
        default: Date.now,
        index:   true
    },
    // Auto-delete logs after 3 days — keeps the collection small
    expiresAt: {
        type:    Date,
        default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }
});

// ─── Models ───────────────────────────────────────────────────
// Guard against OverwriteModelError on hot-reload
const Session     = mongoose.models.Session     || mongoose.model('Session',     SessionSchema);
const Pairing     = mongoose.models.Pairing     || mongoose.model('Pairing',     PairingSchema);
const Request     = mongoose.models.Request     || mongoose.model('Request',     RequestSchema);
const User        = mongoose.models.User        || mongoose.model('User',        UserSchema);
const Blocked     = mongoose.models.Blocked     || mongoose.model('Blocked',     BlockedSchema);
const ServerStats = mongoose.models.ServerStats || mongoose.model('ServerStats', ServerStatsSchema);
const Log         = mongoose.models.Log         || mongoose.model('Log',         LogSchema);
const StoreModel  = mongoose.models.Store         || mongoose.model('Store',        StoreSchema);

// ─── TTL Indexes ──────────────────────────────────────────────
/**
 * Creates TTL indexes that tell MongoDB to auto-delete expired documents.
 * MongoDB background job runs every ~60 seconds to check expiry.
 */
async function ensureIndexes() {
    try {
        await Session.collection.createIndex(
            { expiresAt: 1 }, { expireAfterSeconds: 0, background: true }
        );
        await Pairing.collection.createIndex(
            { expiresAt: 1 }, { expireAfterSeconds: 0, background: true }
        );
        await Request.collection.createIndex(
            { expiresAt: 1 }, { expireAfterSeconds: 0, background: true }
        );
        await Log.collection.createIndex(
            { expiresAt: 1 }, { expireAfterSeconds: 0, background: true }
        );
        console.log(chalk.green('✅ MongoDB TTL indexes ready'));
    } catch (err) {
        if (!err.message.includes('already exists')) {
            console.log(chalk.yellow(`⚠️ Index warning: ${err.message}`));
        }
    }
}

// ─── Connect ──────────────────────────────────────────────────
async function connectDB() {
    if (isConnected) return mongoose.connection;

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not set in environment variables');

    try {
        console.log(chalk.blue('🔄 Connecting to MongoDB...'));

        await mongoose.connect(MONGODB_URI, {
            maxPoolSize:              50,   // Support 100+ concurrent sessions
            minPoolSize:              5,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS:          45000,
            connectTimeoutMS:         10000,
            heartbeatFrequencyMS:     10000,
            appName:                  'AdevosMinBot'
        });

        isConnected       = true;
        reconnectAttempts = 0;

        console.log(chalk.green('✅ MongoDB connected'));

        await ensureIndexes();
        await updateServerOnline();

        return mongoose.connection;

    } catch (err) {
        isConnected = false;
        console.error(chalk.red(`❌ MongoDB connection failed: ${err.message}`));
        throw err;
    }
}

// ─── Connection Events ────────────────────────────────────────
mongoose.connection.on('connected',    () => { isConnected = true;  console.log(chalk.green('📦 MongoDB: Connected'));    });
mongoose.connection.on('disconnected', () => { isConnected = false; console.log(chalk.yellow('⚠️ MongoDB: Disconnected')); scheduleReconnect(); });
mongoose.connection.on('error',        (err) => { isConnected = false; console.error(chalk.red(`❌ MongoDB: ${err.message}`)); });

// ─── Auto-Reconnect ───────────────────────────────────────────
function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error(chalk.red('❌ Max reconnect attempts reached'));
        return;
    }

    reconnectAttempts++;
    const delay = RECONNECT_DELAY_MS * reconnectAttempts;

    console.log(chalk.yellow(`🔄 Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`));

    setTimeout(async () => {
        try { await connectDB(); } catch {}
    }, delay);
}

// ─── Server Stats ─────────────────────────────────────────────
async function updateServerOnline() {
    try {
        await ServerStats.findOneAndUpdate(
            { serverName: process.env.SERVER_NAME || 'Main Server' },
            { $set: { lastSeen: new Date() } },
            { upsert: true, new: true }
        );
    } catch {}
}

// Ping server stats every 5 minutes (reduced from 2 min) to show the
// server is alive. This is purely a "lastSeen" heartbeat — increasing
// the interval reduces MongoDB write operations and bandwidth usage
// without significantly affecting the "online/offline" status accuracy
// (website still considers a server online if seen within last 5 min).
setInterval(() => {
    if (isConnected) updateServerOnline().catch(() => {});
}, 5 * 60 * 1000);

// ─── Cleanup Helpers ──────────────────────────────────────────

/**
 * Delete sessions that have been inactive for more than N days.
 * Called by admin /clean command or automatically on schedule.
 * @param {number} daysInactive - Default 7 days
 */
async function cleanInactiveSessions(daysInactive = 7) {
    const cutoff = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000);
    try {
        const result = await Session.deleteMany({ isActive: false, lastSeen: { $lt: cutoff } });
        console.log(chalk.green(`🧹 Removed ${result.deletedCount} inactive sessions`));
        return { deleted: result.deletedCount, success: true };
    } catch (err) {
        console.error(chalk.red(`❌ cleanInactiveSessions: ${err.message}`));
        return { deleted: 0, success: false, error: err.message };
    }
}

/**
 * Delete sessions that failed registration or logged out.
 */
async function cleanLoggedOutSessions() {
    try {
        const result = await Session.deleteMany({
            isActive:     false,
            isRegistered: false,
            createdAt:    { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        console.log(chalk.green(`🧹 Removed ${result.deletedCount} logged-out sessions`));
        return { deleted: result.deletedCount, success: true };
    } catch (err) {
        return { deleted: 0, success: false, error: err.message };
    }
}

/**
 * Return a summary of session counts for the admin dashboard.
 */
async function getSessionStats() {
    try {
        const [total, active, inactive, registered] = await Promise.all([
            Session.countDocuments(),
            Session.countDocuments({ isActive: true }),
            Session.countDocuments({ isActive: false }),
            Session.countDocuments({ isRegistered: true })
        ]);
        return { total, active, inactive, registered };
    } catch {
        return { total: 0, active: 0, inactive: 0, registered: 0 };
    }
}

// ─── Logging Helper ───────────────────────────────────────────
/**
 * Write an important event to the Log collection.
 * Used instead of (or alongside) console.log so events are visible
 * in the admin panel without needing to open Render logs.
 *
 * Keep usage selective — only log meaningful events (errors, pairings,
 * disconnects) not every routine action, to avoid bloating MongoDB
 * and consuming extra bandwidth on writes.
 *
 * @param {string} level   - 'info' | 'warn' | 'error' | 'success'
 * @param {string} message - Short description of the event
 * @param {string} source  - 'bot' | 'website' | 'pairing'
 * @param {object} meta    - Optional extra data (e.g. { sessionId, number })
 */
async function logToDb(level, message, source = 'bot', meta = {}) {
    try {
        // Batch-safe: fire and forget, don't block the caller
        Log.create({ level, message, source, meta }).catch(() => {});
    } catch {
        // Never let logging failures crash the bot
    }
}

/**
 * Retrieve recent logs for the admin panel.
 * @param {number} limit - Max number of logs to return (default 100)
 * @param {string} level - Optional filter: 'error', 'warn', etc.
 */
async function getRecentLogs(limit = 100, level = null) {
    try {
        const query = level ? { level } : {};
        return await Log.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();
    } catch {
        return [];
    }
}

// ─── Exports ──────────────────────────────────────────────────
module.exports = {
    connectDB,
    isConnected:            () => isConnected,
    Session,
    Pairing,
    Request,
    User,
    Blocked,
    ServerStats,
    Log,
    StoreModel,
    cleanInactiveSessions,
    cleanLoggedOutSessions,
    getSessionStats,
    updateServerOnline,
    logToDb,
    getRecentLogs
};

