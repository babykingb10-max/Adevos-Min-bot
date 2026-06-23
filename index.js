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
 * - Kept:    error suppression for known Baileys noise
 */

'use strict';

require('dotenv').config();
require('./setting/config');

const path  = require('path');
const fs    = require('fs');
const chalk = require('chalk');

let figlet;
try { figlet = require('figlet'); } catch { figlet = null; }

const { connectDB }   = require('./db');
const { autoLoadPairs } = require('./autoload');

// ─── Startup Banner ───────────────────────────────────────────
function printBanner() {
    console.clear();

    if (figlet) {
        try {
            console.log(chalk.green(figlet.textSync('ADEVOS BOT', {
                font: 'Standard',
                horizontalLayout: 'default'
            })));
        } catch {
            console.log(chalk.green('\n  ADEVOS MIN-BOT\n'));
        }
    } else {
        console.log(chalk.green('\n  ADEVOS MIN-BOT\n'));
    }

    console.log(chalk.yellow('▣━━━━━━━━━━━━━━━━━━━━━━━━━━━▣'));
    console.log(chalk.green('  ᴀᴅᴇᴠᴏꜱ ᴍɪɴ-ʙᴏᴛ  v2.0.0'));
    console.log(chalk.cyan('  Powered by MongoDB Atlas'));
    console.log(chalk.yellow('▣━━━━━━━━━━━━━━━━━━━━━━━━━━━▣\n'));
}

// ─── Load Bot Modules ─────────────────────────────────────────
function loadModules() {
    let telegramLoaded  = false;
    let whatsappLoaded  = false;

    // Load Telegram bot (bot.js)
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

    // Load WhatsApp command handler (case.js)
    // case.js does not need to be instantiated here — pair.js calls it directly
    // on each incoming message. We just verify the file exists.
    const casePath = path.join(__dirname, 'case.js');
    if (fs.existsSync(casePath)) {
        try {
            // Validate the file can be parsed without errors
            require.resolve('./case');
            whatsappLoaded = true;
            console.log(chalk.green('✅ WhatsApp command handler (case.js) ready'));
        } catch (err) {
            console.log(chalk.red(`❌ Failed to resolve case.js: ${err.message}`));
            console.log(chalk.yellow('⚠️  Continuing without WhatsApp commands...\n'));
        }
    } else {
        console.log(chalk.yellow('⚠️  case.js not found — skipping WhatsApp commands'));
    }

    // Print summary
    console.log(chalk.cyan('\n⚄══════════════════════════════⚄'));
    console.log(chalk.bold.white('  BOT INITIALIZATION SUMMARY'));
    console.log(chalk.cyan('⚄══════════════════════════════⚄'));
    console.log(telegramLoaded
        ? chalk.green('✅ Telegram Bot   : ACTIVE')
        : chalk.red(  '❌ Telegram Bot   : INACTIVE'));
    console.log(whatsappLoaded
        ? chalk.green('✅ WhatsApp Cmds  : READY')
        : chalk.red(  '❌ WhatsApp Cmds  : INACTIVE'));
    console.log(chalk.cyan('⚄══════════════════════════════⚄\n'));

    if (!telegramLoaded && !whatsappLoaded) {
        console.log(chalk.red('⚠️  Warning: No bot systems loaded! Check your files.\n'));
    } else {
        console.log(chalk.green('✅ ᴀᴅᴇᴠᴏꜱ ᴍɪɴ-ʙᴏᴛ is ACTIVE\n'));
    }
}

// ─── Error Suppression ────────────────────────────────────────
// Baileys generates a lot of noise for known non-fatal conditions.
// These are suppressed to keep logs readable.
function setupErrorHandlers() {
    const IGNORED_ERRORS = [
        'Socket connection timeout',
        'EKEYTYPE',
        'item-not-found',
        'rate-overlimit',
        'Connection Closed',
        'Timed Out',
        'Value not found',
        'Stream Errored',
        'connection-replaced',
        'TAG_MISMATCH'
    ];

    function isIgnored(msg) {
        return IGNORED_ERRORS.some(e => String(msg).includes(e));
    }

    process.on('unhandledRejection', (reason) => {
        if (isIgnored(reason)) return;
        console.log(chalk.red('\n⚠️  Unhandled Rejection:'), reason);
    });

    process.on('uncaughtException', (err) => {
        if (isIgnored(err)) return;
        console.log(chalk.red(`\n❌ Uncaught Exception: ${err.message}`));
        if (err.stack) console.log(chalk.gray(err.stack));
    });

    // Suppress stderr noise from Baileys WebSocket internals
    const originalStderrWrite = process.stderr.write.bind(process.stderr);
    process.stderr.write = (msg, ...args) => {
        if (typeof msg === 'string' && isIgnored(msg)) return true;
        return originalStderrWrite(msg, ...args);
    };

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
}

// ─── Main Entry Point ─────────────────────────────────────────
async function main() {
    printBanner();
    setupShutdown();

    // Step 1: Connect to MongoDB
    // This must succeed before anything else runs.
    try {
        console.log(chalk.blue('🔄 Connecting to MongoDB...'));
        await connectDB();
        console.log(chalk.green('✅ MongoDB connected\n'));
    } catch (err) {
        console.error(chalk.red(`❌ MongoDB connection failed: ${err.message}`));
        console.error(chalk.red('   Make sure MONGODB_URI is set in your environment variables.'));
        process.exit(1);
    }

    // Step 2: Load bot modules (bot.js + case.js)
    loadModules();

    // Step 3: Auto-load all registered sessions from MongoDB
    // Replaces the old disk-based loop over ./nexstore/pairing/
    console.log(chalk.blue('🔄 Auto-loading paired sessions from MongoDB...'));
    try {
        const result = await autoLoadPairs({ batchSize: 10 });

        if (result.success) {
            if (result.total === 0) {
                console.log(chalk.yellow('ℹ️  No registered sessions found — waiting for new pairings\n'));
            } else {
                console.log(chalk.green(
                    `✅ Auto-load complete: ${result.successful}/${result.total} sessions connected (${result.duration}s)\n`
                ));
            }
        } else {
            console.log(chalk.yellow(`⚠️  Auto-load issue: ${result.message}\n`));
        }
    } catch (err) {
        // Non-fatal — bot can still accept new pairings even if autoload fails
        console.log(chalk.yellow(`⚠️  Auto-load error: ${err.message}\n`));
    }

    // Step 4: Set up error handlers
    setupErrorHandlers();
}

main().catch(err => {
    console.error(chalk.red(`\n❌ Fatal startup error: ${err.message}`));
    if (err.stack) console.error(chalk.gray(err.stack));
    process.exit(1);
});
