/**
 * lib/store.js - MongoDB-backed Store
 * Adevos Min-Bot
 *
 * Changes from previous version:
 * - Removed: data/store.json disk file (lost on Render restart)
 * - Added:   MongoDB collection 'groupsettings'
 * - Kept:    Exact same API (get, set, del, getChat, setChat, getUser, setUser)
 *            so bot.js needs zero changes
 *
 * All group settings (antilink, badwords, warns, welcome messages, etc.)
 * now survive Render restarts because they live in MongoDB Atlas.
 */

'use strict';

const mongoose = require('mongoose');

// Use StoreModel from db.js (schema is defined there alongside all other schemas)
// This prevents OverwriteModelError on hot-reload
let Store;
try {
    const db = require('../db');
    Store = db.StoreModel;
} catch {
    // Fallback: define model here if db.js is not available
    const StoreSchema = new mongoose.Schema({
        key:   { type: String, required: true, unique: true, index: true },
        value: { type: mongoose.Schema.Types.Mixed, default: null }
    }, { strict: false });
    Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);
}

// ─── RAM Cache ────────────────────────────────────────────────
// In-memory cache to prevent hitting MongoDB on every message.
// TTL: 10 minutes. Invalidated on every write.
const cache     = new Map();
const CACHE_TTL = 10 * 60 * 1000;

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return undefined; }
    return entry.val;
}

function setCache(key, val) {
    cache.set(key, { val, ts: Date.now() });
}

function delCache(key) {
    cache.delete(key);
}

// ─── DB Helpers ───────────────────────────────────────────────

function isConnected() {
    return mongoose.connection.readyState === 1;
}

// ─── Core API ─────────────────────────────────────────────────

/**
 * Get a value by key.
 * Falls back to RAM cache first, then MongoDB, then fallback value.
 * @param {string} key
 * @param {*}      fallback
 */
function get(key, fallback = null) {
    // Check RAM cache first (sync)
    const cached = getCached(key);
    if (cached !== undefined) return cached;

    // If DB not ready, return fallback
    if (!isConnected()) return fallback;

    // Async read — returns a Promise that resolves to the value.
    // bot.js uses getChat/setChat which are sync-ish wrappers around this,
    // BUT since group settings are read on every message we keep a warm cache.
    // The first read after startup will be async, subsequent reads hit cache.
    return Store.findOne({ key }).lean().then(doc => {
        const val = doc ? doc.value : fallback;
        setCache(key, val);
        return val;
    }).catch(() => fallback);
}

/**
 * Set a value by key. Writes to MongoDB and updates RAM cache.
 * @param {string} key
 * @param {*}      value
 */
function set(key, value) {
    setCache(key, value);

    if (!isConnected()) return;

    Store.findOneAndUpdate(
        { key },
        { $set: { value } },
        { upsert: true, new: true }
    ).catch(err => {
        console.error(`[store] set failed for key "${key}": ${err.message}`);
    });
}

/**
 * Delete a key from MongoDB and cache.
 * @param {string} key
 */
function del(key) {
    delCache(key);

    if (!isConnected()) return;

    Store.deleteOne({ key }).catch(err => {
        console.error(`[store] del failed for key "${key}": ${err.message}`);
    });
}

// ─── Convenience Wrappers ─────────────────────────────────────
// These mirror the original store.js API exactly so bot.js needs no changes.

/**
 * Get a chat-scoped setting.
 * e.g. getChat(chatId, 'antilink', false)
 */
function getChat(chatId, ns, fallback = {}) {
    const key    = `${ns}:${chatId}`;
    const cached = getCached(key);
    if (cached !== undefined) return cached;

    // Return fallback synchronously and warm cache in background
    if (isConnected()) {
        Store.findOne({ key }).lean().then(doc => {
            const val = doc ? doc.value : fallback;
            setCache(key, val);
        }).catch(() => {});
    }

    return fallback;
}

/**
 * Set a chat-scoped setting.
 */
function setChat(chatId, ns, value) {
    set(`${ns}:${chatId}`, value);
}

/**
 * Get a user-scoped setting within a chat.
 * e.g. getUser(chatId, userId, 'warns', { count: 0, reasons: [] })
 */
function getUser(chatId, userId, ns, fallback = {}) {
    const data = getChat(chatId, ns, {});
    return data[userId] !== undefined ? data[userId] : fallback;
}

/**
 * Set a user-scoped setting within a chat.
 */
function setUser(chatId, userId, ns, value) {
    const data       = getChat(chatId, ns, {});
    data[userId]     = value;
    setChat(chatId, ns, data);
}

// ─── Preload on startup ───────────────────────────────────────
// Called once after MongoDB connects to warm the RAM cache
// so the first group command doesn't hit the DB cold.

async function preload() {
    if (!isConnected()) return;
    try {
        const docs = await Store.find({}).lean();
        docs.forEach(doc => setCache(doc.key, doc.value));
        console.log(`[store] Preloaded ${docs.length} settings into RAM cache`);
    } catch (err) {
        console.error(`[store] Preload failed: ${err.message}`);
    }
}

// Auto-preload when Mongoose connects
mongoose.connection.once('open', () => {
    preload().catch(() => {});
});

// ─── Exports (same API as original store.js) ──────────────────
module.exports = { get, set, del, getChat, setChat, getUser, setUser, preload };
