/**
 * bot.js - Telegram Bot Manager
 * Adevos Min-Bot
 *
 * Changes from previous version:
 * - Removed: Firebase integration
 * - Removed: BOT_TOKEN hardcoded in token.js
 * - Removed: Server 1-5 system
 * - Removed: pairing.json disk read
 * - Removed: admin.json disk read
 * - Added:   MongoDB for all data
 * - Added:   BOT_TOKEN from process.env
 * - Added:   ADMIN_IDS from process.env (comma-separated)
 * - Added:   /clean command (delete dead sessions)
 * - Added:   /stats command (session statistics)
 * - Kept:    All Telegram commands (pair, delpair, listpair, etc.)
 * - Kept:    Music/download commands (play, video, lyrics, etc.)
 * - Kept:    Group management commands (promote, kick, ban, etc.)
 */

'use strict';

require('dotenv').config();
require('./setting/config');

const TelegramBot = require('node-telegram-bot-api');
const chalk       = require('chalk');
const path        = require('path');
const fs          = require('fs').promises;
const axios       = require('axios');

const {
    connectDB,
    cleanInactiveSessions,
    cleanLoggedOutSessions,
    getSessionStats,
    Blocked
} = require('./db');

const {
    getPairingCode,
    getAllRegisteredSessions,
    sessionExists,
    deleteSession
} = require('./sessionStore');

const { autoLoadPairs } = require('./autoload');

// ─── Config from Environment ──────────────────────────────────
const BOT_TOKEN   = process.env.BOT_TOKEN;
const ADMIN_IDS   = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const SERVER_NAME = process.env.SERVER_NAME  || 'Main Server';
const MAX_CONN    = parseInt(process.env.MAX_CONNECTIONS || '100');

if (!BOT_TOKEN) {
    console.error(chalk.red('❌ BOT_TOKEN is not set in environment variables'));
    process.exit(1);
}

// ─── Bot Instance ─────────────────────────────────────────────
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ─── Social Links ─────────────────────────────────────────────
const LINKS = {
    channel:   'https://t.me/adevosXch1',
    channel2:  'https://t.me/adevos_xtech_official2',
    channel3:  'https://t.me/adevosx_official_backup',
    channel4:  'https://t.me/adevosbackupchannel',
    group:     'https://t.me/adevosxtech',
    group2:    'https://t.me/adevosXtech2',
    developer: 'https://t.me/Adevos_X'
};

// Required channels for membership gate
const REQUIRED_CHANNELS = ['@adevosXch1', '@adevos_xtech_official2', '@adevosx_official_backup', '@adevosbackupchannel'];
const REQUIRED_GROUP    = '@adevosxtech';

// ─── User Tracking (RAM) ──────────────────────────────────────
// Lightweight in-memory set - used for /cast broadcast only
const trackedUsers = new Set();

// ─── Helpers ──────────────────────────────────────────────────

function isAdmin(userId) {
    return ADMIN_IDS.includes(userId.toString());
}

function runtime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

async function checkMembership(userId) {
    try {
        const groupMember   = await bot.getChatMember(REQUIRED_GROUP, userId).catch(() => null);
        const channelChecks = await Promise.all(
            REQUIRED_CHANNELS.map(ch => bot.getChatMember(ch, userId).catch(() => null))
        );
        const valid       = ['member', 'administrator', 'creator'];
        const hasGroup    = groupMember && valid.includes(groupMember.status);
        const hasChannels = channelChecks.every(m => m && valid.includes(m.status));
        return { hasGroup, hasChannels, hasAll: hasGroup && hasChannels };
    } catch {
        return { hasGroup: false, hasChannels: false, hasAll: false };
    }
}

function sendJoinPrompt(chatId) {
    return bot.sendMessage(chatId, 'Join all required channels and group to proceed:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📢 Channel 1', url: LINKS.channel  }, { text: '📢 Channel 2', url: LINKS.channel2 }],
                [{ text: '📢 Channel 3', url: LINKS.channel3 }, { text: '📢 Channel 4', url: LINKS.channel4 }],
                [{ text: '👥 Group',     url: LINKS.group    }],
                [{ text: '✅ Authorise', callback_data: 'check_membership' }]
            ]
        }
    });
}

