/**
 * autoload.js - Auto Load All Paired Sessions
 * Adevos Min-Bot
 *
 * Changes from previous version:
 * - Removed: fs.readdir() on ./nexstore/pairing/
 * - Removed: filter by endsWith('@s.whatsapp.net')
 * - Added:   getAllRegisteredSessions() from MongoDB
 * - Kept:    Batch processing logic (unchanged)
 * - Kept:    Shutdown signal handling (unchanged)
 */

'use strict';

const chalk = require('chalk');
const { connectDB }               = require('./db');
const { getAllRegisteredSessions } = require('./sessionStore');

let isAutoLoadRunning = false;
let isShuttingDown    = false;

// ─── Shutdown Signal Handlers ─────────────────────────────────
process.on('message', (msg) => { if (msg === 'shutdown') { console.log(chalk.yellow('🛑 PM2 shutdown')); isShuttingDown = true; } });
process.on('SIGINT',  () => { isShuttingDown = true; });
process.on('SIGTERM', () => { isShuttingDown = true; });

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Process Single Session ───────────────────────────────────

/**
 * Connect one session by its sessionId.
 * Clears the require cache before each call to avoid stale closures.
 * @param {string} sessionId
 * @param {number} index
 * @param {number} total
 */
async function processUser(sessionId, index, total) {
    if (isShuttingDown) throw new Error('Shutdown in progress');

    console.log(chalk.blue(`⌛ Connecting ${index + 1}/${total}: ${sessionId}`));

    try {
        delete require.cache[require.resolve('./pair')];
        const startpairing = require('./pair');
        await startpairing(sessionId);
        console.log(chalk.green(`✅ Connected: ${sessionId}`));
        return sessionId;
    } catch (err) {
        console.log(chalk.red(`❌ Failed [${sessionId}]: ${err.message}`));
        delete require.cache[require.resolve('./pair')];
        throw err;
    }
}

// ─── Batch Processing ─────────────────────────────────────────

/**
 * Process an array of sessionIds in batches.
 * Each batch runs concurrently; batches are separated by a short delay.
 * @param {string[]} sessions
 * @param {number}   batchSize
 */
async function processBatch(sessions, batchSize = 10) {
    const results = [];

    for (let i = 0; i < sessions.length; i += batchSize) {
        if (isShuttingDown) {
            console.log(chalk.yellow('⏹️ Batch stopped — shutdown signal received'));
            break;
        }

        const batch      = sessions.slice(i, i + batchSize);
        const batchNum   = Math.floor(i / batchSize) + 1;
        const totalBatch = Math.ceil(sessions.length / batchSize);

        console.log(chalk.cyan(`🔄 Batch ${batchNum}/${totalBatch} — ${batch.length} sessions`));

        const batchResults = await Promise.allSettled(
            batch.map((sid, idx) =>
                processUser(sid, i + idx, sessions.length)
                    .catch(err => ({ sessionId: sid, error: err.message }))
            )
        );

        results.push(...batchResults);

        if (i + batchSize < sessions.length && !isShuttingDown) {
            console.log(chalk.gray('⏳ Waiting 2s before next batch...'));
            await delay(2000);
        }
    }

    return results;
}

function countSuccessful(results) {
    return results.filter(r => r.status === 'fulfilled' && typeof r.value === 'string').length;
}

// ─── Main Export ──────────────────────────────────────────────

module.exports = {
    /**
     * autoLoadPairs
     * Reads all registered sessions from MongoDB and connects them.
     * Called on bot startup or manually via /autoload Telegram command.
     *
     * @param {object}  options
     * @param {boolean} options.concurrent - Connect all at once (not recommended for 100+)
     * @param {number}  options.batchSize  - Sessions per batch, default 10
     */
    autoLoadPairs: async (options = {}) => {
        if (isShuttingDown)    return { success: false, message: 'Shutdown in progress' };
        if (isAutoLoadRunning) { console.log(chalk.yellow('⚠️ Auto-load already running')); return { success: false, message: 'Already running' }; }

        isAutoLoadRunning = true;
        console.log(chalk.yellow('🔄 Auto-loading sessions from MongoDB...'));

        try {
            await connectDB();

            // Read session list from MongoDB instead of disk
            const sessions = await getAllRegisteredSessions();

            if (sessions.length === 0) {
                console.log(chalk.yellow('ℹ️ No registered sessions found'));
                return { success: true, message: 'No sessions to load', total: 0, successful: 0 };
            }

            console.log(chalk.green(`✅ Found ${sessions.length} sessions — loading...`));

            const startTime = Date.now();
            let results;

            if (options.concurrent === true) {
                // All at once — fast but memory-intensive
                results = await Promise.allSettled(
                    sessions.map((s, i) =>
                        processUser(s, i, sessions.length).catch(err => ({ sessionId: s, error: err.message }))
                    )
                );
            } else {
                // Batched — safer for large numbers of sessions
                results = await processBatch(sessions, options.batchSize || 10);
            }

            const duration   = ((Date.now() - startTime) / 1000).toFixed(2);
            const successful = countSuccessful(results);
            const failed     = sessions.length - successful;

            console.log(chalk.green(`🎉 Auto-load complete in ${duration}s`));
            console.log(chalk.cyan(`📊 Success: ${successful} | Failed: ${failed} | Total: ${sessions.length}`));

            return { success: true, total: sessions.length, successful, failed, duration };

        } catch (err) {
            console.error(chalk.red(`❌ Auto-load error: ${err.message}`));
            return { success: false, message: err.message, total: 0, successful: 0 };
        } finally {
            isAutoLoadRunning = false;
        }
    },

    isRunning:      () => isAutoLoadRunning,
    isShuttingDown: () => isShuttingDown
};
