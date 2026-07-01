/**
 * index.js - Bot Entry Point
 * Adevos Min-Bot
 *
 * Changes from previous version:
 * - Removed: disk-based PAIRING_DIR (./nexstore/pairing/)
 * - Removed: fs.readdirSync() for loading paired users
 * - Removed: startupPassword from nexstore/token.js
 * - Removed: auth.json disk authentication
 * - Removed: readline password prompt (not usable on Render)
 * - Added:   connectDB() from db.js on startup
 * - Added:   autoLoadPairs() from MongoDB via autoload.js
 * - Kept:    figlet banner
 * - Kept:    bot.js + case.js loading
 * - Kept:    graceful shutdown handlers
 * - Kept:    Full noise suppression from original index.js
 *            (signal keys, Buffer dumps, axios internals, etc.)
 */

'use strict';

require('dotenv').config();
require('./setting/config');

const path  = require('path');
const fs    = require('fs');
const chalk = require('chalk');

let figlet;
try { figlet = require('figlet'); } catch { figlet = null; }

const { connectDB }     = require('./db');
const { autoLoadPairs } = require('./autoload');

// ─── Startup Banner ───────────────────────────────────────────
function printBanner() {
    console.clear();
    if (figlet) {
        try {
            console.log(chalk.green(figlet.textSync('ADEVOS BOT', { font: 'Standard' })));
        } catch {
            console.log(chalk.green('\n  ADEVOS MIN-BOT\n'));
        }
    } else {
        console.log(chalk.green('\n  ADEVOS MIN-BOT\n'));
    }
    console.log(chalk.cyan('╭─────────────────────────────────╮'));
    console.log(chalk.cyan('│') + chalk.bold.white('   Adevos Min-Bot  v2.0.0        ') + chalk.cyan('│'));
    console.log(chalk.cyan('│') + chalk.gray('   Powered by MongoDB Atlas      ') + chalk.cyan('│'));
    console.log(chalk.cyan('╰─────────────────────────────────╯'));
    console.log('');
}

// ─── Load Bot Modules ─────────────────────────────────────────
function loadModules() {
    let telegramLoaded  = false;
    let whatsappLoaded  = false;

    const botPath = path.join(__dirname, 'bot.js');
    if (fs.existsSync(botPath)) {
        try {
            console.log(chalk.blue('📱 Loading Telegram bot (bot.js)...'));
            require('./bot');
            telegramLoaded = true;
            console.log(chalk.green('✅ Telegram bot loaded'));
        } catch (err) {
            console.log(chalk.red(`❌ Failed to load bot.js: ${err.message}`));
            console.log(chalk.yellow('⚠️  Continuing without Telegram bot...\n'));
        }
    } else {
        console.log(chalk.yellow('⚠️  bot.js not found — skipping Telegram bot'));
    }

    const casePath = path.join(__dirname, 'case.js');
    if (fs.existsSync(casePath)) {
        try {
            require.resolve('./case');
            whatsappLoaded = true;
            console.log(chalk.green('✅ WhatsApp command handler (case.js) ready'));
        } catch (err) {
            console.log(chalk.red(`❌ Failed to resolve case.js: ${err.message}`));
        }
    } else {
        console.log(chalk.yellow('⚠️  case.js not found — skipping WhatsApp commands'));
    }

    console.log(chalk.cyan('\n⚄══════════════════════════════⚄'));
    console.log(chalk.bold.white('  BOT INITIALIZATION SUMMARY'));
    console.log(chalk.cyan('⚄══════════════════════════════⚄'));
    console.log(telegramLoaded ? chalk.green('✅ Telegram Bot   : ACTIVE')   : chalk.red('❌ Telegram Bot   : INACTIVE'));
    console.log(whatsappLoaded ? chalk.green('✅ WhatsApp Cmds  : READY')    : chalk.red('❌ WhatsApp Cmds  : INACTIVE'));
    console.log(chalk.cyan('⚄══════════════════════════════⚄\n'));

    if (!telegramLoaded && !whatsappLoaded) {
        console.log(chalk.red('⚠️  Warning: No bot systems loaded!\n'));
    } else {
        console.log(chalk.green('✅ ᴀᴅᴇᴠᴏꜱ ᴍɪɴ-ʙᴏᴛ is ACTIVE\n'));
    }
}