function requireMembership(handler) {
    return async (msg, match) => {
        const userId = msg.from.id;
        trackedUsers.add(userId.toString());
        if (isAdmin(userId)) return handler(msg, match);
        const mem = await checkMembership(userId);
        if (!mem.hasAll) return sendJoinPrompt(msg.chat.id);
        return handler(msg, match);
    };
}

// ─── /start ───────────────────────────────────────────────────

bot.onText(/\/start/, async (msg) => {
    const chatId    = msg.chat.id;
    const userId    = msg.from.id;
    const firstName = msg.from.first_name || 'User';
    trackedUsers.add(userId.toString());

    const up = Math.floor(process.uptime());
    const d  = Math.floor(up / 86400), h = Math.floor((up % 86400) / 3600);
    const m  = Math.floor((up % 3600) / 60), s = up % 60;

    const caption =
`╭━───━⪨ Welcome ⪩━───━
┃❏ *Bot:* Adevos Min-Bot
┃❏ *Version:* V2
┃❏ *Dev:* Adevos
┃❏ *Name:* ${firstName}
┃❏ *User ID:* \`${userId}\`
┃❏ *Runtime:* ${d}d ${h}h ${m}m ${s}s
┃❏ *Server:* ${SERVER_NAME}
╰━───────────────────━`;

    await bot.sendPhoto(chatId, 'https://files.catbox.moe/4ag7es.jpg', {
        caption,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🟢 How to Pair', callback_data: 'how_to_pair' }, { text: '📋 Commands', callback_data: 'help_msg' }],
                [{ text: '📢 Channel', url: LINKS.channel }, { text: '👥 Group', url: LINKS.group }]
            ]
        }
    }).catch(() => bot.sendMessage(chatId, caption, { parse_mode: 'Markdown' }));
});

// ─── /pair ────────────────────────────────────────────────────

bot.onText(/^\/pair\s*$/, requireMembership((msg) => {
    bot.sendMessage(msg.chat.id, 'Enter your number:\n`/pair 255712345678`', { parse_mode: 'Markdown' });
}));

bot.onText(/\/pair (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const input  = match[1].trim().replace(/[^0-9]/g, '');

    if (!input || input.length < 7 || !/^\d{7,15}$/.test(input)) {
        return bot.sendMessage(chatId, '❌ Enter a valid number e.g. `255712345678`', { parse_mode: 'Markdown' });
    }
    if (input.startsWith('0')) {
        return bot.sendMessage(chatId, '❌ Number cannot start with 0');
    }

    // Check blocked
    const blocked = await Blocked.findOne({ number: input }).lean().catch(() => null);
    if (blocked) return bot.sendMessage(chatId, '⛔ This number is blocked. Contact admin.');

    // Check capacity
    const sessions = await getAllRegisteredSessions();
    if (sessions.length >= MAX_CONN) {
        return bot.sendMessage(chatId,
            `⚠️ Server is full (${sessions.length}/${MAX_CONN}). Contact owner.`,
            { reply_markup: { inline_keyboard: [[{ text: 'Owner', url: LINKS.developer }]] } }
        );
    }

    const sessionId = input + '@s.whatsapp.net';
    const statusMsg = await bot.sendMessage(chatId, '⏳ Generating pairing code...');

    try {
        const startpairing = require('./pair');
        await startpairing(sessionId);

        // Poll MongoDB for the code (max 30s)
        let code = null;
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const pairing = await getPairingCode(input);
            if (pairing?.code) { code = pairing.code; break; }
        }

        if (!code) {
            return bot.editMessageText('⏳ Timeout — code not received. Please try again.',
                { chat_id: chatId, message_id: statusMsg.message_id }
            );
        }

        // Add to owner.json for case.js compatibility
        await _addToOwnerJson(input);

        await bot.editMessageText(
`╭━───━⪨ Pairing Code ⪩━───━
┃
┃ ✅ Code generated!
┃ Number: \`${input}\`
┃ Code: \`${code}\`
┃
┃ Steps:
┃ 1. Open WhatsApp
┃ 2. Menu → Linked Devices
┃ 3. Link with phone number
┃ 4. Enter the code above ✅
╰━───────────────────━`,
            {
                chat_id:    chatId,
                message_id: statusMsg.message_id,
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [[{ text: '📢 Channel', url: LINKS.channel }]] }
            }
        );

    } catch (err) {
        console.error(chalk.red(`❌ Pair error: ${err.message}`));
        bot.editMessageText(`❌ Failed: ${err.message}`,
            { chat_id: chatId, message_id: statusMsg.message_id }
        );
    }
}));

