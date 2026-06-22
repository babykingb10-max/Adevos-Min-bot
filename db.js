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

// ─── Models ───────────────────────────────────────────────────
// Guard against OverwriteModelError on hot-reload
const Session     = mongoose.models.Session     || mongoose.model('Session',     SessionSchema);
const Pairing     = mongoose.models.Pairing     || mongoose.model('Pairing',     PairingSchema);
const Request     = mongoose.models.Request     || mongoose.model('Request',     RequestSchema);
const User        = mongoose.models.User        || mongoose.model('User',        UserSchema);
const Blocked     = mongoose.models.Blocked     || mongoose.model('Blocked',     BlockedSchema);
const ServerStats = mongoose.models.ServerStats || mongoose.model('ServerStats', ServerStatsSchema);

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

// Ping server stats every 2 minutes to show the server is alive
setInterval(() => {
    if (isConnected) updateServerOnline().catch(() => {});
}, 2 * 60 * 1000);

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
    cleanInactiveSessions,
    cleanLoggedOutSessions,
    getSessionStats,
    updateServerOnline
};