// ─── Noise Suppression ────────────────────────────────────────
// Suppress Baileys crypto/signal noise and axios internals.
// Only real errors and command activity should appear in logs.
function setupErrorHandlers() {
    const IGNORED_PATTERNS = [
        // Baileys WebSocket & connection noise
        'Socket connection timeout',
        'EKEYTYPE',
        'item-not-found',
        'rate-overlimit',
        'Connection Closed',
        'Timed Out',
        'Value not found',
        'Stream Errored',
        'connection-replaced',
        'TAG_MISMATCH',

        // Baileys signal/crypto session data
        'Closing open session',
        'Closing session',
        'SessionEntry',
        '_chains',
        'chainKey',
        'chainType',
        'messageKeys',
        'registrationId',
        'ephemeralKeyPair',
        'pubKey',
        'privKey',
        'lastRemoteEphemeralKey',
        'previousCounter',
        'rootKey',
        'indexInfo',
        'baseKey',
        'baseKeyType',
        'remoteIdentityKey',
        'pendingPreKey',
        'signedKeyId',
        'preKeyId',
        '<Buffer',
        'Buffer 0',
        'chainKey: [Object]',
        'messageKeys: {',
        'session in favor',
        'open session in favor',
        'BQ',

        // Axios internal objects
        'content-length',
        'x-github-request-id',
        'config: [Object',
        'transitional:',
        'transformRequest',
        'transformResponse',
        'xsrfCookieName',
        'maxContentLength',
        'maxBodyLength',
        'validateStatus',
        'AxiosHeaders',
        'ClientRequest',
        '_events:',
        '_eventsCount',
        '_maxListeners',
        'outputData',
        'outputSize',

        // Chat history sync noise
        'Loading Chat [',
        'shouldSyncHistoryMessage',
    ];

    const shouldIgnore = (msg) => {
        const str = String(msg || '');
        return IGNORED_PATTERNS.some(p => str.includes(p));
    };

    // Override console.log — only suppress noise, pass everything else
    const _log = console.log.bind(console);
    console.log = (...args) => {
        if (args.some(a => shouldIgnore(a))) return;
        _log(...args);
    };

    // Override console.warn
    const _warn = console.warn.bind(console);
    console.warn = (...args) => {
        if (args.some(a => shouldIgnore(a))) return;
        _warn(...args);
    };

    // Override console.error — suppress noise but keep real errors
    const _err = console.error.bind(console);
    console.error = (message, ...rest) => {
        if (shouldIgnore(message)) return;
        _err(message, ...rest);
    };

    // Override process.stdout.write — Baileys writes directly to stdout
    const _stdout = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk, encoding, callback) => {
        const str = typeof chunk === 'string' ? chunk : chunk?.toString?.() || '';
        if (shouldIgnore(str)) {
            if (typeof callback === 'function') callback();
            return true;
        }
        return _stdout(chunk, encoding, callback);
    };

    // Override process.stderr.write
    const _stderr = process.stderr.write.bind(process.stderr);
    process.stderr.write = (chunk, encoding, callback) => {
        const str = typeof chunk === 'string' ? chunk : chunk?.toString?.() || '';
        if (shouldIgnore(str)) {
            if (typeof callback === 'function') callback();
            return true;
        }
        return _stderr(chunk, encoding, callback);
    };

    process.on('unhandledRejection', (reason) => {
        if (shouldIgnore(reason)) return;
        console.log(chalk.red('\n⚠️  Unhandled Rejection:'), reason);
    });

    process.on('uncaughtException', (err) => {
        if (shouldIgnore(err?.message)) return;
        console.log(chalk.red(`\n❌ Uncaught Exception: ${err.message}`));
        if (err.stack) console.log(chalk.gray(err.stack));
    });

    console.log(chalk.blue('📊 Bot monitoring active'));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
}

// ─── Graceful Shutdown ────────────────────────────────────────
function setupShutdown() {
    process.on('SIGINT', () => {
        console.log(chalk.yellow('\n⚠️  Shutting down gracefully...'));
        console.log(chalk.green('👋 Goodbye!'));
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        console.log(chalk.yellow('\n⚠️  Received SIGTERM...'));
        process.exit(0);
    });
    process.on('message', (msg) => {
        if (msg === 'shutdown') {
            console.log(chalk.yellow('\n⚠️  PM2 shutdown signal...'));
            process.exit(0);
        }
    });
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
    printBanner();
    setupShutdown();

    // Step 1: Connect MongoDB (must succeed before anything else)
    try {
        console.log(chalk.blue('🔄 Connecting to MongoDB...'));
        await connectDB();
        console.log(chalk.green('✅ MongoDB connected\n'));
    } catch (err) {
        console.error(chalk.red(`❌ MongoDB connection failed: ${err.message}`));
        console.error(chalk.red('   Check that MONGODB_URI is set in environment variables.'));
        process.exit(1);
    }

    // Step 2: Load bot modules
    loadModules();

    // Step 3: Auto-load all registered sessions from MongoDB
    console.log(chalk.blue('🔄 Auto-loading paired sessions from MongoDB...'));
    try {
        const result = await autoLoadPairs({ batchSize: 10 });
        if (result.success) {
            if (result.total === 0) {
                console.log(chalk.yellow('ℹ️  No registered sessions — waiting for new pairings\n'));
            } else {
                console.log(chalk.green(
                    `✅ Auto-load complete: ${result.successful}/${result.total} sessions (${result.duration}s)\n`
                ));
            }
        } else {
            console.log(chalk.yellow(`⚠️  Auto-load issue: ${result.message}\n`));
        }
    } catch (err) {
        console.log(chalk.yellow(`⚠️  Auto-load error: ${err.message}\n`));
    }

    // Step 4: Setup noise suppression AFTER modules load
    // (so module loading errors are still visible)
    setupErrorHandlers();
}

main().catch(err => {
    console.error(chalk.red(`\n❌ Fatal startup error: ${err.message}`));
    if (err.stack) console.error(chalk.gray(err.stack));
    process.exit(1);
});