// ─── /delpair ─────────────────────────────────────────────────

bot.onText(/^\/delpair\s*$/, requireMembership((msg) => {
    bot.sendMessage(msg.chat.id, 'Usage: `/delpair 255712345678`', { parse_mode: 'Markdown' });
}));

bot.onText(/\/delpair (.+)/, requireMembership(async (msg, match) => {
    const chatId    = msg.chat.id;
    const input     = match[1].trim().replace(/[^0-9]/g, '');
    const sessionId = input + '@s.whatsapp.net';

    if (!input || input.length < 7) return bot.sendMessage(chatId, '❌ Invalid number');

    try {
        const exists = await sessionExists(sessionId);
        if (!exists) return bot.sendMessage(chatId, `❌ \`${input}\` not found`, { parse_mode: 'Markdown' });

        await deleteSession(sessionId);
        bot.sendMessage(chatId, `✅ Session \`${input}\` deleted`, { parse_mode: 'Markdown' });
    } catch (err) {
        bot.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
}));

// ─── /listpair ────────────────────────────────────────────────

bot.onText(/\/listpair(.*)/, async (msg, match) => {
    const chatId  = msg.chat.id;
    if (!isAdmin(msg.from.id)) return bot.sendMessage(chatId, '❌ Admin only');

    const confirm = match[1]?.trim().toLowerCase();
    if (confirm !== 'confirm') return bot.sendMessage(chatId, 'Usage: `/listpair confirm`', { parse_mode: 'Markdown' });

    try {
        const sessions = await getAllRegisteredSessions();
        const stats    = await getSessionStats();
        if (sessions.length === 0) return bot.sendMessage(chatId, '📭 No paired sessions found');

        const list = sessions.map((s, i) => `┃ ${i + 1}. +${s.replace('@s.whatsapp.net', '')}`).join('\n');
        bot.sendMessage(chatId,
`╭━───━⪨ Sessions ⪩━───━
┃ Total: ${stats.total}
┃ Active: ${stats.active}
┃ Registered: ${stats.registered}
┃
${list}
╰━───────────────────━`,
            { parse_mode: 'Markdown' }
        );
    } catch (err) {
        bot.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
});

// ─── /clean ───────────────────────────────────────────────────

bot.onText(/\/clean$/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(msg.from.id)) return bot.sendMessage(chatId, '❌ Admin only');

    const statusMsg = await bot.sendMessage(chatId, '🧹 Cleaning dead sessions...');

    try {
        const [inactive, loggedOut] = await Promise.all([
            cleanInactiveSessions(7),
            cleanLoggedOutSessions()
        ]);
        const stats = await getSessionStats();

        await bot.editMessageText(
`╭━───━⪨ Cleanup Complete ⪩━───━
┃
┃ Inactive (7d+): ${inactive.deleted} deleted
┃ Logged out:     ${loggedOut.deleted} deleted
┃
┃ Remaining: ${stats.total}
┃ Active: ${stats.active}
╰━───────────────────━`,
            { chat_id: chatId, message_id: statusMsg.message_id }
        );
    } catch (err) {
        bot.sendMessage(chatId, `❌ Clean error: ${err.message}`);
    }
});

// ─── /stats ───────────────────────────────────────────────────

bot.onText(/\/stats$/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(msg.from.id)) return bot.sendMessage(chatId, '❌ Admin only');

    try {
        const stats = await getSessionStats();
        bot.sendMessage(chatId,
`╭━───━⪨ Server Stats ⪩━───━
┃
┃ 📦 Total Sessions:  ${stats.total}
┃ 🟢 Active:          ${stats.active}
┃ 🔴 Inactive:        ${stats.inactive}
┃ ✅ Registered:      ${stats.registered}
┃ 🖥️ Server:          ${SERVER_NAME}
┃ ⏱️ Uptime:          ${runtime(process.uptime())}
┃ 🔢 Max Capacity:    ${MAX_CONN}
╰━───────────────────━`,
            { parse_mode: 'Markdown' }
        );
    } catch (err) {
        bot.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
});

