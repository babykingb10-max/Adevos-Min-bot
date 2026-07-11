/**
 * sessionStore.js - MongoDB Session Store
 * Adevos Min-Bot
 *
 * Replaces useMultiFileAuthState() from Baileys with a MongoDB-backed
 * equivalent. All WhatsApp session data (creds + signal keys) is stored
 * in the sessions collection instead of disk files.
 *
 * Also handles pairing code persistence and retrieval.
 */

'use strict';

const chalk = require('chalk');
const { Session } = require('./db');

// initAuthCreds generates a fresh credential set for new sessions.
// Required by Baileys when no existing creds are found in the database.
let initAuthCreds;
try {
    initAuthCreds = require('@whiskeysockets/baileys').initAuthCreds;
} catch {
    // Fallback if not available — Baileys will handle it internally
    initAuthCreds = () => ({});
}
// ─── Buffer Serialization Helpers ────────────────────────────
// MongoDB stores Buffer objects as {type:'Buffer', data:[...]} plain objects.
// Baileys expects actual Buffer/Uint8Array instances.
// These helpers convert between the two formats.

/**
 * Recursively restore Buffer objects that MongoDB deserialized
 * as plain {type:'Buffer', data:[...]} objects.
 * Also handles nested objects and arrays.
 */
function fixBuffers(obj) {
    if (obj === null || obj === undefined) return obj;

    // Direct Buffer object serialized by MongoDB
    if (obj && obj.type === 'Buffer' && Array.isArray(obj.data)) {
        return Buffer.from(obj.data);
    }

    // Uint8Array-like: has numeric keys and a length
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        // Check if it looks like a serialized Uint8Array
        if (typeof obj.length === 'number' && obj[0] !== undefined) {
            try {
                return Buffer.from(Object.values(obj));
            } catch {}
        }

        // Recurse into plain objects
        const fixed = {};
        for (const [k, v] of Object.entries(obj)) {
            fixed[k] = fixBuffers(v);
        }
        return fixed;
    }

    if (Array.isArray(obj)) {
        return obj.map(fixBuffers);
    }

    return obj;
}

/**
 * Prepare a value for storage in MongoDB.
 * Converts Buffer/Uint8Array to plain objects that survive JSON round-trips.
 */
function serializeValue(val) {
    if (val === null || val === undefined) return val;

    if (Buffer.isBuffer(val)) {
        return { type: 'Buffer', data: Array.from(val) };
    }

    if (val instanceof Uint8Array) {
        return { type: 'Buffer', data: Array.from(val) };
    }

    if (Array.isArray(val)) {
        return val.map(serializeValue);
    }

    if (val && typeof val === 'object') {
        const result = {};
        for (const [k, v] of Object.entries(val)) {
            result[k] = serializeValue(v);
        }
        return result;
    }

    return val;
}



// ─── RAM Cache ────────────────────────────────────────────────
// Short-lived cache to reduce MongoDB reads for hot sessions.
// Each entry expires after CACHE_TTL_MS milliseconds.
const sessionCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Write Debounce ───────────────────────────────────────────
// keys.set is called for EVERY signal key change (pre-keys, sender-keys, etc.)
// This can mean hundreds of MongoDB writes per minute per session.
// We batch them: accumulate changes in memory for DEBOUNCE_MS,
// then write once to MongoDB instead of one write per key change.
const pendingKeyWrites = new Map(); // sessionId → { mergedKeys, timer }
const DEBOUNCE_MS = 3000;          // 3 second batch window (reduces Atlas connections ~90%)

function scheduleKeyWrite(sessionId, updatedKeys) {
    // Cancel previous pending write for this session
    const existing = pendingKeyWrites.get(sessionId);
    if (existing?.timer) clearTimeout(existing.timer);

    // Schedule a new write after DEBOUNCE_MS
    const timer = setTimeout(async () => {
        pendingKeyWrites.delete(sessionId);
        try {
            await saveSession(sessionId, { keys: updatedKeys });
        } catch (err) {
            console.error(chalk.red(`❌ Debounced keys write failed [${sessionId}]: ${err.message}`));
        }
    }, DEBOUNCE_MS);

    pendingKeyWrites.set(sessionId, { keys: updatedKeys, timer });
}

function getCached(sessionId) {
    const entry = sessionCache.get(sessionId);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        sessionCache.delete(sessionId);
        return null;
    }
    return entry.data;
}

function setCache(sessionId, data) {
    sessionCache.set(sessionId, { data, timestamp: Date.now() });
}

function clearCache(sessionId) {
    sessionCache.delete(sessionId);
}

// ─── Session CRUD ─────────────────────────────────────────────

/**
 * Read a session document from MongoDB.
 * Checks RAM cache first to avoid unnecessary DB reads.
 * @param {string} sessionId - e.g. "255712345678@s.whatsapp.net"
 */
