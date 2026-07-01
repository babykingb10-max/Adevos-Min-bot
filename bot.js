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

// ─── Music Commands ──────────────────────────────────────────
// Primary: ./lib/api (xwolf.space)
// Fallback: davidcyril.name.ng / prexzyvilla.site

const api = require('./lib/api');
const { safeReply } = require('./lib/helpers');

bot.onText(/^\/play\s*$/,   requireMembership((msg) => bot.sendMessage(msg.chat.id, 'Usage: `/play Faded Alan Walker`', { parse_mode: 'Markdown' })));
bot.onText(/^\/video\s*$/,  requireMembership((msg) => bot.sendMessage(msg.chat.id, 'Usage: `/video Faded Alan Walker`', { parse_mode: 'Markdown' })));
bot.onText(/^\/lyrics\s*$/, requireMembership((msg) => bot.sendMessage(msg.chat.id, 'Usage: `/lyrics Faded Alan Walker`', { parse_mode: 'Markdown' })));
bot.onText(/^\/gif\s*$/,    requireMembership((msg) => bot.sendMessage(msg.chat.id, 'Usage: `/gif funny cat`', { parse_mode: 'Markdown' })));
bot.onText(/^\/song\s*$/,   requireMembership((msg) => bot.sendMessage(msg.chat.id, 'Usage: `/song Faded`', { parse_mode: 'Markdown' })));
bot.onText(/^\/dl\s*$/,     requireMembership((msg) => bot.sendMessage(msg.chat.id, 'Usage: `/dl Faded Alan Walker`', { parse_mode: 'Markdown' })));

bot.onText(/\/play (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const query  = match[1].trim();
    const status = await safeReply(bot, chatId, `🔍 Finding *${query}*...`);

    try {
        // Primary: lib/api (xwolf.space)
        let data = await api.downloadMp3(query).catch(() => null);

        // Fallback: davidcyril
        if (!data?.success || !data?.downloadUrl) {
            const res = await axios.get(`https://apis.davidcyril.name.ng/play?query=${encodeURIComponent(query)}`).catch(() => null);
            if (res?.data?.status && res.data.result) {
                data = { success: true, title: res.data.result.title, downloadUrl: res.data.result.download_url, quality: 'MP3' };
            }
        }

        if (!data?.success || !data?.downloadUrl) throw new Error('Song not found');

        await bot.editMessageText(`⬇️ Downloading *${data.title}*...`, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' });
        const fileRes = await axios.get(data.downloadUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': 'Mozilla/5.0' } });

        await bot.sendAudio(chatId, Buffer.from(fileRes.data), {
            title:      data.title,
            caption:    `🎵 *${data.title}*`,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: '📢 Channel', url: LINKS.channel }]] }
        }, { filename: `${data.title}.mp3`, contentType: 'audio/mpeg' });

        await bot.deleteMessage(chatId, status.message_id).catch(() => {});

    } catch (err) {
        bot.editMessageText(`❌ ${err.message}`, { chat_id: chatId, message_id: status.message_id }).catch(() => {});
    }
}));