// ─── /autoload ────────────────────────────────────────────────

bot.onText(/\/autoload(.*)/, async (msg, match) => {
    const chatId  = msg.chat.id;
    if (!isAdmin(msg.from.id)) return bot.sendMessage(chatId, '❌ Admin only');

    const confirm = match[1]?.trim().toLowerCase();
    if (confirm !== 'confirm') return bot.sendMessage(chatId, 'Usage: `/autoload confirm`', { parse_mode: 'Markdown' });

    const statusMsg = await bot.sendMessage(chatId, '🔄 Starting autoload...');

    try {
        const result = await autoLoadPairs({ batchSize: 10 });
        await bot.editMessageText(
`╭━───━⪨ Autoload Done ⪩━───━
┃ Total:   ${result.total}
┃ Success: ${result.successful}
┃ Failed:  ${result.failed || 0}
┃ Time:    ${result.duration}s
╰━───────────────────━`,
            { chat_id: chatId, message_id: statusMsg.message_id }
        );
    } catch (err) {
        bot.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
});

// ─── /runtime ─────────────────────────────────────────────────

bot.onText(/\/runtime/, async (msg) => {
    const stats = await getSessionStats().catch(() => ({ total: 0, active: 0 }));
    bot.sendMessage(msg.chat.id,
`⏱️ *Runtime:* ${runtime(process.uptime())}
📦 *Sessions:* ${stats.total} total, ${stats.active} active
🖥️ *Server:* ${SERVER_NAME}`,
        { parse_mode: 'Markdown' }
    );
});

// ─── /help ────────────────────────────────────────────────────

bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    trackedUsers.add(msg.from.id.toString());

    bot.sendMessage(chatId,
`╭━───━⪨ Commands ⪩━───━
┃
┃ ❏ /pair <number>     — Pair WhatsApp
┃ ❏ /delpair <number>  — Remove session
┃ ❏ /play <song>       — Download audio
┃ ❏ /video <name>      — Download video
┃ ❏ /lyrics <song>     — Get lyrics
┃ ❏ /trending          — Trending music
┃ ❏ /gif <search>      — Search GIF
┃ ❏ /runtime           — Bot uptime
┃ ❏ /help              — This menu
┃
┃ Admin only:
┃ ❏ /listpair confirm  — List sessions
┃ ❏ /autoload confirm  — Reload sessions
┃ ❏ /clean             — Remove dead sessions
┃ ❏ /stats             — Session statistics
┃ ❏ /cast <message>    — Broadcast
╰━───────────────────━`,
        {
            parse_mode:   'Markdown',
            reply_markup: { inline_keyboard: [[{ text: '📢 Channel', url: LINKS.channel }, { text: '👥 Group', url: LINKS.group }]] }
        }
    );
});

// ─── /reportee ────────────────────────────────────────────────

bot.onText(/\/reportee (.+)/, requireMembership(async (msg, match) => {
    const chatId   = msg.chat.id;
    const userId   = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : 'no username';
    const report   = match[1].trim();

    for (const adminId of ADMIN_IDS) {
        try {
            await bot.sendMessage(adminId,
`╭━───━⪨ New Report ⪩━───━
┃ From: ${msg.from.first_name}
┃ Username: ${username}
┃ ID: ${userId}
┃
❏ ${report}
╰━───────────────────━`,
                { reply_markup: { inline_keyboard: [[{ text: 'Reply', callback_data: `reply_${userId}` }]] } }
            );
        } catch {}
    }
    bot.sendMessage(chatId, '✅ Report sent to admin. Thank you!');
}));

// ─── /cast ────────────────────────────────────────────────────

bot.onText(/\/cast (.+)/, async (msg, match) => {
    const chatId  = msg.chat.id;
    const message = match[1].trim();
    if (!isAdmin(msg.from.id)) return bot.sendMessage(chatId, '❌ Admin only');

    const users     = [...trackedUsers];
    let sent = 0, failed = 0;
    const statusMsg = await bot.sendMessage(chatId, `📣 Broadcasting to ${users.length} users...`);

    for (const userId of users) {
        try {
            await bot.sendMessage(userId,
`╭━━━⪨ Broadcast ⪩━━━
┃ From: Admin
┃
❏ ${message}
╰━━━━━━━━━━━━━━━━━━━`,
                { reply_markup: { inline_keyboard: [[{ text: '📢 Channel', url: LINKS.channel }]] } }
            );
            sent++;
        } catch {
            failed++;
            trackedUsers.delete(userId);
        }
        await new Promise(r => setTimeout(r, 100));
    }

    bot.editMessageText(`✅ Broadcast done: ${sent} sent, ${failed} failed`,
        { chat_id: chatId, message_id: statusMsg.message_id }
    );
});