async function getSession(sessionId) {
    const cached = getCached(sessionId);
    if (cached) return cached;

    try {
        const session = await Session.findOne({ sessionId }).lean();
        if (session) setCache(sessionId, session);
        return session;
    } catch (err) {
        console.error(chalk.red(`❌ getSession [${sessionId}]: ${err.message}`));
        return null;
    }
}

/**
 * Upsert a session document and refresh its TTL.
 * @param {string} sessionId
 * @param {object} data - Partial session fields to update
 */
async function saveSession(sessionId, data) {
    try {
        const update = {
            ...data,
            lastSeen:  new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // extend TTL
        };

        await Session.findOneAndUpdate(
            { sessionId },
            { $set: update },
            { upsert: true, new: true }
        );

        const existing = getCached(sessionId) || {};
        setCache(sessionId, { ...existing, ...update, sessionId });

    } catch (err) {
        console.error(chalk.red(`❌ saveSession [${sessionId}]: ${err.message}`));
        throw err;
    }
}

/**
 * Permanently delete a session from MongoDB and the cache.
 * Called when a user logs out or an admin deletes the session.
 * @param {string} sessionId
 */
async function deleteSession(sessionId) {
    try {
        await Session.deleteOne({ sessionId });
        clearCache(sessionId);
        console.log(chalk.yellow(`🗑️ Session deleted: ${sessionId}`));
    } catch (err) {
        console.error(chalk.red(`❌ deleteSession [${sessionId}]: ${err.message}`));
        throw err;
    }
}

/**
 * Check whether a session exists in MongoDB.
 * @param {string} sessionId
 * @returns {boolean}
 */
async function sessionExists(sessionId) {
    if (getCached(sessionId)) return true;
    try {
        return (await Session.countDocuments({ sessionId })) > 0;
    } catch {
        return false;
    }
}

/**
 * Return all sessionIds that have completed pairing.
 * Used by autoload.js on startup.
 * @returns {string[]}
 */
async function getAllRegisteredSessions() {
    try {
        const sessions = await Session.find(
            { isRegistered: true },
            { sessionId: 1, _id: 0 }
        ).lean();
        return sessions.map(s => s.sessionId);
    } catch (err) {
        console.error(chalk.red(`❌ getAllRegisteredSessions: ${err.message}`));
        return [];
    }
}

/**
 * Mark a session as active or inactive.
 * Also refreshes the TTL so active sessions are never auto-deleted.
 * @param {string} sessionId
 * @param {boolean} isActive
 */