bot.onText(/\/song (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const query  = match[1].trim();
    const status = await safeReply(bot, chatId, `🔍 Searching *${query}*...`);
    try {
        const data = await api.search(query);
        if (!data.success || !data.items?.length) throw new Error('No results found');
        let text = `*Results for "${query}"*\n\n`;
        data.items.slice(0, 6).forEach((item, i) => {
            text += `*${i + 1}.* ${item.title}\n   ${item.channelTitle}\n   \`/play ${item.title}\`\n\n`;
        });
        await bot.editMessageText(text, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown', disable_web_page_preview: true });
    } catch (err) {
        await bot.editMessageText(`❌ ${err.message}`, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' }).catch(() => {});
    }
}));

bot.onText(/\/video (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const query  = match[1].trim();
    const status = await safeReply(bot, chatId, `🔍 Finding *${query}*...`);

    try {
        // Primary: lib/api
        let data = await api.downloadMp4(query).catch(() => null);

        // Fallback: davidcyril
        if (!data?.success || !data?.downloadUrl) {
            const res = await axios.get(`https://apis.davidcyril.name.ng/download/ytmp4?query=${encodeURIComponent(query)}`).catch(() => null);
            if (res?.data?.success && res.data.result?.download_url) {
                data = { success: true, title: res.data.result.title, downloadUrl: res.data.result.download_url, quality: '720p' };
            }
        }

        if (!data?.success || !data?.downloadUrl) throw new Error('Video not found');

        await bot.editMessageText(`⬇️ Downloading *${data.title}*...`, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' });
        const fileRes = await axios.get(data.downloadUrl, { responseType: 'arraybuffer', timeout: 120000, headers: { 'User-Agent': 'Mozilla/5.0' } });

        await bot.sendVideo(chatId, Buffer.from(fileRes.data), {
            caption:    `🎬 *${data.title}*\nQuality: ${data.quality || '720p'}`,
            parse_mode: 'Markdown',
            supports_streaming: true
        }, { filename: `${data.title}.mp4`, contentType: 'video/mp4' });

        await bot.deleteMessage(chatId, status.message_id).catch(() => {});

    } catch (err) {
        bot.editMessageText(`❌ ${err.message}`, { chat_id: chatId, message_id: status.message_id }).catch(() => {});
    }
}));

bot.onText(/\/dl (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const query  = match[1].trim();
    const status = await safeReply(bot, chatId, `🔍 Looking up *${query}*...`);
    try {
        const data = await api.downloadBoth(query);
        if (!data.success) throw new Error('Not found');
        const mp3 = data.mp3 || {}, mp4 = data.mp4 || {};
        const text = `*${data.title}*\n\n${mp3.success ? `MP3 — ${mp3.quality || '320kbps'}\n` : ''}${mp4.success ? `MP4 — ${mp4.quality || '720p'}` : ''}`;
        const buttons = [];
        if (mp3.success && mp3.downloadUrl) buttons.push({ text: 'Download MP3', url: mp3.downloadUrl });
        if (mp4.success && mp4.downloadUrl) buttons.push({ text: 'Download MP4', url: mp4.downloadUrl });
        const keyboard = { inline_keyboard: [] };
        if (buttons.length) keyboard.inline_keyboard.push(buttons);
        if (data.youtubeUrl) keyboard.inline_keyboard.push([{ text: 'Watch on YouTube', url: data.youtubeUrl }]);
        keyboard.inline_keyboard.push([{ text: 'Channel', url: LINKS.channel }]);
        await bot.editMessageText(text, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown', reply_markup: keyboard });
    } catch (err) {
        await bot.editMessageText(`❌ ${err.message}`, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' }).catch(() => {});
    }
}));

bot.onText(/\/lyrics (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const query  = match[1].trim();
    const status = await safeReply(bot, chatId, `🔍 Fetching lyrics for *${query}*...`);
    try {
        // Primary: lib/api
        let data = await api.lyrics(query).catch(() => null);

        // Fallback: prexzyvilla
        if (!data?.success || !data?.lyrics) {
            const res = await axios.get(`https://apis.prexzyvilla.site/search/lyrics?title=${encodeURIComponent(query)}`).catch(() => null);
            if (res?.data?.status && res.data.data?.lyrics) {
                data = { success: true, title: res.data.data.title, author: res.data.data.artist, lyrics: res.data.data.lyrics };
            }
        }

        if (!data?.success || !data?.lyrics) throw new Error('Lyrics not found');
        let text = `🎶 *${data.title}*\n💿 ${data.author || ''}\n\n${data.lyrics}`;
        if (text.length > 3800) text = text.slice(0, 3800) + '\n\n_...truncated_';
        await bot.editMessageText(text, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' });
    } catch (err) {
        await bot.editMessageText(`❌ ${err.message}`, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' }).catch(() => {});
    }
}));

bot.onText(/\/trending/, requireMembership(async (msg) => {
    const chatId = msg.chat.id;
    const status = await safeReply(bot, chatId, '🔍 Fetching trending music...');
    try {
        // Primary: lib/api
        let items = null;
        const data = await api.trending().catch(() => null);
        if (data?.success && data.items?.length) items = data.items;

        // Fallback: davidcyril
        if (!items) {
            const res = await axios.get('https://apis.davidcyril.name.ng/trending').catch(() => null);
            if (res?.data?.status && res.data.result?.length) items = res.data.result;
        }

        if (!items?.length) throw new Error('No trending data');
        let text = '*🔥 Trending Music*\n\n';
        items.slice(0, 8).forEach((item, i) => {
            text += `*${i + 1}.* ${item.title}\n   ${item.channelTitle || ''}\n   \`/play ${item.title}\`\n\n`;
        });
        await bot.editMessageText(text, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown', disable_web_page_preview: true });
    } catch (err) {
        await bot.editMessageText(`❌ ${err.message}`, { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' }).catch(() => {});
    }
}));

bot.onText(/\/gif (.+)/, requireMembership(async (msg, match) => {
    const chatId = msg.chat.id;
    const query  = match[1].trim();
    try {
        const tenorKey = process.env.TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
        const res = await axios.get('https://api.tenor.com/v2/search', {
            params: { q: query, key: tenorKey, limit: 1, media_filter: 'gif' }, timeout: 8000
        });
        const gifUrl = res.data?.results?.[0]?.media_formats?.gif?.url;
        if (!gifUrl) throw new Error('No GIF found');
        await bot.sendAnimation(chatId, gifUrl, { caption: `*${query}*`, parse_mode: 'Markdown' });
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

// ─── Imports for Group Commands ───────────────────────────────
const storeLib   = require('./lib/store');
const { buildBox }                                    = require('./lib/box');
const { isGroup: _isGroup, isAdmin: _isAdmin,
        getSenderName }                               = require('./lib/helpers');

// ─── Group Command Helpers ────────────────────────────────────

async function getTarget(msg) {
    if (msg.reply_to_message) return msg.reply_to_message.from;
    const parts   = msg.text?.split(' ') || [];
    const mention = parts[1];
    if (mention && mention.startsWith('@')) {
        try {
            const m = await bot.getChatMember(msg.chat.id, mention.replace('@', ''));
            return m.user;
        } catch { return null; }
    }
    return null;
}

function userName(user) {
    return user.username ? `@${user.username}` : user.first_name;
}

function groupAdminOnly(handler) {
    return async (msg, match) => {
        if (!_isGroup(msg))
            return bot.sendMessage(msg.chat.id, buildBox('⚠️', ['This command works in groups only.']), { parse_mode: 'Markdown' });
        if (!await _isAdmin(bot, msg.chat.id, msg.from.id))
            return bot.sendMessage(msg.chat.id, buildBox('🚫', ['Admins only.']), { parse_mode: 'Markdown' });
        return handler(msg, match);
    };
}

// ─── Group Management Commands ────────────────────────────────

bot.onText(/\/add$/, groupAdminOnly(async (msg) => {
    try {
        const link = await bot.exportChatInviteLink(msg.chat.id);
        await bot.sendMessage(msg.chat.id, buildBox('Invite Link', ['Share this link to add members:', null, link]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/promote/, groupAdminOnly(async (msg) => {
    const target = await getTarget(msg);
    if (!target) return bot.sendMessage(msg.chat.id, buildBox('Promote', ['Reply to or mention a user.']), { parse_mode: 'Markdown' });
    try {
        await bot.promoteChatMember(msg.chat.id, target.id, {
            can_manage_chat: true, can_delete_messages: true, can_manage_video_chats: true,
            can_restrict_members: true, can_promote_members: false, can_change_info: true,
            can_invite_users: true, can_pin_messages: true,
        });
        await bot.sendMessage(msg.chat.id, buildBox('Promoted ✅', [
            `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`, null, 'Now has admin permissions.',
        ]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/demote/, groupAdminOnly(async (msg) => {
    const target = await getTarget(msg);
    if (!target) return bot.sendMessage(msg.chat.id, buildBox('Demote', ['Reply to or mention a user.']), { parse_mode: 'Markdown' });
    try {
        await bot.promoteChatMember(msg.chat.id, target.id, {
            can_manage_chat: false, can_delete_messages: false, can_manage_video_chats: false,
            can_restrict_members: false, can_promote_members: false, can_change_info: false,
            can_invite_users: false, can_pin_messages: false,
        });
        await bot.sendMessage(msg.chat.id, buildBox('Demoted ✅', [
            `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`, null, 'Admin rights removed.',
        ]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/kick/, groupAdminOnly(async (msg) => {
    const target = await getTarget(msg);
    if (!target) return bot.sendMessage(msg.chat.id, buildBox('Kick', ['Reply to or mention a user.']), { parse_mode: 'Markdown' });
    try {
        await bot.banChatMember(msg.chat.id, target.id);
        await bot.unbanChatMember(msg.chat.id, target.id);
        await bot.sendMessage(msg.chat.id, buildBox('Kicked ✅', [
            `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`,
        ]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/ban/, groupAdminOnly(async (msg) => {
    const target = await getTarget(msg);
    if (!target) return bot.sendMessage(msg.chat.id, buildBox('BAN', ['Reply to or mention a user.']), { parse_mode: 'Markdown' });
    try {
        await bot.banChatMember(msg.chat.id, target.id);
        await bot.sendMessage(msg.chat.id, buildBox('BANNED 🔨', [
            `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`, null, 'User cannot rejoin until unbanned.',
        ]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/unban/, groupAdminOnly(async (msg) => {
    const target = await getTarget(msg);
    if (!target) return bot.sendMessage(msg.chat.id, buildBox('UNBAN', ['Reply to or mention a user.']), { parse_mode: 'Markdown' });
    try {
        await bot.unbanChatMember(msg.chat.id, target.id, { only_if_banned: true });
        await bot.sendMessage(msg.chat.id, buildBox('UNBANNED ✅', [
            `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`, null, 'User can now rejoin the group.',
        ]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/mute/, groupAdminOnly(async (msg) => {
    const target = await getTarget(msg);
    if (!target) return bot.sendMessage(msg.chat.id, buildBox('MUTE', ['Reply to or mention a user.']), { parse_mode: 'Markdown' });
    try {
        await bot.restrictChatMember(msg.chat.id, target.id, {
            permissions: { can_send_messages: false, can_send_media_messages: false, can_send_polls: false, can_send_other_messages: false },
        });
        await bot.sendMessage(msg.chat.id, buildBox('MUTED 🔇', [
            `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`, null, 'User cannot send messages.',
        ]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/unmute/, groupAdminOnly(async (msg) => {
    const target = await getTarget(msg);
    if (!target) return bot.sendMessage(msg.chat.id, buildBox('UNMUTE', ['Reply to or mention a user.']), { parse_mode: 'Markdown' });
    try {
        await bot.restrictChatMember(msg.chat.id, target.id, {
            permissions: { can_send_messages: true, can_send_media_messages: true, can_send_polls: true, can_send_other_messages: true, can_add_web_page_previews: true },
        });
        await bot.sendMessage(msg.chat.id, buildBox('UNMUTED 🔊', [
            `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`, null, 'User can send messages again.',
        ]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/leave$/, groupAdminOnly(async (msg) => {
    await bot.sendMessage(msg.chat.id, buildBox('👋 LEAVING', ['Bot is leaving this group...']), { parse_mode: 'Markdown' });
    try { await bot.leaveChat(msg.chat.id); } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
}));

// ─── Auto-Mod Commands ────────────────────────────────────────

bot.onText(/\/antilink(.*)/, groupAdminOnly(async (msg, match) => {
    const arg = match[1]?.trim().toLowerCase();
    let on;
    if (arg === 'on') on = true;
    else if (arg === 'off') on = false;
    else { const current = storeLib.getChat(msg.chat.id, 'antilink', false); on = !current; }
    storeLib.setChat(msg.chat.id, 'antilink', on);
    await bot.sendMessage(msg.chat.id, buildBox('🔗 ANTI-LINK', [
        `Status: ${on ? 'ON ✅' : 'OFF ❌'}`, null,
        on ? 'Links will be auto-deleted.' : 'Anti-link is now disabled.',
    ]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/addbadword(.*)/, groupAdminOnly(async (msg, match) => {
    const word = match[1]?.trim().toLowerCase();
    if (!word) return bot.sendMessage(msg.chat.id, buildBox('⚠️ ADDBADWORD', ['Usage: /addbadword <word>']), { parse_mode: 'Markdown' });
    const list = storeLib.getChat(msg.chat.id, 'badwords', []);
    if (list.includes(word)) return bot.sendMessage(msg.chat.id, buildBox('ℹ️ ADDBADWORD', [`"${word}" is already in the list.`]), { parse_mode: 'Markdown' });
    list.push(word);
    storeLib.setChat(msg.chat.id, 'badwords', list);
    await bot.sendMessage(msg.chat.id, buildBox('✅ BAD WORD ADDED', [`Word:  ${word}`, `Total: ${list.length} word(s)`]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/removebadword(.*)/, groupAdminOnly(async (msg, match) => {
    const word = match[1]?.trim().toLowerCase();
    if (!word) return bot.sendMessage(msg.chat.id, buildBox('⚠️ REMOVEBADWORD', ['Usage: /removebadword <word>']), { parse_mode: 'Markdown' });
    let list = storeLib.getChat(msg.chat.id, 'badwords', []);
    if (!list.includes(word)) return bot.sendMessage(msg.chat.id, buildBox('ℹ️ REMOVEBADWORD', [`"${word}" not in list.`]), { parse_mode: 'Markdown' });
    list = list.filter(w => w !== word);
    storeLib.setChat(msg.chat.id, 'badwords', list);
    await bot.sendMessage(msg.chat.id, buildBox('✅ BAD WORD REMOVED', [`Word:  ${word}`, `Total: ${list.length} word(s)`]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/listbadword$/, groupAdminOnly(async (msg) => {
    const list = storeLib.getChat(msg.chat.id, 'badwords', []);
    if (!list.length) return bot.sendMessage(msg.chat.id, buildBox('🚫 BAD WORDS', ['No bad words set.']), { parse_mode: 'Markdown' });
    await bot.sendMessage(msg.chat.id, buildBox('🚫 BAD WORDS LIST', [`Total: ${list.length}`, null, ...list.map((w, i) => `${i + 1}. ${w}`)]), { parse_mode: 'Markdown' });
}));

// Auto-mod message listener
bot.on('message', async (msg) => {
    if (!_isGroup(msg) || !msg.text) return;
    const chatId = msg.chat.id;
    if (await _isAdmin(bot, chatId, msg.from.id)) return;

    const antilinkOn = storeLib.getChat(chatId, 'antilink', false);
    if (antilinkOn && /(https?:\/\/|t\.me\/|www\.)\S+/gi.test(msg.text)) {
        try {
            await bot.deleteMessage(chatId, msg.message_id);
            const w = await bot.sendMessage(chatId, buildBox('🔗 ANTI-LINK', [`@${msg.from.username || msg.from.first_name}`, 'Links are not allowed here.']), { parse_mode: 'Markdown' });
            setTimeout(() => bot.deleteMessage(chatId, w.message_id).catch(() => {}), 5000);
        } catch {}
        return;
    }

    const badwords = storeLib.getChat(chatId, 'badwords', []);
    if (badwords.length) {
        const lower = msg.text.toLowerCase();
        const found = badwords.find(w => lower.includes(w));
        if (found) {
            try {
                await bot.deleteMessage(chatId, msg.message_id);
                const w = await bot.sendMessage(chatId, buildBox('🚫 BAD WORD', [`@${msg.from.username || msg.from.first_name}`, 'Your message was removed.']), { parse_mode: 'Markdown' });
                setTimeout(() => bot.deleteMessage(chatId, w.message_id).catch(() => {}), 5000);
            } catch {}
        }
    }
});

// ─── Welcome & Goodbye ────────────────────────────────────────

bot.onText(/\/welcome(.*)/, groupAdminOnly(async (msg, match) => {
    const text = match[1]?.trim();
    if (!text) {
        const current = storeLib.getChat(msg.chat.id, 'welcome', null);
        if (!current) return bot.sendMessage(msg.chat.id, buildBox('👋 WELCOME', ['No welcome message set.', null, 'Usage: /welcome <message>', 'Use {name} for user name.']), { parse_mode: 'Markdown' });
        return bot.sendMessage(msg.chat.id, buildBox('👋 WELCOME MESSAGE', ['Current:', null, ...current.split('\n')]), { parse_mode: 'Markdown' });
    }
    storeLib.setChat(msg.chat.id, 'welcome', text);
    await bot.sendMessage(msg.chat.id, buildBox('✅ WELCOME SET', ['Preview:', null, ...text.replace('{name}', 'New Member').split('\n')]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/goodbye(.*)/, groupAdminOnly(async (msg, match) => {
    const text = match[1]?.trim();
    if (!text) {
        const current = storeLib.getChat(msg.chat.id, 'goodbye', null);
        if (!current) return bot.sendMessage(msg.chat.id, buildBox('🚪 GOODBYE', ['No goodbye message set.', null, 'Usage: /goodbye <message>']), { parse_mode: 'Markdown' });
        return bot.sendMessage(msg.chat.id, buildBox('🚪 GOODBYE MESSAGE', ['Current:', null, ...current.split('\n')]), { parse_mode: 'Markdown' });
    }
    storeLib.setChat(msg.chat.id, 'goodbye', text);
    await bot.sendMessage(msg.chat.id, buildBox('✅ GOODBYE SET', ['Preview:', null, ...text.replace('{name}', 'Leaving Member').split('\n')]), { parse_mode: 'Markdown' });
}));

bot.on('new_chat_members', async (msg) => {
    const welcomeText = storeLib.getChat(msg.chat.id, 'welcome', null);
    if (!welcomeText) return;
    for (const member of msg.new_chat_members) {
        const name = member.username ? `@${member.username}` : member.first_name;
        await bot.sendMessage(msg.chat.id, welcomeText.replace('{name}', name)).catch(() => {});
    }
});

bot.on('left_chat_member', async (msg) => {
    const goodbyeText = storeLib.getChat(msg.chat.id, 'goodbye', null);
    if (!goodbyeText) return;
    const member = msg.left_chat_member;
    const name = member.username ? `@${member.username}` : member.first_name;
    await bot.sendMessage(msg.chat.id, goodbyeText.replace('{name}', name)).catch(() => {});
});

// ─── Warn System ──────────────────────────────────────────────

const DEFAULT_MAX_WARNS = 3;

function getWarnData(chatId, userId)       { return storeLib.getUser(chatId, userId, 'warns', { count: 0, reasons: [] }); }
function setWarnData(chatId, userId, data) { storeLib.setUser(chatId, userId, 'warns', data); }
function getMaxWarns(chatId)               { return storeLib.getChat(chatId, 'maxwarns', DEFAULT_MAX_WARNS); }

bot.onText(/\/warn(.*)/, groupAdminOnly(async (msg, match) => {
    const target = await getTarget(msg);
    if (!target) return bot.sendMessage(msg.chat.id, buildBox('⚠️ WARN', ['Reply to or mention a user to warn.']), { parse_mode: 'Markdown' });
    const parts  = msg.text.split(' ');
    const reason = (msg.reply_to_message ? parts.slice(1) : parts.slice(2)).join(' ') || 'No reason given';
    const max    = getMaxWarns(msg.chat.id);
    const data   = getWarnData(msg.chat.id, target.id);
    data.count += 1;
    data.reasons.push(reason);
    setWarnData(msg.chat.id, target.id, data);
    if (data.count >= max) {
        await bot.sendMessage(msg.chat.id, buildBox('⚠️ WARNED — AUTO BAN', [
            `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`,
            `Reason: ${reason}`, `Warns:  ${data.count}/${max} MAX REACHED`, null, 'User has been auto-banned.',
        ]), { parse_mode: 'Markdown' });
        try { await bot.banChatMember(msg.chat.id, target.id); setWarnData(msg.chat.id, target.id, { count: 0, reasons: [] }); } catch {}
    } else {
        await bot.sendMessage(msg.chat.id, buildBox('⚠️ WARNED', [
            `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`,
            `Reason: ${reason}`, `Warns:  ${data.count}/${max}`,
        ]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/resetwarn/, groupAdminOnly(async (msg) => {
    const target = await getTarget(msg);
    if (!target) return bot.sendMessage(msg.chat.id, buildBox('⚠️ RESETWARN', ['Reply to or mention a user.']), { parse_mode: 'Markdown' });
    setWarnData(msg.chat.id, target.id, { count: 0, reasons: [] });
    await bot.sendMessage(msg.chat.id, buildBox('✅ WARNS CLEARED', [`User: ${userName(target)}`, `By: ${getSenderName(msg)}`]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/setwarn(.*)/, groupAdminOnly(async (msg, match) => {
    const num = parseInt(match[1]?.trim());
    if (!num || num < 1 || num > 20) return bot.sendMessage(msg.chat.id, buildBox('⚠️ SETWARN', ['Usage: /setwarn <1-20>']), { parse_mode: 'Markdown' });
    storeLib.setChat(msg.chat.id, 'maxwarns', num);
    await bot.sendMessage(msg.chat.id, buildBox('✅ WARN LIMIT SET', [`Max warns: ${num}`, null, `Auto-ban after ${num} warnings.`]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/warnings/, async (msg) => {
    if (!_isGroup(msg)) return;
    const target = await getTarget(msg);
    const userId = target ? target.id : msg.from.id;
    const name   = target ? userName(target) : getSenderName(msg);
    const data   = getWarnData(msg.chat.id, userId);
    const max    = getMaxWarns(msg.chat.id);
    const rows   = [`User:   ${name}`, `Warns:  ${data.count}/${max}`, null];
    if (data.reasons.length) { rows.push('Reasons:'); data.reasons.forEach((r, i) => rows.push(`  ${i + 1}. ${r}`)); }
    else rows.push('No warnings recorded.');
    await bot.sendMessage(msg.chat.id, buildBox('📋 WARNINGS', rows), { parse_mode: 'Markdown' });
});

// ─── Group Settings Commands ──────────────────────────────────

bot.onText(/\/setgroupname(.*)/, groupAdminOnly(async (msg, match) => {
    const newName = match[1]?.trim();
    if (!newName) return bot.sendMessage(msg.chat.id, buildBox('✏️ SET GROUP NAME', ['Usage: /setgroupname <name>']), { parse_mode: 'Markdown' });
    try {
        await bot.setChatTitle(msg.chat.id, newName);
        await bot.sendMessage(msg.chat.id, buildBox('✅ NAME UPDATED', [`New name: ${newName}`]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('❌ FAILED', [err.message.includes('not enough rights') ? 'Bot needs "Change group info" permission.' : err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/setgpp(.*)/, groupAdminOnly(async (msg, match) => {
    const url = match[1]?.trim();
    if (!url || !/^https?:\/\/.+/i.test(url)) return bot.sendMessage(msg.chat.id, buildBox('🖼️ SET GROUP PHOTO', ['Usage: /setgpp <image url>']), { parse_mode: 'Markdown' });
    const status = await bot.sendMessage(msg.chat.id, buildBox('🖼️ SET GROUP PHOTO', ['⏳ Downloading...']), { parse_mode: 'Markdown' });
    try {
        const axios = require('axios');
        const res   = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
        await bot.setChatPhoto(msg.chat.id, Buffer.from(res.data));
        await bot.editMessageText(buildBox('✅ PHOTO UPDATED', ['Group photo changed.']), { chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown' }).catch(() => {});
    } catch (err) {
        await bot.editMessageText(buildBox('❌ FAILED', [err.message]), { chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown' }).catch(() => {});
    }
}));

bot.onText(/\/setdesc(.*)/, groupAdminOnly(async (msg, match) => {
    const desc = match[1]?.trim();
    if (!desc) return bot.sendMessage(msg.chat.id, buildBox('📝 SET DESCRIPTION', ['Usage: /setdesc <text>', 'To clear: /setdesc clear']), { parse_mode: 'Markdown' });
    const finalDesc = desc.toLowerCase() === 'clear' ? '' : desc;
    try {
        await bot.setChatDescription(msg.chat.id, finalDesc);
        await bot.sendMessage(msg.chat.id, buildBox(finalDesc ? '✅ DESCRIPTION UPDATED' : '✅ DESCRIPTION CLEARED', [finalDesc ? finalDesc.slice(0, 60) : 'Description removed.']), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('❌ FAILED', [err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/gctime$/, async (msg) => {
    if (!_isGroup(msg)) return;
    try {
        const chat = await bot.getChat(msg.chat.id);
        await bot.sendMessage(msg.chat.id, buildBox('ℹ️ GROUP INFO', [
            `Name:    ${chat.title}`, `ID:      ${chat.id}`,
            `Type:    ${chat.type}`, `Members: ${chat.member_count || 'N/A'}`,
        ]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('❌ ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
});

bot.onText(/\/onlyadmins$/, groupAdminOnly(async (msg) => {
    const current = storeLib.getChat(msg.chat.id, 'onlyadmins', false);
    const on = !current;
    storeLib.setChat(msg.chat.id, 'onlyadmins', on);
    try {
        if (on) { await bot.setChatPermissions(msg.chat.id, { can_send_messages: false }); }
        else    { await bot.setChatPermissions(msg.chat.id, { can_send_messages: true, can_send_media_messages: true, can_send_polls: true, can_send_other_messages: true }); }
        await bot.sendMessage(msg.chat.id, buildBox(`${on ? '🔒' : '🔓'} ONLY ADMINS`, [
            `Status: ${on ? 'ON ✅' : 'OFF ❌'}`, null,
            on ? 'Only admins can send messages.' : 'All members can send messages.',
        ]), { parse_mode: 'Markdown' });
    } catch (err) {
        await bot.sendMessage(msg.chat.id, buildBox('❌ ERROR', [err.message]), { parse_mode: 'Markdown' });
    }
}));

bot.onText(/\/mode(.*)/, async (msg, match) => {
    if (!_isGroup(msg)) return;
    if (!await _isAdmin(bot, msg.chat.id, msg.from.id)) return bot.sendMessage(msg.chat.id, buildBox('🚫 DENIED', ['Admins only.']), { parse_mode: 'Markdown' });
    const arg     = match[1]?.trim().toLowerCase();
    const current = storeLib.getChat(msg.chat.id, 'adminmode', false);
    if (!arg) return bot.sendMessage(msg.chat.id, buildBox('⚙️ BOT MODE', [
        `Current: ${current ? '🔒 Admins only' : '🔓 Public'}`, null,
        'To change:', '  /mode admins', '  /mode public',
    ]), { parse_mode: 'Markdown' });
    if (!['admins', 'public'].includes(arg)) return bot.sendMessage(msg.chat.id, buildBox('⚠️ MODE', ['Use: /mode admins  or  /mode public']), { parse_mode: 'Markdown' });
    const on = arg === 'admins';
    storeLib.setChat(msg.chat.id, 'adminmode', on);
    await bot.sendMessage(msg.chat.id, buildBox(on ? '🔒 ADMIN MODE' : '🔓 PUBLIC MODE', [
        on ? 'Bot responds to admins only.' : 'Bot responds to everyone.',
    ]), { parse_mode: 'Markdown' });
});

const GROUP_RULES = [
    '1. Be respectful to all members.',
    '2. No spam or self-promotion.',
    '3. No NSFW or offensive content.',
    '4. Stay on topic.',
    '5. No sharing of personal information.',
    '6. Follow admin instructions.',
];

bot.onText(/\/rules$/, async (msg) => {
    await bot.sendMessage(msg.chat.id,
        `📜 *Group Rules*\n\n${GROUP_RULES.map(r => `  ${r}`).join('\n')}\n\n_Breaking rules may result in a warn, mute, or kick._`,
        { parse_mode: 'Markdown' }
    );
});

// ─── Callback Query Handler ───────────────────────────────────

bot.on('callback_query', async (query) => {
    const msg       = query.message;
    const data      = query.data;
    const userId    = query.from.id;
    const chatId    = msg.chat.id;
    const firstName = query.from.first_name || 'User';

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
        const up = Math.floor(process.uptime());
        const d  = Math.floor(up / 86400), h = Math.floor((up % 86400) / 3600);
        const m  = Math.floor((up % 3600) / 60), s = up % 60;
        await bot.sendMessage(chatId,
`╭━───━⪨ Welcome ⪩━───━
┃❏ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: Adevos Min-Bot
┃❏ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: V2
┃❏ 𝐃𝐞𝐯: Adevos
┃❏ 𝐍𝐚𝐦𝐞: ${firstName}
┃❏ 𝐔𝐬𝐞𝐫 𝐈𝐃: ${userId}
┃❏ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞: ${d}d ${h}h ${m}m ${s}s
╰━───────────────────━`,
            {
                reply_markup: { inline_keyboard: [
                    [{ text: 'Group Menu', callback_data: 'menu_group' }, { text: 'Owner Menu', callback_data: 'menu_owner' }],
                    [{ text: 'Download Menu', callback_data: 'menu_download' }],
                    [{ text: 'Help', callback_data: 'help_msg' }],
                    [{ text: 'Channel', url: LINKS.channel }, { text: 'Group', url: LINKS.group }]
                ]}
            }
        );

    } else if (data === 'menu_group') {
        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId,
`╭━───━⪨ Group Menu ⪩━───━
┃
┃ ❏ /add — Get invite link
┃ ❏ /promote — Promote member
┃ ❏ /demote — Demote admin
┃ ❏ /kick — Kick member
┃ ❏ /ban — Ban member
┃ ❏ /unban — Unban member
┃ ❏ /mute — Mute member
┃ ❏ /unmute — Unmute member
┃ ❏ /warn — Warn member
┃ ❏ /resetwarn — Reset warns
┃ ❏ /setwarn — Set warn limit
┃ ❏ /warnings — View warnings
┃ ❏ /antilink — Toggle anti-link
┃ ❏ /addbadword — Add bad word
┃ ❏ /removebadword — Remove
┃ ❏ /listbadword — List bad words
┃ ❏ /setgroupname — Set name
┃ ❏ /setgpp — Set group photo
┃ ❏ /setdesc — Set description
┃ ❏ /welcome — Welcome message
┃ ❏ /goodbye — Goodbye message
┃ ❏ /rules — Group rules
┃ ❏ /onlyadmins — Admin-only mode
┃ ❏ /mode — Bot mode
┃ ❏ /gctime — Group info
┃
╰━───────────────────━`,
            { reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'start_bot' }], [{ text: 'Channel', url: LINKS.channel }]] } }
        );

    } else if (data === 'menu_owner') {
        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId,
`╭━───━⪨ Owner Menu ⪩━───━
┃
┃ ❏ /pair <number> — Pair device
┃ ❏ /delpair <number> — Remove
┃ ❏ /listpair confirm — List all
┃ ❏ /autoload confirm — Reload
┃ ❏ /clean — Clean dead sessions
┃ ❏ /stats — Session statistics
┃ ❏ /cast <message> — Broadcast
┃ ❏ /runtime — Bot uptime
┃
╰━───────────────────━`,
            { reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'start_bot' }]] } }
        );

    } else if (data === 'menu_download') {
        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId,
`╭━───━⪨ Download Menu ⪩━───━
┃
┃ ❏ /play <song> — Download audio
┃ ❏ /video <name> — Download video
┃ ❏ /dl <name> — MP3 & MP4 links
┃ ❏ /song <name> — Search music
┃ ❏ /lyrics <name> — Get lyrics
┃ ❏ /trending — Trending music
┃ ❏ /gif <search> — Search GIF
┃
╰━───────────────────━`,
            { reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'start_bot' }]] } }
        );

    } else if (data === 'help_msg') {
        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId,
`╭━───━⪨ Command List ⪩━───━
┃
┃ ❏ /pair <number> — Pair device
┃ ❏ /delpair <number> — Remove
┃ ❏ /play <song> — Download audio
┃ ❏ /video <name> — Download video
┃ ❏ /lyrics <name> — Get lyrics
┃ ❏ /trending — Trending music
┃ ❏ /gif <search> — Search GIF
┃ ❏ /reportee <msg> — Report
┃ ❏ /runtime — Bot uptime
┃ ❏ /help — This menu
┃
╰━───────────────────━`,
            { reply_markup: { inline_keyboard: [[{ text: 'Channel', url: LINKS.channel }, { text: 'Group', url: LINKS.group }], [{ text: 'Menu', callback_data: 'start_bot' }]] } }
        );

    } else if (data.startsWith('reply_')) {
        await bot.answerCallbackQuery(query.id, { text: 'Reply to the report message above to respond', show_alert: true });
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