// ─── Music Commands ───────────────────────────────────────────

bot.onText(/^\/play\s*$/,  requireMembership((msg) => bot.sendMessage(msg.chat.id, 'Usage: `/play Faded Alan Walker`', { parse_mode: 'Markdown' })));
bot.onText(/^\/video\s*$/, requireMembership((msg) => bot.sendMessage(msg.chat.id, 'Usage: `/video Faded Alan Walker`', { parse_mode: 'Markdown' })));
bot.onText(/^\/lyrics\s*$/,requireMembership((msg) => bot.sendMessage(msg.chat.id, 'Usage: `/lyrics Faded Alan Walker`', { parse_mode: 'Markdown' })));
bot.onText(/^\/gif\s*$/,   requireMembership((msg) => bot.sendMessage(msg.chat.id, 'Usage: `/gif funny cat`', { parse_mode: 'Markdown' })));

bot.onText(/\/play (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const query  = match[1].trim();
    const status = await bot.sendMessage(chatId, `🔍 Finding *${query}*...`, { parse_mode: 'Markdown' });

    try {
        const { data } = await axios.get(`https://apis.davidcyril.name.ng/play?query=${encodeURIComponent(query)}`);
        if (!data.status || !data.result) throw new Error('Song not found');

        const song = data.result;
        await bot.editMessageText(`⬇️ Downloading *${song.title}*...`, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' });

        const fileRes = await axios.get(song.download_url, { responseType: 'arraybuffer', timeout: 60000 });
        await bot.sendAudio(chatId, Buffer.from(fileRes.data), {
            title:     song.title,
            caption:   `🎵 *${song.title}*\n⏱ ${song.duration}`,
            parse_mode:'Markdown',
            reply_markup: { inline_keyboard: [[{ text: '📢 Channel', url: LINKS.channel }]] }
        }, { filename: `${song.title}.mp3`, contentType: 'audio/mpeg' });

        await bot.deleteMessage(chatId, status.message_id).catch(() => {});

    } catch (err) {
        bot.editMessageText(`❌ ${err.message}`, { chat_id: chatId, message_id: status.message_id });
    }
}));

bot.onText(/\/video (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const query  = match[1].trim();
    const status = await bot.sendMessage(chatId, `🔍 Finding *${query}*...`, { parse_mode: 'Markdown' });

    try {
        const { data } = await axios.get(`https://apis.davidcyril.name.ng/download/ytmp4?query=${encodeURIComponent(query)}`);
        if (!data.success || !data.result?.download_url) throw new Error('Video not found');

        const result = data.result;
        await bot.editMessageText(`⬇️ Downloading *${result.title}*...`, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' });

        const fileRes = await axios.get(result.download_url, { responseType: 'arraybuffer', timeout: 120000 });
        await bot.sendVideo(chatId, Buffer.from(fileRes.data), {
            caption:    `🎬 *${result.title}*`,
            parse_mode: 'Markdown',
            supports_streaming: true
        }, { filename: `${result.title}.mp4`, contentType: 'video/mp4' });

        await bot.deleteMessage(chatId, status.message_id).catch(() => {});

    } catch (err) {
        bot.editMessageText(`❌ ${err.message}`, { chat_id: chatId, message_id: status.message_id });
    }
}));

bot.onText(/\/lyrics (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const query  = match[1].trim();
    const status = await bot.sendMessage(chatId, `🔍 Fetching lyrics for *${query}*...`, { parse_mode: 'Markdown' });

    try {
        const res  = await axios.get(`https://apis.prexzyvilla.site/search/lyrics?title=${encodeURIComponent(query)}`);
        const data = res.data;
        if (!data.status || !data.data?.lyrics) throw new Error('Lyrics not found');

        const { title, artist, lyrics } = data.data;
        let text = `🎶 *${title}* — ${artist}\n\n${lyrics}`;
        if (text.length > 3800) text = text.slice(0, 3800) + '\n\n_...truncated_';

        await bot.editMessageText(text, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' });
    } catch (err) {
        bot.editMessageText(`❌ ${err.message}`, { chat_id: chatId, message_id: status.message_id });
    }
}));