async function setSessionActive(sessionId, isActive) {
    try {
        await Session.findOneAndUpdate(
            { sessionId },
            {
                $set: {
                    isActive,
                    lastSeen:  new Date(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            }
        );

        const cached = getCached(sessionId);
        if (cached) setCache(sessionId, { ...cached, isActive, lastSeen: new Date() });

    } catch (err) {
        console.error(chalk.red(`❌ setSessionActive [${sessionId}]: ${err.message}`));
    }
}

// ─── Baileys Auth State ───────────────────────────────────────

/**
 * useMongoAuthState
 *
 * Drop-in replacement for Baileys' useMultiFileAuthState().
 * Returns the same { state, saveCreds } interface but persists
 * everything to MongoDB instead of the filesystem.
 *
 * @param {string} sessionId - WhatsApp JID e.g. "255712345678@s.whatsapp.net"
 * @returns {{ state: object, saveCreds: Function }}
 */
async function useMongoAuthState(sessionId) {
    const sessionDoc = await getSession(sessionId);

    const state = {
        creds: sessionDoc?.creds ? fixBuffers(sessionDoc.creds) : initAuthCreds(),
        keys: {
            /**
             * Retrieve signal keys of a given type for a list of IDs.
             * Called frequently by Baileys during message encryption.
             */
            get: async (type, ids) => {
                try {
                    const doc     = await getSession(sessionId);
                    const keyData = doc?.keys?.[type] || {};
                    const result  = {};

                    for (const id of ids) {
                        const val = keyData[id];
                        if (val !== undefined && val !== null) {
                            // Restore Buffer objects that MongoDB serialized
                            // as {type:'Buffer', data:[...]} plain objects
                            result[id] = fixBuffers(val);
                        }
                    }
                    return result;
                } catch (err) {
                    console.error(chalk.red(`❌ keys.get: ${err.message}`));
                    return {};
                }
            },

            /**
             * Persist new or updated signal keys to MongoDB.
             * Null values indicate key deletion.
             */
            set: async (data) => {
                try {
                    // Merge into existing cached keys first (avoids a DB read per call)
                    const doc         = getCached(sessionId);
                    const updatedKeys = { ...(doc?.keys || {}) };

                    for (const [type, typeData] of Object.entries(data)) {
                        if (!updatedKeys[type]) updatedKeys[type] = {};

                        for (const [id, value] of Object.entries(typeData)) {
                            if (value !== null && value !== undefined) {
                                updatedKeys[type][id] = serializeValue(value);
                            } else {
                                delete updatedKeys[type][id];
                            }
                        }

                        if (Object.keys(updatedKeys[type]).length === 0) {
                            delete updatedKeys[type];
                        }
                    }

                    // Update cache immediately so subsequent reads see new keys
                    const cached = getCached(sessionId) || {};
                    setCache(sessionId, { ...cached, keys: updatedKeys });

                    // Debounce the MongoDB write — batch rapid key changes
                    // into one write per 2 seconds instead of one per key change.
                    // This reduces MongoDB connections by ~90% during active sessions.
                    scheduleKeyWrite(sessionId, updatedKeys);

                } catch (err) {
                    console.error(chalk.red(`❌ keys.set: ${err.message}`));
                }
            }
        }
    };

    /**
     * saveCreds
     * Called by Baileys whenever credentials change (e.g. after pairing).
     * Persists the updated creds object to MongoDB.
     */
    // Debounced creds write — batch rapid credential updates
    // into one MongoDB write per 3 seconds instead of one per update.
    let _credsWriteTimer = null;

    const saveCreds = async () => {
        try {
            // Update cache immediately so subsequent reads see new creds
            const cached = getCached(sessionId) || {};
            setCache(sessionId, {
                ...cached,
                creds:        state.creds,
                isRegistered: !!(state.creds?.registered),
                isActive:     true
            });

            // Debounce the MongoDB write
            if (_credsWriteTimer) clearTimeout(_credsWriteTimer);
            _credsWriteTimer = setTimeout(async () => {
                _credsWriteTimer = null;
                try {
                    const serializedCreds = serializeValue(state.creds);
                    await saveSession(sessionId, {
                        creds:        serializedCreds,
                        isRegistered: !!(state.creds?.registered),
                        isActive:     true
                    });
                } catch (err) {
                    console.error(chalk.red(`❌ saveCreds write [${sessionId}]: ${err.message}`));
                }
            }, 3000); // 3 second batch window for creds

        } catch (err) {
            console.error(chalk.red(`❌ saveCreds [${sessionId}]: ${err.message}`));
        }
    };

    return { state, saveCreds };
}

// ─── Pairing Code Helpers ─────────────────────────────────────

/**
 * Save a generated pairing code to MongoDB.
 * Also creates or updates the user record.
 * @param {string} number - Clean number "255712345678"
 * @param {string} code   - e.g. "ABCD-1234"
 * @param {string} source - "telegram" | "website"
 */
async function savePairingCode(number, code, source = 'website') {
    const { Pairing, User } = require('./db');

    try {
        await Pairing.findOneAndUpdate(
            { number },
            {
                $set: {
                    code,
                    status:    'ready',
                    source,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
                }
            },
            { upsert: true, new: true }
        );

        await User.findOneAndUpdate(
            { number },
            {
                $set: {
                    lastPaired:  new Date(),
                    source,
                    lastServer:  process.env.SERVER_NAME || 'Main Server'
                },
                $inc: { totalPairings: 1 }
            },
            { upsert: true }
        );

        console.log(chalk.green(`✅ Pairing code saved: ${number} → ${code}`));
    } catch (err) {
        console.error(chalk.red(`❌ savePairingCode: ${err.message}`));
        throw err;
    }
}

/**
 * Retrieve a pairing code document from MongoDB.
 * @param {string} number
 * @returns {object|null}
 */
async function getPairingCode(number) {
    const { Pairing } = require('./db');
    try {
        return await Pairing.findOne({ number }).lean();
    } catch (err) {
        console.error(chalk.red(`❌ getPairingCode: ${err.message}`));
        return null;
    }
}

/**
 * Remove a pairing code after it has been used.
 * @param {string} number
 */
async function deletePairingCode(number) {
    const { Pairing } = require('./db');
    try {
        await Pairing.deleteOne({ number });
    } catch (err) {
        console.error(chalk.red(`❌ deletePairingCode: ${err.message}`));
    }
}

// ─── Debug Helpers ────────────────────────────────────────────
function getCacheStats() {
    return { size: sessionCache.size, keys: [...sessionCache.keys()] };
}

// ─── Exports ──────────────────────────────────────────────────
module.exports = {
    useMongoAuthState,
    getSession,
    saveSession,
    deleteSession,
    sessionExists,
    getAllRegisteredSessions,
    setSessionActive,
    savePairingCode,
    getPairingCode,
    deletePairingCode,
    getCacheStats,
    clearCache
};