bot.onText(/\/trending/, requireMembership(async (msg) => {
    const chatId = msg.chat.id;
    const status = await bot.sendMessage(chatId, '🔍 Fetching trending music...');

    try {
        const res  = await axios.get('https://apis.davidcyril.name.ng/trending');
        const data = res.data;
        if (!data.status || !data.result?.length) throw new Error('No trending data');

        let text = '*🔥 Trending Music*\n\n';
        data.result.slice(0, 8).forEach((item, i) => {
            text += `*${i + 1}.* ${item.title}\n   \`/play ${item.title}\`\n\n`;
        });

        await bot.editMessageText(text, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' });
    } catch (err) {
        bot.editMessageText(`❌ ${err.message}`, { chat_id: chatId, message_id: status.message_id });
    }
}));

bot.onText(/\/gif (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const query  = match[1].trim();

    try {
        const tenorKey = process.env.TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
        const res      = await axios.get('https://api.tenor.com/v2/search', {
            params: { q: query, key: tenorKey, limit: 1, media_filter: 'gif' },
            timeout: 8000
        });
        const gifUrl = res.data?.results?.[0]?.media_formats?.gif?.url;
        if (!gifUrl) throw new Error('No GIF found');

        await bot.sendAnimation(chatId, gifUrl, {
            caption:    `*${query}*`,
            parse_mode: 'Markdown'
        });
    } catch (err) {
        bot.sendMessage(chatId, `❌ ${err.message}`);
    }
}));

// ─── Callback Queries ─────────────────────────────────────────

bot.on('callback_query', async (query) => {
    const msg    = query.message;
    const data   = query.data;
    const userId = query.from.id;
    const chatId = msg.chat.id;

    trackedUsers.add(userId.toString());

    if (data === 'check_membership') {
        await bot.answerCallbackQuery(query.id, { text: 'Checking...' });
        const mem = await checkMembership(userId);

        if (mem.hasAll) {
            await bot.editMessageText(
`╭━───━⪨ Authorised ✅ ⪩━───━
┃
┃ All channels joined!
┃ You can now use the bot.
╰━───────────────────━`,
                {
                    chat_id: chatId, message_id: msg.message_id,
                    reply_markup: { inline_keyboard: [[{ text: '🟢 Start', callback_data: 'start_bot' }]] }
                }
            );
        } else {
            await bot.answerCallbackQuery(query.id, { text: '❌ Please join all channels first!', show_alert: true });
        }

    } else if (data === 'start_bot') {
        await bot.answerCallbackQuery(query.id);
        bot.sendMessage(chatId, 'Use /pair <number> to connect WhatsApp\nUse /help for all commands', { parse_mode: 'Markdown' });

    } else if (data === 'how_to_pair') {
        await bot.answerCallbackQuery(query.id);
        bot.sendMessage(chatId,
`*How to Pair:*
1. Send \`/pair 255712345678\`
2. Copy the 8-digit code
3. Open WhatsApp → Linked Devices
4. Tap "Link with phone number"
5. Enter the code ✅`,
            { parse_mode: 'Markdown' }
        );

    } else if (data === 'help_msg') {
        await bot.answerCallbackQuery(query.id);
        bot.sendMessage(chatId, 'Send /help to see all commands', { parse_mode: 'Markdown' });

    } else if (data.startsWith('reply_')) {
        await bot.answerCallbackQuery(query.id, { text: 'Reply to the report message above', show_alert: true });
    }
});

// ─── Admin Reply Handler ──────────────────────────────────────

bot.on('message', async (msg) => {
    if (!isAdmin(msg.from.id) || !msg.reply_to_message || !msg.text || msg.text.startsWith('/')) return;

    const replyText = msg.reply_to_message.text || '';
    const idMatch   = replyText.match(/ID: (\d+)/);

    if (idMatch) {
        try {
            await bot.sendMessage(idMatch[1],
`╭━───━⪨ Admin Reply ⪩━───━
┃
❏ ${msg.text}
╰━───────────────────━`
            );
            bot.sendMessage(msg.chat.id, '✅ Reply sent');
        } catch {
            bot.sendMessage(msg.chat.id, '❌ Could not send reply');
        }
    }
});

// ─── owner.json Helper ────────────────────────────────────────
// Maintains backward compatibility with case.js which reads owner.json

async function _addToOwnerJson(number) {
    try {
        const ownerPath = path.join(__dirname, 'allfunc', 'owner.json');
        let owners = [];

        try {
            const raw = await fs.readFile(ownerPath, 'utf8');
            owners    = JSON.parse(raw);
        } catch { owners = []; }

        const waJid  = number + '@s.whatsapp.net';
        const lidJid = number + '@lid';
        let changed  = false;

        if (!owners.includes(waJid))  { owners.push(waJid);  changed = true; }
        if (!owners.includes(lidJid)) { owners.push(lidJid); changed = true; }
        if (changed) await fs.writeFile(ownerPath, JSON.stringify(owners, null, 2));

    } catch (err) {
        console.error(chalk.yellow(`⚠️ owner.json update failed: ${err.message}`));
    }
}

// ─── Graceful Shutdown ────────────────────────────────────────

let isShuttingDown = false;

function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(chalk.yellow(`🛑 ${signal} — shutting down`));
    bot.stopPolling();
    process.exit(0);
}

process.once('SIGINT',  () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('message',   (msg) => { if (msg === 'shutdown') gracefulShutdown('PM2'); });

// ─── HTTP Health Check Server ─────────────────────────────────
// Render requires a web service to bind to a port.
// This lightweight server satisfies that requirement
// while the real work is done by the Telegram polling bot.
const http = require('http');

const healthServer = http.createServer(async (req, res) => {
    const url = req.url;

    // Basic health check
    if (url === '/health' || url === '/') {
        const { getSessionStats } = require('./db');
        const stats = await getSessionStats().catch(() => ({ total: 0, active: 0 }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status:     'ok',
            bot:        'running',
            server:     SERVER_NAME,
            uptime:     Math.floor(process.uptime()),
            sessions:   stats.total,
            active:     stats.active,
            maxConn:    MAX_CONN,
            timestamp:  new Date().toISOString()
        }));
        return;
    }

    // Internal webhook — called by the website service when it runs on a
    // separate Render service. Triggers WhatsApp pairing for a given number.
    // Protected by INTERNAL_SECRET to prevent unauthorized triggering.
    if (url === '/internal/pair' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { number, secret } = JSON.parse(body || '{}');
                const expectedSecret = process.env.INTERNAL_SECRET || 'adevos-internal';

                if (secret !== expectedSecret) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Unauthorized' }));
                    return;
                }

                if (!number) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'number is required' }));
                    return;
                }

                console.log(chalk.blue(`📨 Webhook pairing trigger received for: ${number}`));

                const startpairing = require('./pair');
                const sessionId    = number + '@s.whatsapp.net';

                // Fire and forget — pairing happens asynchronously,
                // code will appear in MongoDB pairings collection shortly
                startpairing(sessionId).catch(err => {
                    console.error(chalk.red(`❌ Webhook pairing failed [${number}]: ${err.message}`));
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Pairing triggered' }));

            } catch (err) {
                console.error(chalk.red(`❌ Webhook error: ${err.message}`));
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // 404 for everything else
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'not found' }));
});

// ─── Initialize ───────────────────────────────────────────────

(async () => {
    try {
        await connectDB();
        console.log(chalk.green('✅ MongoDB connected'));
        console.log(chalk.magenta(`🤖 Telegram bot running — ${SERVER_NAME}`));
        console.log(chalk.blue(`👮 Admins: ${ADMIN_IDS.join(', ') || 'none configured'}`));
        console.log(chalk.cyan(`📊 Max connections: ${MAX_CONN}`));

        // Start health check server on PORT (required by Render)
        const PORT_HTTP = parseInt(process.env.PORT || '3000');
        healthServer.listen(PORT_HTTP, () => {
            console.log(chalk.green(`🌐 Health server listening on port ${PORT_HTTP}`));
        });

    } catch (err) {
        console.error(chalk.red(`❌ Startup failed: ${err.message}`));
        process.exit(1);
    }
})();

module.exports = bot;
