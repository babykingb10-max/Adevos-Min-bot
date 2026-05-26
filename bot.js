require('dotenv').config();
require('./setting/config');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const os = require('os');
const { sleep } = require('./nexstore/utils');
const { BOT_TOKEN } = require('./nexstore/token');
const { autoLoadPairs } = require('./autoload');
const api = require('./lib/api');
const { safeReply, isGroup, isAdmin, getSenderName } = require('./lib/helpers');
const { buildBox } = require('./lib/box');
const axios = require('axios');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const adminFilePath = path.join(__dirname, 'nexstore', 'admin.json');
let adminIDs = [];

// Store for user tracking
const userFilePath = path.join(__dirname, 'nexstore', 'users.json');
let userIDs = new Set();

// Required group and channels
const REQUIRED_GROUP = '@adevosxtech';
const REQUIRED_CHANNELS = [
  '@adevosXch1',
  '@adevos_xtech_official2',
  '@adevosx_official_backup',
  '@adevosbackupchannel'
];

// Social media links
const SOCIAL_LINKS = {
  whatsapp: 'https://whatsapp.com/channel/0029Vb6wIVU9Bb5w69FQvt0W',
  telegram_channels: [
    'https://t.me/adevosXch1',
    'https://t.me/adevos_xtech_official2',
    'https://t.me/adevosx_official_backup',
    'https://t.me/adevosbackupchannel'
  ],
  telegram_group: '@adevosxtech',
  channel1: 'https://t.me/adevosXch1',
  channel2: 'https://t.me/adevos_xtech_official2',
  group1: 'https://t.me/adevosxtech',
  group2: 'https://t.me/adevosXtech2',
  group3: 'https://t.me/AdevosXchatting',
  developer: 'https://t.me/Adevos_X',
  channel3: 'https://t.me/adevosx_official_backup',
  channel4: 'https://t.me/adevosbackupchannel'
};

// Utility functions
const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const loadAdminIDs = async () => {
  const ownerID = '8642715070';
  const defaultAdmins = [ownerID];

  if (!(await exists(adminFilePath))) {
    await fs.writeFile(adminFilePath, JSON.stringify(defaultAdmins, null, 2));
    adminIDs = defaultAdmins;
    console.log('created admin.json with default owner id');
  } else {
    try {
      const raw = await fs.readFile(adminFilePath, 'utf8');
      adminIDs = JSON.parse(raw);
    } catch (err) {
      console.error('error loading admin.json:', err);
      adminIDs = defaultAdmins;
    }
  }
  console.log('loaded admin ids:', adminIDs);
};

function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

// Load user IDs
const loadUserIDs = async () => {
  if (await exists(userFilePath)) {
    try {
      const raw = await fs.readFile(userFilePath, 'utf8');
      const users = JSON.parse(raw);
      userIDs = new Set(users);
      console.log(`loaded ${userIDs.size} users`);
    } catch (err) {
      console.error('error loading users.json:', err);
      userIDs = new Set();
    }
  }
};

// Save user IDs
const saveUserIDs = async () => {
  try {
    await fs.writeFile(userFilePath, JSON.stringify([...userIDs], null, 2));
  } catch (err) {
    console.error('error saving users.json:', err);
  }
};

// Track user
const trackUser = async (userId) => {
  const userIdStr = userId.toString();
  if (!userIDs.has(userIdStr)) {
    userIDs.add(userIdStr);
    await saveUserIDs();
    console.log(`➕ new user tracked: ${userIdStr}`);
  }
};

// Check if user has joined required group and channels
const checkMembership = async (userId) => {
  try {
    const groupMember = await bot.getChatMember(REQUIRED_GROUP, userId).catch(() => null);
    const channelChecks = await Promise.all(
      REQUIRED_CHANNELS.map(channel =>
        bot.getChatMember(channel, userId).catch(() => null)
      )
    );
    const validStatuses = ['member', 'administrator', 'creator'];
    const hasJoinedGroup = groupMember && validStatuses.includes(groupMember.status);
    const hasJoinedAllChannels = channelChecks.every(member => member && validStatuses.includes(member.status));
    return {
      hasJoinedGroup,
      hasJoinedAllChannels,
      hasJoinedAll: hasJoinedGroup && hasJoinedAllChannels
    };
  } catch (error) {
    console.error('error checking membership:', error);
    return { hasJoinedGroup: false, hasJoinedAllChannels: false, hasJoinedAll: false };
  }
};

// Send join requirement message
const sendJoinRequirement = (chatId) => {
  return bot.sendMessage(
    chatId,
    'Join all the required channels and group to proceed',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Join Channel 1', url: SOCIAL_LINKS.channel1 }],
          [
            { text: 'Join Channel 2', url: SOCIAL_LINKS.channel2 },
            { text: 'Join Group 1', url: SOCIAL_LINKS.group1 }
          ],
          [{ text: 'Authorise', callback_data: 'check_membership' }],
          [
            { text: 'Join Group 2', url: SOCIAL_LINKS.group2 },
            { text: 'Join Channel 3', url: SOCIAL_LINKS.channel3 }
          ],
          [{ text: 'Join Channel 4', url: SOCIAL_LINKS.channel4 }]
        ]
      }
    }
  );
};

// Middleware to check membership before executing commands
const requireMembership = (handler) => {
  return async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    await trackUser(userId);
    if (adminIDs.includes(userId.toString())) {
      return handler(msg, match);
    }
    const membership = await checkMembership(userId);
    if (!membership.hasJoinedAll) {
      return sendJoinRequirement(chatId);
    }
    return handler(msg, match);
  };
};

// State management
let isShuttingDown = false;
let isAutoLoadRunning = false;

// Auto-load functionality
const runAutoLoad = async () => {
  if (isAutoLoadRunning || isShuttingDown) return;
  isAutoLoadRunning = true;
  try {
    console.log('initializing auto-load');
    await autoLoadPairs();
    console.log('auto-load completed');
  } catch (e) {
    console.error('auto-load failed:', e);
  } finally {
    isAutoLoadRunning = false;
  }
};

const startAutoLoadLoop = () => {
  runAutoLoad();
  setInterval(runAutoLoad, 60 * 60 * 1000);
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`🛑 received ${signal}. shutting down gracefully...`);
  bot.stopPolling();
  console.log('✅ bot stopped successfully');
  process.exit(0);
};

// ========================
// COMMAND HANDLING
// ========================

bot.onText(/\/runtime/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const caption = `Bot is active and running for ${runtime(process.uptime())}`;
    await bot.sendMessage(chatId, caption, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    });
  } catch (err) {
    console.error('RUNTIME CMD ERROR:', err);
    try {
      await bot.sendMessage(msg.chat.id, '⚠️ Failed to get runtime info.');
    } catch (e) { /* ignore */ }
  }
});

// Start command (NO membership check)
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name || 'User';

  await trackUser(userId);

  const uptimeSeconds = Math.floor(process.uptime());
  const d = Math.floor(uptimeSeconds / (3600 * 24));
  const h = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
  const m = Math.floor((uptimeSeconds % 3600) / 60);
  const s = uptimeSeconds % 60;
  const runtimeStr = `${d}d ${h}h ${m}m ${s}s`;

  const caption =
`╭━───━⪨ Welcome ⪩━───━
┃❏ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: Adevos Min-Bot
┃❏ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: V2
┃❏ 𝐃𝐞𝐯: Adevos
┃❏ 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: Telegram
┃❏ 𝐍𝐚𝐦𝐞: ${firstName}
┃❏ 𝐔𝐬𝐞𝐫 𝐈𝐃: ${userId}
┃❏ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞: ${runtimeStr}
╰━───────────────────━`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Group Menu', callback_data: 'menu_group' },
          { text: 'Owner Menu', callback_data: 'menu_owner' }
        ],
        [{ text: 'Download Menu', callback_data: 'menu_download' }],
        [{ text: 'Help', callback_data: 'help_msg' }],
        [
          { text: 'Channel', url: SOCIAL_LINKS.channel1 },
          { text: 'Group', url: SOCIAL_LINKS.group1 }
        ]
      ]
    }
  };

  try {
    await bot.sendPhoto(chatId, 'https://files.catbox.moe/4ag7es.jpg', {
      caption: caption,
      parse_mode: 'Markdown',
      ...keyboard
    });
  } catch (err) {
    // Kama picha haikupakia, tuma text tu
    await bot.sendMessage(chatId, caption, keyboard);
  }
});

// Handle bare /pair command
bot.onText(/^\/pair\s*$/, requireMembership((msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'To proceed enter a phone number in the format: /pair 234xxxxxxxx',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Help', callback_data: 'help_msg' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    }
  );
}));

// Enhanced /pair command
bot.onText(/\/pair (.+)/, requireMembership(async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1].trim();

  try {
    if (!text || /[a-z]/i.test(text)) {
      return bot.sendMessage(chatId, 'To proceed enter a phone number in the format: /pair 234xxxxxxxx', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      });
    }

    if (!/^\d{7,15}(\|\d{1,10})?$/.test(text)) {
      return bot.sendMessage(chatId, 'Use a valid phone number format [ 9 digits ]', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      });
    }

    if (text.startsWith('0')) {
      return bot.sendMessage(chatId, 'Your whatsapp number cannot start with 0', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      });
    }

    const countryCode = text.slice(0, 3);
    if (["252", "4567877"].includes(countryCode)) {
      return bot.sendMessage(chatId, "The number you are trying to pair is unsupported", {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      });
    }

    const pairingFolder = path.join(__dirname, 'nexstore', 'pairing');
    if (!(await exists(pairingFolder))) {
      await fs.mkdir(pairingFolder, { recursive: true });
    }

    const files = await fs.readdir(pairingFolder);
    const pairedCount = files.filter(file => file.endsWith('@s.whatsapp.net')).length;

    if (pairedCount >= 15) {
      return bot.sendMessage(chatId, "This Bot server limit is full kindly use other servers or contact the owner to create more servers", {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Owner', url: SOCIAL_LINKS.developer }],
            [{ text: 'Help', callback_data: 'help_msg' }]
          ]
        }
      });
    }

    const startpairing = require('./pair.js');
    const Xreturn = text.split("|")[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    await startpairing(Xreturn);
    await sleep(4000);

    const pairingFile = path.join(pairingFolder, 'pairing.json');
    const cu = await fs.readFile(pairingFile, 'utf-8');
    const cuObj = JSON.parse(cu);
    delete require.cache[require.resolve('./pair.js')];

    const senderNumber = text.split("|")[0].replace(/[^0-9]/g, '');
    const whatsappFormat = senderNumber + "@s.whatsapp.net";
    const lidFormat = senderNumber + "@lid";

    const ownerPath = path.join(__dirname, 'allfunc', 'owner.json');
    let ownerData = [];

    try {
      const ownerFile = await fs.readFile(ownerPath, 'utf-8');
      ownerData = JSON.parse(ownerFile);
    } catch (err) {
      console.log("Creating new owner.json file");
      ownerData = [];
    }

    let isNew = false;
    if (!ownerData.includes(whatsappFormat)) {
      ownerData.push(whatsappFormat);
      isNew = true;
    }
    if (!ownerData.includes(lidFormat)) {
      ownerData.push(lidFormat);
      isNew = true;
    }

    if (isNew) {
      await fs.writeFile(ownerPath, JSON.stringify(ownerData, null, 2));
      console.log("✅ Saved new owner (both formats):", senderNumber);
    }

    bot.sendMessage(chatId,
`╭━───━⪨ Pairing Code ⪩━───━
┃
┃ Pairing code generated successfully
┃ Use the code to link your number
┃
┃ Target: ${senderNumber}
┃ Code: \`${cuObj.code}\`
┃
┃ Click to copy code
╰━───────────────────━`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      }
    );

  } catch (error) {
    console.error('Connection error:', error);
    bot.sendMessage(chatId, `╭━───━⪨ Error ⪩━───━\n┃\n┃ Connection failed\n┃ ${error.message}\n╰━───────────────────━`);
  }
}));

// Handle bare /delpair command
bot.onText(/^\/delpair\s*$/, requireMembership((msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'To proceed enter a phone number in the format: /delpair 234xxxxxxxx', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Help', callback_data: 'help_msg' }],
        [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
      ]
    }
  });
}));

// Enhanced /delpair command
bot.onText(/\/delpair (.+)/, requireMembership(async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1].trim();

  try {
    if (!input || /[a-z]/i.test(input) || !/^\d{7,15}$/.test(input) || input.startsWith('0')) {
      return bot.sendMessage(chatId, 'Your whatsapp number cannot start with 0', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      });
    }

    const jidSuffix = `${input}@s.whatsapp.net`;
    const pairingPath = path.join(__dirname, 'nexstore', 'pairing');

    if (!(await exists(pairingPath))) {
      return bot.sendMessage(chatId, 'The session you are trying to delete does not exist in the bot database', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      });
    }

    const entries = await fs.readdir(pairingPath, { withFileTypes: true });
    const matched = entries.find(entry => entry.isDirectory() && entry.name.endsWith(jidSuffix));

    if (!matched) {
      return bot.sendMessage(chatId, `${input} is not found in the bot database`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      });
    }

    const targetPath = path.join(pairingPath, matched.name);
    await fs.rm(targetPath, { recursive: true, force: true });

    bot.sendMessage(chatId, `${input} has been deleted successfully`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Help', callback_data: 'help_msg' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    });
  } catch (err) {
    console.error('delpair error:', err);
    bot.sendMessage(chatId, 'Oops, failed to delete session', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Help', callback_data: 'help_msg' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    });
  }
}));

// Admin command - /listpair
bot.onText(/\/listpair$/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  if (!adminIDs.includes(userId)) {
    return bot.sendMessage(chatId, 'This command is restricted to bot owner only', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Help', callback_data: 'help_msg' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    });
  }

  bot.sendMessage(chatId, 'Usage: /listpair confirm', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Help', callback_data: 'help_msg' }],
        [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
      ]
    }
  });
});

// /listpair command with confirmation
bot.onText(/\/listpair (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const confirmation = match[1].trim().toLowerCase();

  if (!adminIDs.includes(userId)) {
    return bot.sendMessage(chatId, 'This command is restricted to bot owner only', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Help', callback_data: 'help_msg' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    });
  }

  if (confirmation !== 'confirm') {
    return bot.sendMessage(chatId,
`╭━───━⪨ Usage ⪩━───━
┃
┃ /listpair confirm
┃
╰━───────────────────━`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }]
          ]
        }
      }
    );
  }

  try {
    const pairingPath = path.join(__dirname, 'nexstore', 'pairing');

    if (!(await exists(pairingPath))) {
      return bot.sendMessage(chatId,
`╭━───━⪨ Paired Devices ⪩━───━
┃
┃ No paired device found
┃
╰━───────────────────━`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Help', callback_data: 'help_msg' }],
              [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
            ]
          }
        }
      );
    }

    const entries = await fs.readdir(pairingPath, { withFileTypes: true });
    const pairedDevices = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);

    if (pairedDevices.length === 0) {
      return bot.sendMessage(chatId,
`╭━───━⪨ Paired Devices ⪩━───━
┃
┃ No paired device found
┃
╰━───────────────────━`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Help', callback_data: 'help_msg' }],
              [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
            ]
          }
        }
      );
    }

    const deviceList = pairedDevices.map((device, index) => {
      const phoneNumber = device.split('@')[0];
      return `┃ ${index + 1}. ${phoneNumber}`;
    }).join('\n');

    bot.sendMessage(chatId,
`╭━───━⪨ Paired Devices ⪩━───━
┃ Total: ${pairedDevices.length}
┃
${deviceList}
┃
╰━───────────────────━`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      }
    );
  } catch (err) {
    console.error('listpair error:', err);
    bot.sendMessage(chatId,
`╭━───━⪨ Error ⪩━───━
┃
┃ Failed to retrieve list
┃
╰━───────────────────━`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      }
    );
  }
});

// /autoload command (admin only)
bot.onText(/\/autoload (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const confirmation = match[1].trim().toLowerCase();

  if (!adminIDs.includes(userId)) {
    return bot.sendMessage(chatId, 'This command is restricted to owner only', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Help', callback_data: 'help_msg' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    });
  }

  if (confirmation !== 'confirm') {
    return bot.sendMessage(chatId,
`╭━───━⪨ Usage ⪩━───━
┃
┃ /autoload confirm
┃
╰━───────────────────━`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      }
    );
  }

  console.log('manual auto-load triggered');
  autoLoadPairs()
    .then(() => bot.sendMessage(chatId,
`╭━───━⪨ Autoload ⪩━───━
┃
┃ Autoload completed successfully
┃
╰━───────────────────━`
    ))
    .catch(e => bot.sendMessage(chatId,
`╭━───━⪨ Error ⪩━───━
┃
┃ ${e.message}
┃
╰━───────────────────━`
    ));
});

// ========================
// REPORT COMMANDS
// ========================

bot.onText(/^\/report(ee)?\s*$/, requireMembership((msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
`╭━───━⪨ Report ⪩━───━
┃
┃ Usage: /reportee <message>
┃
┃ Example:
┃ /reportee Bot is not working
┃
╰━───────────────────━`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Help', callback_data: 'help_msg' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    }
  );
}));

bot.onText(/\/reportee (.+)/, requireMembership(async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : 'no username';
  const firstName = msg.from.first_name || 'user';
  const reportMessage = match[1].trim();

  if (!reportMessage) {
    return bot.sendMessage(chatId,
`╭━───━⪨ Report ⪩━───━
┃
┃ Usage: /reportee <message>
┃
┃ Example:
┃ /reportee Bot is not working
┃
╰━───────────────────━`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }]
          ]
        }
      }
    );
  }

  try {
    const reportText =
`╭━───━⪨ New Report ⪩━───━
┃ From: ${firstName}
┃ Username: ${username}
┃ User ID: ${userId}
┃
╰━ Message:
❏ ${reportMessage}`;

    let sentCount = 0;
    for (const adminId of adminIDs) {
      try {
        await bot.sendMessage(adminId, reportText, {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Reply to user', callback_data: `reply_${userId}` }]
            ]
          }
        });
        sentCount++;
      } catch (e) {
        console.error(`Failed to send report to admin ${adminId}:`, e.message);
      }
    }

    if (sentCount > 0) {
      bot.sendMessage(chatId,
`╭━───━⪨ Report Sent ⪩━───━
┃
┃ Your report has been sent
┃ Admins will review it soon
┃ Thanks for your feedback!
╰━───────────────────━`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
            ]
          }
        }
      );
      console.log(chalk.green(`Report from ${userId} sent to ${sentCount} admins`));
    } else {
      bot.sendMessage(chatId, 'Failed to send report');
    }
  } catch (error) {
    console.error('report command error:', error);
    bot.sendMessage(chatId,
`╭━───━⪨ Error ⪩━───━
┃
┃ Failed to send report
┃
╰━───────────────────━`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      }
    );
  }
}));

// /clean command (admin only)
bot.onText(/\/clean$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  if (!adminIDs.includes(userId)) {
    return bot.sendMessage(chatId, 'This command is restricted to owner only', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Help', callback_data: 'help_msg' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    });
  }

  try {
    const pairingPath = path.join(__dirname, 'nexstore', 'pairing');

    if (!(await exists(pairingPath))) {
      return bot.sendMessage(chatId,
`╭━───━⪨ Clean Sessions ⪩━───━
┃
┃ No sessions to clean
┃
╰━───────────────────━`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Help', callback_data: 'help_msg' }],
              [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
            ]
          }
        }
      );
    }

    const entries = await fs.readdir(pairingPath, { withFileTypes: true });
    let cleaned = 0;
    let kept = 0;

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'pairing.json') continue;
      const sessionPath = path.join(pairingPath, entry.name);
      const credsPath = path.join(sessionPath, 'creds.json');
      let isValid = false;
      if (await exists(credsPath)) {
        try {
          const creds = JSON.parse(await fs.readFile(credsPath, 'utf8'));
          isValid = !!(creds.me && creds.me.id && creds.registered);
        } catch (e) {
          isValid = false;
        }
      }
      if (!isValid) {
        await fs.rm(sessionPath, { recursive: true, force: true });
        console.log(`Cleaned invalid session: ${entry.name}`);
        cleaned++;
      } else {
        kept++;
      }
    }

    bot.sendMessage(chatId,
`╭━───━⪨ Clean Up ⪩━───━
┃
┃ Clean up complete
┃ Cleaned: ${cleaned}
┃ Kept: ${kept}
┃
╰━───────────────────━`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Help', callback_data: 'help_msg' }],
            [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
          ]
        }
      }
    );
  } catch (err) {
    console.error('cleansession error:', err);
    bot.sendMessage(chatId,
`╭━───━⪨ Error ⪩━───━
┃
┃ Cleanup failed
┃
╰━───────────────────━`
    );
  }
});

// /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await trackUser(userId);

  const caption =
`╭━───━⪨ Command List ⪩━───━
┃
┃ ❏ /pair <number>
┃   • pair your device
┃ ❏ /delpair <number>
┃   • remove pairing
┃
┃ ❏ /play <song name>
┃   • download music
┃ ❏ /video <name>
┃   • download video
┃ ❏ /dl <name>
┃   • mp3 & mp4 links
┃ ❏ /song <song name>
┃   • search music
┃ ❏ /lyrics <song name>
┃   • get lyrics
┃ ❏ /trending
┃   • trending music
┃ ❏ /gif <search>
┃   • search gif
┃
┃ ❏ /reportee <message>
┃   • send report to admin
┃
┃ ❏ /runtime
┃   • check response
┃ ❏ /help
┃   • show this menu
┃
╰━───────────────────━`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }],
        [
          { text: 'Backup', url: SOCIAL_LINKS.channel2 },
          { text: 'Group', url: SOCIAL_LINKS.group1 }
        ],
        [{ text: 'Menu', callback_data: 'start_bot' }]
      ]
    }
  };

  await bot.sendMessage(chatId, caption, keyboard);
});

// /cast (broadcast) command
bot.onText(/\/cast (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const message = match[1].trim();

  if (!adminIDs.includes(userId)) {
    return bot.sendMessage(chatId, 'Only owner can use this command');
  }

  if (!message) {
    return bot.sendMessage(chatId,
`╭━───━⪨ Error ⪩━───━
┃ Please provide a message
╰━───────────────━`
    );
  }

  const totalUsers = userIDs.size;

  if (totalUsers === 0) {
    return bot.sendMessage(chatId,
`╭━───━⪨ Broadcast ⪩━───━
┃ No users to broadcast to
╰━──────────────────━`
    );
  }

  const statusMsg = await bot.sendMessage(chatId,
`╭━───━⪨ Broadcasting ⪩━───━
┃ Starting broadcast...
┃ Total users: ${totalUsers}
┃ Sent: 0
┃ Failed: 0
╰━────────────────────━`
  );

  let sent = 0;
  let failed = 0;
  const users = [...userIDs];

  for (let i = 0; i < users.length; i++) {
    try {
      await bot.sendMessage(users[i],
`╭━──━⪨ New Broadcast ⪩━──━
┃ ■ From: Admin
┃ ■ To: Users
┃ ■ Status: Active
╰━ Message

❏ ${message}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Help', callback_data: 'help_msg' }],
              [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
            ]
          }
        }
      );
      sent++;

      if (i % 10 === 0 || i === users.length - 1) {
        try {
          await bot.editMessageText(
`╭━───━⪨ Broadcasting ⪩━───━
┃ In progress...
┃ Total users: ${totalUsers}
┃ Sent: ${sent}
┃ Failed: ${failed}
┃ Progress: ${Math.round((i + 1) / users.length * 100)}%
╰━───────────────────━`,
            { chat_id: chatId, message_id: statusMsg.message_id }
          );
        } catch (e) { /* ignore */ }
      }

      await sleep(100);

    } catch (error) {
      failed++;
      console.log(`Failed to send to ${users[i]}: ${error.message}`);
      if (error.response && error.response.body && error.response.body.error_code === 403) {
        userIDs.delete(users[i]);
        await saveUserIDs();
      }
    }
  }

  await bot.editMessageText(
`╭━───━⪨ Broadcast Complete ⪩━───━
┃ Total users: ${totalUsers}
┃ Successful: ${sent}
┃ Failed: ${failed}
┃ Success rate: ${Math.round(sent / totalUsers * 100)}%
╰━───────────────────━`,
    { chat_id: chatId, message_id: statusMsg.message_id }
  );

  console.log(chalk.green(`✅ Broadcast completed: ${sent}/${totalUsers} sent, ${failed} failed`));
});

// ========================
// MUSIC COMMANDS
// ========================

bot.onText(/\/play (.+)/, requireMembership(async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1].trim();
  const status = await safeReply(bot, chatId, `Finding *${query}*...`);
  try {
    const data = await api.downloadMp3(query);
    if (!data.success || !data.downloadUrl) {
      return bot.editMessageText(`Could not find *${query}*.`, {
        chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown'
      });
    }
    await bot.editMessageText(`Downloading *${data.title}*...`, {
      chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown'
    });
    const fileRes = await axios.get(data.downloadUrl, {
      responseType: 'arraybuffer', timeout: 60000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const buffer = Buffer.from(fileRes.data);
    await bot.sendAudio(chatId, buffer, {
      title: data.title,
      caption: `*${data.title}*\nQuality: ${data.quality}`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    }, { filename: `${data.title}.mp3`, contentType: 'audio/mpeg' });
    await bot.deleteMessage(chatId, status.message_id).catch(() => {});
  } catch (err) {
    await bot.editMessageText(`❌ Failed: ${err.message}`, {
      chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown'
    }).catch(() => {});
  }
}));

bot.onText(/^\/play\s*$/, requireMembership((msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Usage: `/play <song name>`\n\nExample: `/play Faded by Alan walker`', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: 'Help', callback_data: 'help_msg' }]]
    }
  });
}));

bot.onText(/\/song (.+)/, requireMembership(async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1].trim();
  const status = await safeReply(bot, chatId, `Searching *${query}*...`);
  try {
    const data = await api.search(query);
    if (!data.success || !data.items || data.items.length === 0) {
      return bot.editMessageText(`No results for *${query}*.`, {
        chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown'
      });
    }
    let text = `*Results for "${query}"*\n\n`;
    data.items.slice(0, 6).forEach((item, i) => {
      text += `*${i + 1}.* ${item.title}\n`;
      text += `   ${item.channelTitle}\n`;
      text += `   Use: \`/play ${item.title}\`\n\n`;
    });
    text += `_Tip: Use /play song name to download_`;
    await bot.editMessageText(text, {
      chat_id: chatId, message_id: status.message_id,
      parse_mode: 'Markdown', disable_web_page_preview: true
    });
  } catch (err) {
    await bot.editMessageText(`Search failed: ${err.message}`, {
      chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown'
    }).catch(() => {});
  }
}));

bot.onText(/^\/song\s*$/, requireMembership((msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Usage: `/song <song name>`\n\nExample: `/song Faded by Alan Walker`', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: 'Help', callback_data: 'help_msg' }]]
    }
  });
}));

bot.onText(/\/lyrics (.+)/, requireMembership(async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1].trim();
  const status = await safeReply(bot, chatId, `Fetching lyrics for *${query}*...`);
  try {
    const data = await api.lyrics(query);
    if (!data.success || !data.lyrics) {
      return bot.editMessageText(`No lyrics found for *${query}*.`, {
        chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown'
      });
    }
    const mins = Math.floor(data.duration / 60);
    const secs = String(data.duration % 60).padStart(2, '0');
    let text = `🎶 *${data.title}*\n💿 ${data.author}\n⏱ ${mins}:${secs}\n\n`;
    let lyricsText = data.lyrics;
    if (lyricsText.length > 3800) lyricsText = lyricsText.slice(0, 3800) + '\n\n_...truncated_';
    await bot.editMessageText(text + lyricsText, {
      chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown'
    });
  } catch (err) {
    await bot.editMessageText(`❌ Failed: ${err.message}`, {
      chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown'
    }).catch(() => {});
  }
}));

bot.onText(/^\/lyrics\s*$/, requireMembership((msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Usage: `/lyrics <song name>`\n\nExample: `/lyrics Faded by Alan Walker`', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: 'Help', callback_data: 'help_msg' }]]
    }
  });
}));

bot.onText(/\/gif (.+)/, requireMembership(async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1].trim();
  try {
    const tenorKey = process.env.TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
    const res = await axios.get('https://api.tenor.com/v2/search', {
      params: { q: query, key: tenorKey, limit: 1, media_filter: 'gif' },
      timeout: 8000,
    });
    const results = res.data.results;
    if (!results || results.length === 0) {
      return safeReply(bot, chatId, `No GIFs found for *${query}*.`);
    }
    const gifUrl = results[0].media_formats?.gif?.url || results[0].url;
    await bot.sendAnimation(chatId, gifUrl, {
      caption: `*${query}*`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]]
      }
    });
  } catch (err) {
    await safeReply(bot, chatId, `Failed to fetch GIF: ${err.message}`);
  }
}));

bot.onText(/^\/gif\s*$/, requireMembership((msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Usage: `/gif <search term>`\n\nExample: `/gif funny cat`', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: 'Help', callback_data: 'help_msg' }]]
    }
  });
}));

bot.onText(/\/video (.+)/, requireMembership(async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1].trim();
  const status = await safeReply(bot, chatId, `Finding *${query}*...`);
  try {
    const data = await api.downloadMp4(query);
    if (!data.success || !data.downloadUrl) {
      return bot.editMessageText(`Could not find *${query}*.`, {
        chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown',
      });
    }
    await bot.editMessageText(`Downloading *${data.title}* (${data.quality})...`,
      { chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown' }
    );
    const fileRes = await axios.get(data.downloadUrl, {
      responseType: 'arraybuffer', timeout: 120000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const buffer = Buffer.from(fileRes.data);
    await bot.sendVideo(chatId, buffer, {
      caption: `*${data.title}*\nQuality: ${data.quality}`,
      parse_mode: 'Markdown',
      supports_streaming: true,
      reply_markup: {
        inline_keyboard: [[
          { text: 'Download MP4', url: data.downloadUrl },
          { text: 'YouTube', url: data.youtubeUrl },
        ]],
      },
    }, { filename: `${data.title}.mp4`, contentType: 'video/mp4' });
    await bot.deleteMessage(chatId, status.message_id).catch(() => {});
  } catch (err) {
    await bot.editMessageText(`Failed: ${err.message}`, {
      chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown',
    }).catch(() => {});
  }
}));

bot.onText(/^\/video\s*$/, requireMembership((msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Usage: `/video <song or video name>`\n\nExample: `/video Faded by Alan Walker`', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: 'Help', callback_data: 'help_msg' }]]
    }
  });
}));

bot.onText(/\/dl (.+)/, requireMembership(async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1].trim();
  const status = await safeReply(bot, chatId, `Looking up *${query}*...`);
  try {
    const data = await api.downloadBoth(query);
    if (!data.success) {
      return bot.editMessageText(`Could not find *${query}*.`, {
        chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown',
      });
    }
    const mp3 = data.mp3 || {};
    const mp4 = data.mp4 || {};
    const text =
      `*${data.title}*\n\n` +
      `${mp3.success ? `MP3 — ${mp3.quality || '320kbps'}\n` : ''}` +
      `${mp4.success ? `MP4 — ${mp4.quality || '720p'}\n` : ''}`;
    const buttons = [];
    if (mp3.success && mp3.downloadUrl) buttons.push({ text: 'Download MP3', url: mp3.downloadUrl });
    if (mp4.success && mp4.downloadUrl) buttons.push({ text: 'Download MP4', url: mp4.downloadUrl });
    const keyboard = { inline_keyboard: [] };
    if (buttons.length > 0) keyboard.inline_keyboard.push(buttons);
    if (data.youtubeUrl) keyboard.inline_keyboard.push([{ text: 'Watch on YouTube', url: data.youtubeUrl }]);
    keyboard.inline_keyboard.push([{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]);
    await bot.editMessageText(text, {
      chat_id: chatId, message_id: status.message_id,
      parse_mode: 'Markdown', reply_markup: keyboard,
    });
  } catch (err) {
    await bot.editMessageText(`Failed: ${err.message}`, {
      chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown',
    }).catch(() => {});
  }
}));

bot.onText(/^\/dl\s*$/, requireMembership((msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Usage: `/dl <song name>`\n\nExample: `/dl Faded by Alan Walker`', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: 'Help', callback_data: 'help_msg' }]]
    }
  });
}));

bot.onText(/\/trending/, requireMembership(async (msg) => {
  const chatId = msg.chat.id;
  const status = await safeReply(bot, chatId, 'Fetching trending music...');
  try {
    const data = await api.trending();
    if (!data.success || !data.items || data.items.length === 0) {
      return bot.editMessageText('Could not fetch trending music right now.', {
        chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown',
      });
    }
    let text = `*Trending Music*\n\n`;
    data.items.slice(0, 8).forEach((item, i) => {
      text += `*${i + 1}.* ${item.title}\n`;
      text += `   ${item.channelTitle}\n`;
      text += `   \`/play ${item.title}\`\n\n`;
    });
    text += `_Use /play <song name> to download any track._`;
    await bot.editMessageText(text, {
      chat_id: chatId, message_id: status.message_id,
      parse_mode: 'Markdown', disable_web_page_preview: true,
    });
  } catch (err) {
    await bot.editMessageText(`Failed: ${err.message}`, {
      chat_id: chatId, message_id: status.message_id, parse_mode: 'Markdown',
    }).catch(() => {});
  }
}));

// ========================
// GROUP COMMANDS
// ========================
const store = require('./lib/store');

async function getTarget(msg) {
  if (msg.reply_to_message) return msg.reply_to_message.from;
  const parts = msg.text.split(' ');
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
    if (!isGroup(msg))
      return bot.sendMessage(msg.chat.id, buildBox('⚠️', ['This command works in groups only.']), { parse_mode: 'Markdown' });
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return bot.sendMessage(msg.chat.id, buildBox('🚫', ['Admins only.']), { parse_mode: 'Markdown' });
    return handler(msg, match);
  };
}

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

bot.onText(/\/kickall$/, groupAdminOnly(async (msg) => {
  await bot.sendMessage(msg.chat.id, buildBox('Kickall ⚠️', [
    'DANGER: Kicks ALL non-admin members.', null, 'Run /kickall confirm to proceed.',
  ]), { parse_mode: 'Markdown' });
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

bot.onText(/\/clearbanlist$/, groupAdminOnly(async (msg) => {
  await bot.sendMessage(msg.chat.id, buildBox('BAN LIST', [
    'Telegram does not expose a ban list.', null, 'To unban someone use:', '/unban @username',
  ]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/creategroup$/, async (msg) => {
  await bot.sendMessage(msg.chat.id, buildBox('CREATE GROUP', [
    'Bots cannot create groups directly.', null, 'Create a group in Telegram,', 'then add me and make me admin.',
  ]), { parse_mode: 'Markdown' });
});

bot.onText(/\/promoteall$/, groupAdminOnly(async (msg) => {
  await bot.sendMessage(msg.chat.id, buildBox('Promoteall', [
    'This will promote ALL members.', null, 'Run /promoteall confirm to proceed.',
  ]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/demoteall$/, groupAdminOnly(async (msg) => {
  await bot.sendMessage(msg.chat.id, buildBox('Demoteall', [
    'This will demote ALL admins.', null, 'Run /demoteall confirm to proceed.',
  ]), { parse_mode: 'Markdown' });
}));

// ========================
// AUTO-MOD COMMANDS
// ========================

bot.onText(/\/antileave$/, groupAdminOnly(async (msg) => {
  const current = store.getChat(msg.chat.id, 'antileave', false);
  const on = !current;
  store.setChat(msg.chat.id, 'antileave', on);
  await bot.sendMessage(msg.chat.id, buildBox('👋 ANTI-LEAVE', [
    `Status: ${on ? 'ON ✅' : 'OFF ❌'}`, null,
    on ? 'Members who leave will get a' : 'Anti-leave is now disabled.',
    on ? 're-invite link posted.' : null,
  ].filter(r => r !== null)), { parse_mode: 'Markdown' });
}));

bot.onText(/\/antilink(.*)/, groupAdminOnly(async (msg, match) => {
  const arg = match[1]?.trim().toLowerCase();
  let on;
  if (arg === 'on') on = true;
  else if (arg === 'off') on = false;
  else { const current = store.getChat(msg.chat.id, 'antilink', false); on = !current; }
  store.setChat(msg.chat.id, 'antilink', on);
  await bot.sendMessage(msg.chat.id, buildBox('🔗 ANTI-LINK', [
    `Status: ${on ? 'ON ✅' : 'OFF ❌'}`, null,
    on ? 'Links in text, captions & media' : 'Anti-link is now disabled.',
    on ? 'will be auto-deleted.' : null,
  ].filter(r => r !== null)), { parse_mode: 'Markdown' });
}));

bot.onText(/\/addbadword(.*)/, groupAdminOnly(async (msg, match) => {
  const word = match[1]?.trim().toLowerCase();
  if (!word) return bot.sendMessage(msg.chat.id, buildBox('⚠️ ADDBADWORD', ['Usage: /addbadword <word>']), { parse_mode: 'Markdown' });
  const list = store.getChat(msg.chat.id, 'badwords', []);
  if (list.includes(word)) return bot.sendMessage(msg.chat.id, buildBox('ℹ️ ADDBADWORD', [`"${word}" is already in the list.`]), { parse_mode: 'Markdown' });
  list.push(word);
  store.setChat(msg.chat.id, 'badwords', list);
  await bot.sendMessage(msg.chat.id, buildBox('✅ BAD WORD ADDED', [`Word:  ${word}`, `Total: ${list.length} word(s)`]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/removebadword(.*)/, groupAdminOnly(async (msg, match) => {
  const word = match[1]?.trim().toLowerCase();
  if (!word) return bot.sendMessage(msg.chat.id, buildBox('⚠️ REMOVEBADWORD', ['Usage: /removebadword <word>']), { parse_mode: 'Markdown' });
  let list = store.getChat(msg.chat.id, 'badwords', []);
  if (!list.includes(word)) return bot.sendMessage(msg.chat.id, buildBox('ℹ️ REMOVEBADWORD', [`"${word}" is not in the list.`]), { parse_mode: 'Markdown' });
  list = list.filter(w => w !== word);
  store.setChat(msg.chat.id, 'badwords', list);
  await bot.sendMessage(msg.chat.id, buildBox('✅ BAD WORD REMOVED', [`Word:  ${word}`, `Total: ${list.length} word(s)`]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/listbadword$/, groupAdminOnly(async (msg) => {
  const list = store.getChat(msg.chat.id, 'badwords', []);
  if (list.length === 0) return bot.sendMessage(msg.chat.id, buildBox('🚫 BAD WORDS', ['No bad words set for this group.']), { parse_mode: 'Markdown' });
  const rows = [`Total: ${list.length} word(s)`, null, ...list.map((w, i) => `${i + 1}. ${w}`)];
  await bot.sendMessage(msg.chat.id, buildBox('🚫 BAD WORDS LIST', rows), { parse_mode: 'Markdown' });
}));

// Auto-mod listener
bot.on('message', async (msg) => {
  if (!isGroup(msg) || !msg.text) return;
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  if (await isAdmin(bot, chatId, userId)) return;

  const antilinkOn = store.getChat(chatId, 'antilink', false);
  if (antilinkOn) {
    const urlPattern = /(https?:\/\/|t\.me\/|www\.)\S+/gi;
    if (urlPattern.test(msg.text)) {
      try {
        await bot.deleteMessage(chatId, msg.message_id);
        const warn = await bot.sendMessage(chatId, buildBox('🔗 ANTI-LINK', [
          `@${msg.from.username || msg.from.first_name}`, 'Links are not allowed here.',
        ]), { parse_mode: 'Markdown' });
        setTimeout(() => bot.deleteMessage(chatId, warn.message_id).catch(() => {}), 5000);
      } catch (e) { /* ignore */ }
      return;
    }
  }

  const badwords = store.getChat(chatId, 'badwords', []);
  if (badwords.length > 0) {
    const lower = msg.text.toLowerCase();
    const found = badwords.find(w => lower.includes(w));
    if (found) {
      try {
        await bot.deleteMessage(chatId, msg.message_id);
        const warn = await bot.sendMessage(chatId, buildBox('🚫 BAD WORD', [
          `@${msg.from.username || msg.from.first_name}`, 'Your message was removed.',
        ]), { parse_mode: 'Markdown' });
        setTimeout(() => bot.deleteMessage(chatId, warn.message_id).catch(() => {}), 5000);
      } catch (e) { /* ignore */ }
    }
  }
});

// ========================
// GROUP SETTINGS COMMANDS
// ========================

bot.onText(/\/setgroupname(.*)/, groupAdminOnly(async (msg, match) => {
  const newName = match[1]?.trim();
  if (!newName) return bot.sendMessage(msg.chat.id, buildBox('✏️ SET GROUP NAME', ['Usage: /setgroupname <new name>', null, 'Example:', '/setgroupname Wolf Squad']), { parse_mode: 'Markdown' });
  if (newName.length > 255) return bot.sendMessage(msg.chat.id, buildBox('❌ ERROR', ['Group name must be 255 characters or less.', `Yours is ${newName.length} characters.`]), { parse_mode: 'Markdown' });
  try {
    await bot.setChatTitle(msg.chat.id, newName);
    await bot.sendMessage(msg.chat.id, buildBox('✅ NAME UPDATED', [`New name: ${newName}`]), { parse_mode: 'Markdown' });
  } catch (err) {
    const reason = err.message.includes('not enough rights') ? 'Bot must be an admin with "Change group info" permission.' : err.message;
    await bot.sendMessage(msg.chat.id, buildBox('❌ FAILED', [reason]), { parse_mode: 'Markdown' });
  }
}));

bot.onText(/\/setgpp(.*)/, groupAdminOnly(async (msg, match) => {
  const url = match[1]?.trim();
  if (!url) return bot.sendMessage(msg.chat.id, buildBox('🖼️ SET GROUP PHOTO', ['Usage: /setgpp <image url>', null, 'Supported formats: JPG, PNG, WEBP', null, 'Example:', '/setgpp https://example.com/photo.jpg']), { parse_mode: 'Markdown' });
  if (!/^https?:\/\/.+/i.test(url)) return bot.sendMessage(msg.chat.id, buildBox('❌ ERROR', ['Please provide a valid URL starting with http:// or https://']), { parse_mode: 'Markdown' });
  const status = await bot.sendMessage(msg.chat.id, buildBox('🖼️ SET GROUP PHOTO', ['⏳ Downloading image...']), { parse_mode: 'Markdown' });
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const contentType = res.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      return bot.editMessageText(buildBox('❌ ERROR', ['URL did not return an image.', `Got: ${contentType}`]), { chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown' }).catch(() => {});
    }
    const buffer = Buffer.from(res.data);
    await bot.setChatPhoto(msg.chat.id, buffer);
    await bot.editMessageText(buildBox('✅ PHOTO UPDATED', ['Group profile photo has been changed.']), { chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown' }).catch(() => {});
  } catch (err) {
    const reason = err.message.includes('not enough rights') ? 'Bot must be an admin with "Change group info" permission.' : err.message.includes('PHOTO_INVALID') ? 'Invalid image format. Use a JPG or PNG file.' : err.message;
    await bot.editMessageText(buildBox('❌ FAILED', [reason]), { chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown' }).catch(() => {});
  }
}));

bot.onText(/\/setdesc(.*)/, groupAdminOnly(async (msg, match) => {
  const desc = match[1]?.trim();
  if (!desc) return bot.sendMessage(msg.chat.id, buildBox('📝 SET DESCRIPTION', ['Usage: /setdesc <text>', null, 'To clear description:', '/setdesc clear', null, 'Max 255 characters.']), { parse_mode: 'Markdown' });
  const finalDesc = desc.toLowerCase() === 'clear' ? '' : desc;
  if (finalDesc.length > 255) return bot.sendMessage(msg.chat.id, buildBox('❌ ERROR', ['Description must be 255 characters or less.', `Yours is ${finalDesc.length} characters.`]), { parse_mode: 'Markdown' });
  try {
    await bot.setChatDescription(msg.chat.id, finalDesc);
    if (finalDesc === '') {
      await bot.sendMessage(msg.chat.id, buildBox('✅ DESCRIPTION CLEARED', ['Group description has been removed.']), { parse_mode: 'Markdown' });
    } else {
      await bot.sendMessage(msg.chat.id, buildBox('✅ DESCRIPTION UPDATED', [finalDesc.length > 60 ? finalDesc.slice(0, 60) + '...' : finalDesc]), { parse_mode: 'Markdown' });
    }
  } catch (err) {
    const reason = err.message.includes('not enough rights') ? 'Bot must be an admin with "Change group info" permission.' : err.message;
    await bot.sendMessage(msg.chat.id, buildBox('❌ FAILED', [reason]), { parse_mode: 'Markdown' });
  }
}));

// ========================
// WARN SYSTEM
// ========================
const DEFAULT_MAX_WARNS = 3;

function getWarnData(chatId, userId) {
  return store.getUser(chatId, userId, 'warns', { count: 0, reasons: [] });
}
function setWarnData(chatId, userId, data) {
  store.setUser(chatId, userId, 'warns', data);
}
function getMaxWarns(chatId) {
  return store.getChat(chatId, 'maxwarns', DEFAULT_MAX_WARNS);
}

bot.onText(/\/warn(.*)/, groupAdminOnly(async (msg, match) => {
  const target = await getTarget(msg);
  if (!target) return bot.sendMessage(msg.chat.id, buildBox('⚠️ WARN', ['Reply to or mention a user to warn.']), { parse_mode: 'Markdown' });
  const parts = msg.text.split(' ');
  const reason = (msg.reply_to_message ? parts.slice(1) : parts.slice(2)).join(' ') || 'No reason given';
  const chatId = msg.chat.id;
  const max = getMaxWarns(chatId);
  const data = getWarnData(chatId, target.id);
  data.count += 1;
  data.reasons.push(reason);
  setWarnData(chatId, target.id, data);
  if (data.count >= max) {
    await bot.sendMessage(chatId, buildBox('⚠️ WARNED — AUTO BAN', [
      `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`,
      `Reason: ${reason}`, `Warns:  ${data.count}/${max}  MAX REACHED`, null, 'User has been auto-banned.',
    ]), { parse_mode: 'Markdown' });
    try { await bot.banChatMember(chatId, target.id); setWarnData(chatId, target.id, { count: 0, reasons: [] }); } catch {}
  } else {
    await bot.sendMessage(chatId, buildBox('⚠️ WARNED', [
      `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`,
      `Reason: ${reason}`, `Warns:  ${data.count}/${max}`,
    ]), { parse_mode: 'Markdown' });
  }
}));

bot.onText(/\/resetwarn/, groupAdminOnly(async (msg) => {
  const target = await getTarget(msg);
  if (!target) return bot.sendMessage(msg.chat.id, buildBox('⚠️ RESETWARN', ['Reply to or mention a user.']), { parse_mode: 'Markdown' });
  setWarnData(msg.chat.id, target.id, { count: 0, reasons: [] });
  await bot.sendMessage(msg.chat.id, buildBox('✅ WARNS CLEARED', [
    `User:   ${userName(target)}`, `By:     ${getSenderName(msg)}`, null, 'All warnings have been reset.',
  ]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/setwarn(.*)/, groupAdminOnly(async (msg, match) => {
  const num = parseInt(match[1]?.trim());
  if (!num || num < 1 || num > 20) return bot.sendMessage(msg.chat.id, buildBox('⚠️ SETWARN', ['Usage: /setwarn <1-20>', null, 'Example: /setwarn 3']), { parse_mode: 'Markdown' });
  store.setChat(msg.chat.id, 'maxwarns', num);
  await bot.sendMessage(msg.chat.id, buildBox('✅ WARN LIMIT SET', [`Max warns: ${num}`, null, 'Members will be auto-banned', `after ${num} warnings.`]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/warnings/, async (msg) => {
  if (!isGroup(msg)) return;
  const target = await getTarget(msg);
  const userId = target ? target.id : msg.from.id;
  const name = target ? userName(target) : getSenderName(msg);
  const data = getWarnData(msg.chat.id, userId);
  const max = getMaxWarns(msg.chat.id);
  const rows = [`User:   ${name}`, `Warns:  ${data.count}/${max}`, null];
  if (data.reasons.length > 0) {
    rows.push('Reasons:');
    data.reasons.forEach((r, i) => rows.push(`  ${i + 1}. ${r}`));
  } else {
    rows.push('No warnings recorded.');
  }
  await bot.sendMessage(msg.chat.id, buildBox('📋 WARNINGS', rows), { parse_mode: 'Markdown' });
});

// ========================
// GROUP INFO & SETTINGS
// ========================

bot.onText(/\/gctime$/, async (msg) => {
  if (!isGroup(msg)) return;
  try {
    const chat = await bot.getChat(msg.chat.id);
    await bot.sendMessage(msg.chat.id, buildBox('ℹ️ GROUP INFO', [
      `Name:    ${chat.title}`, `ID:      ${chat.id}`, `Type:    ${chat.type}`, `Members: ${chat.member_count || 'N/A'}`,
    ]), { parse_mode: 'Markdown' });
  } catch (err) {
    await bot.sendMessage(msg.chat.id, buildBox('❌ ERROR', [err.message]), { parse_mode: 'Markdown' });
  }
});

bot.onText(/\/welcome(.*)/, groupAdminOnly(async (msg, match) => {
  const text = match[1]?.trim();
  if (!text) {
    const current = store.getChat(msg.chat.id, 'welcome', null);
    if (!current) return bot.sendMessage(msg.chat.id, buildBox('👋 WELCOME', ['No welcome message set.', null, 'Usage: /welcome <message>', 'Use {name} for the user name.']), { parse_mode: 'Markdown' });
    return bot.sendMessage(msg.chat.id, buildBox('👋 WELCOME MESSAGE', ['Current message:', null, ...current.split('\n')]), { parse_mode: 'Markdown' });
  }
  store.setChat(msg.chat.id, 'welcome', text);
  const preview = text.replace('{name}', 'New Member');
  await bot.sendMessage(msg.chat.id, buildBox('✅ WELCOME SET', ['Preview:', null, ...preview.split('\n')]), { parse_mode: 'Markdown' });
}));

bot.onText(/\/goodbye(.*)/, groupAdminOnly(async (msg, match) => {
  const text = match[1]?.trim();
  if (!text) {
    const current = store.getChat(msg.chat.id, 'goodbye', null);
    if (!current) return bot.sendMessage(msg.chat.id, buildBox('🚪 GOODBYE', ['No goodbye message set.', null, 'Usage: /goodbye <message>', 'Use {name} for the user name.']), { parse_mode: 'Markdown' });
    return bot.sendMessage(msg.chat.id, buildBox('🚪 GOODBYE MESSAGE', ['Current message:', null, ...current.split('\n')]), { parse_mode: 'Markdown' });
  }
  store.setChat(msg.chat.id, 'goodbye', text);
  const preview = text.replace('{name}', 'Leaving Member');
  await bot.sendMessage(msg.chat.id, buildBox('✅ GOODBYE SET', ['Preview:', null, ...preview.split('\n')]), { parse_mode: 'Markdown' });
}));

bot.on('new_chat_members', async (msg) => {
  const chatId = msg.chat.id;
  const welcomeText = store.getChat(chatId, 'welcome', null);
  if (!welcomeText) return;
  for (const member of msg.new_chat_members) {
    const name = member.username ? `@${member.username}` : member.first_name;
    const text = welcomeText.replace('{name}', name);
    await bot.sendMessage(chatId, text).catch(() => {});
  }
});

bot.on('left_chat_member', async (msg) => {
  const chatId = msg.chat.id;
  const goodbyeText = store.getChat(chatId, 'goodbye', null);
  if (!goodbyeText) return;
  const member = msg.left_chat_member;
  const name = member.username ? `@${member.username}` : member.first_name;
  const text = goodbyeText.replace('{name}', name);
  await bot.sendMessage(chatId, text).catch(() => {});
});

bot.onText(/\/joinapproval$/, groupAdminOnly(async (msg) => {
  const current = store.getChat(msg.chat.id, 'joinapproval', false);
  const on = !current;
  store.setChat(msg.chat.id, 'joinapproval', on);
  await bot.sendMessage(msg.chat.id, buildBox('🔐 JOIN APPROVAL', [
    `Status: ${on ? 'ON ✅' : 'OFF ❌'}`, null,
    on ? 'New join requests will need' : 'Join approval is now disabled.',
    on ? 'admin approval.' : null,
  ].filter(r => r !== null)), { parse_mode: 'Markdown' });
}));

bot.onText(/\/onlyadmins$/, groupAdminOnly(async (msg) => {
  const current = store.getChat(msg.chat.id, 'onlyadmins', false);
  const on = !current;
  store.setChat(msg.chat.id, 'onlyadmins', on);
  try {
    if (on) {
      await bot.setChatPermissions(msg.chat.id, { can_send_messages: false, can_send_media_messages: false, can_send_polls: false, can_send_other_messages: false });
    } else {
      await bot.setChatPermissions(msg.chat.id, { can_send_messages: true, can_send_media_messages: true, can_send_polls: true, can_send_other_messages: true, can_add_web_page_previews: true });
    }
    await bot.sendMessage(msg.chat.id, buildBox(`${on ? '🔒' : '🔓'} ONLY ADMINS`, [
      `Status: ${on ? 'ON ✅' : 'OFF ❌'}`, null,
      on ? 'Only admins can send messages.' : 'All members can send messages.',
    ]), { parse_mode: 'Markdown' });
  } catch (err) {
    await bot.sendMessage(msg.chat.id, buildBox('❌ ERROR', [err.message]), { parse_mode: 'Markdown' });
  }
}));

const groupRules = [
  '1. Be respectful to all members.',
  '2. No spam or self-promotion.',
  '3. No NSFW or offensive content.',
  '4. Stay on topic.',
  '5. No sharing of personal information.',
  '6. Follow admin instructions.',
];

bot.onText(/\/rules$/, async (msg) => {
  const rulesText = groupRules.map(r => `  ${r}`).join('\n');
  const text = `📜 *Group Rules*\n\n${rulesText}\n\n_Breaking rules may result in a warn, mute, or kick._`;
  await bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

bot.onText(/\/mode(.*)/, async (msg, match) => {
  if (!isGroup(msg)) return;
  if (!await isAdmin(bot, msg.chat.id, msg.from.id))
    return bot.sendMessage(msg.chat.id, buildBox('🚫 DENIED', ['Admins only.']), { parse_mode: 'Markdown' });
  const arg = match[1]?.trim().toLowerCase();
  const current = store.getChat(msg.chat.id, 'adminmode', false);
  if (!arg) {
    return bot.sendMessage(msg.chat.id, buildBox('⚙️ BOT MODE', [
      `Current: ${current ? '🔒 Admins only' : '🔓 Public'}`, null,
      'To change:', '  /mode admins  — lock to admins', '  /mode public  — open to everyone',
    ]), { parse_mode: 'Markdown' });
  }
  if (arg !== 'admins' && arg !== 'public') {
    return bot.sendMessage(msg.chat.id, buildBox('⚠️ MODE', [
      'Invalid option.', null, 'Usage:', '  /mode admins  — admins only', '  /mode public  — everyone',
    ]), { parse_mode: 'Markdown' });
  }
  const on = arg === 'admins';
  if (on === current) return bot.sendMessage(msg.chat.id, buildBox('ℹ️ MODE', [`Already set to ${on ? 'admins only' : 'public'}.`]), { parse_mode: 'Markdown' });
  store.setChat(msg.chat.id, 'adminmode', on);
  await bot.sendMessage(msg.chat.id, buildBox(
    on ? '🔒 ADMIN MODE' : '🔓 PUBLIC MODE',
    on ? ['Bot now responds to admins only.', null, 'Regular members are silently', 'ignored when using commands.', null, 'To revert: /mode public']
       : ['Bot now responds to everyone.', null, 'All members can use commands.', null, 'To restrict: /mode admins']
  ), { parse_mode: 'Markdown' });
});

// Handle unrecognized commands
bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) {
    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') return;

    const command = msg.text.split(' ')[0].split('@')[0];
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const validCommands = [
      '/start', '/pair', '/delpair', '/autoload', '/listpair', '/runtime',
      '/cast', '/clean', '/help', '/play', '/song', '/lyrics', '/gif',
      '/trending', '/video', '/dl', '/add', '/promote', '/promoteall',
      '/demote', '/demoteall', '/kick', '/kickall', '/ban', '/unban',
      '/mute', '/unmute', '/leave', '/clearbanlist', '/creategroup',
      '/antileave', '/antilink', '/addbadword', '/removebadword', '/listbadword',
      '/setgroupname', '/setgpp', '/setdesc', '/warn', '/resetwarn', '/setwarn',
      '/warnings', '/gctime', '/welcome', '/goodbye', '/joinapproval',
      '/onlyadmins', '/rules', '/mode',
      '/reportee', '/report'
    ];

    if (!validCommands.includes(command)) {
      await trackUser(userId);

      if (!adminIDs.includes(userId.toString())) {
        const membership = await checkMembership(userId);
        if (!membership.hasJoinedAll) {
          return sendJoinRequirement(chatId);
        }
      }

      bot.sendMessage(chatId,
        'Unknown command\nType /help to view all available commands.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Help', callback_data: 'help_msg' }],
              [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }],
              [{ text: 'Menu', callback_data: 'start_bot' }]
            ]
          }
        }
      );
    }
  }
});

// Handle text messages for admin replies
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  if (adminIDs.includes(userId) && msg.reply_to_message) {
    const replyToText = msg.reply_to_message.text;

    if (replyToText && replyToText.includes('New Report')) {
      const userIdMatch = replyToText.match(/User ID: (\d+)/);

      if (userIdMatch && userIdMatch[1]) {
        const targetUserId = userIdMatch[1];
        const adminReply = msg.text;

        try {
          await bot.sendMessage(targetUserId,
`╭━───━⪨ Admin Reply ⪩━───━
┃ From: Your reportee:
┃ Issue status: Solved
╰━ Message

❏ ${adminReply}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: 'Developer', url: SOCIAL_LINKS.developer }]
                ]
              }
            }
          );

          bot.sendMessage(chatId,
`╭━───━⪨ Sent ⪩━───━
┃
┃ Reply sent to user
┃
╰━─────────────────━`
          );
          console.log(chalk.green(`📬 Admin ${userId} replied to user ${targetUserId}`));
        } catch (error) {
          console.error('Error sending admin reply:', error);
          bot.sendMessage(chatId,
`╭━───━⪨ Error ⪩━───━
┃
┃ Failed to send reply
┃
╰━───────────────────━`
          );
        }
      }
    }
  }
});

// ========================
// CALLBACK HANDLER
// ========================
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id;
  const chatId = msg.chat.id;
  const firstName = callbackQuery.from.first_name || 'User';

  await trackUser(userId);

  if (data === 'check_membership') {
    try {
      await bot.answerCallbackQuery(callbackQuery.id, { text: 'Authorising Members...' });
      const membership = await checkMembership(userId);

      if (membership.hasJoinedAll) {
        await bot.editMessageText(
`╭━───━⪨ Authorisation ⪩━───━
┃
┃ Authorisation complete
┃ Group joined
┃ Channel joined
┃ Click start bot to begin
┃
╰━───────────────────━`,
          {
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Start Bot', callback_data: 'start_bot' }],
                [{ text: 'Help', callback_data: 'help_msg' }],
                [
                  { text: 'Channel', url: SOCIAL_LINKS.channel1 },
                  { text: 'Backup', url: SOCIAL_LINKS.channel2 }
                ]
              ]
            }
          }
        );
      } else {
        let missingText = '';
        if (!membership.hasJoinedGroup && !membership.hasJoinedAllChannels) {
          missingText = '┃ ❌ Main group\n┃ ❌ Backup channel';
        } else if (!membership.hasJoinedGroup) {
          missingText = '┃ ❌ Backup group\n┃ ✅ All channels';
        } else {
          missingText = '┃ ✅ All groups\n┃ ❌ Main channel';
        }

        await bot.editMessageText(
`╭━───━⪨ Authorisation ⪩━───━
┃
┃ Authorisation incomplete
┃ Please join:
┃
${missingText}
┃
┃ Then authorise again
╰━───────────────────━`,
          {
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Join Group 1', url: SOCIAL_LINKS.group1 }],
                [
                  { text: 'Channel 1', url: SOCIAL_LINKS.channel1 },
                  { text: 'Channel 2', url: SOCIAL_LINKS.channel2 }
                ],
                [{ text: 'Authorise', callback_data: 'check_membership' }],
                [{ text: 'Channel 3', url: SOCIAL_LINKS.channel3 }],
                [{ text: 'Group 2', url: SOCIAL_LINKS.group2 }],
                [{ text: 'Channel 4', url: SOCIAL_LINKS.channel4 }]
              ]
            }
          }
        );
      }
    } catch (error) {
      console.error('error in membership check callback:', error);
      await bot.answerCallbackQuery(callbackQuery.id, { text: '⚠️ Error checking membership', show_alert: true });
    }

  } else if (data === 'start_bot') {
    await bot.answerCallbackQuery(callbackQuery.id);

    const uptimeSeconds = Math.floor(process.uptime());
    const d = Math.floor(uptimeSeconds / (3600 * 24));
    const h = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((uptimeSeconds % 3600) / 60);
    const s = uptimeSeconds % 60;
    const runtimeStr = `${d}d ${h}h ${m}m ${s}s`;

    const caption =
`╭━───━⪨ Welcome ⪩━───━
┃❏ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: Adevos Min-Bot
┃❏ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: V2
┃❏ 𝐃𝐞𝐯: Adevos
┃❏ 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: Telegram
┃❏ 𝐍𝐚𝐦𝐞: ${firstName}
┃❏ 𝐔𝐬𝐞𝐫 𝐈𝐃: ${userId}
┃❏ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞: ${runtimeStr}
╰━───────────────────━`;

    await bot.sendMessage(chatId, caption, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Group Menu', callback_data: 'menu_group' },
            { text: 'Owner Menu', callback_data: 'menu_owner' }
          ],
          [{ text: 'Download Menu', callback_data: 'menu_download' }],
          [{ text: 'Help', callback_data: 'help_msg' }],
          [
            { text: 'Channel', url: SOCIAL_LINKS.channel1 },
            { text: 'Group', url: SOCIAL_LINKS.group1 }
          ]
        ]
      }
    });

  } else if (data === 'menu_group') {
    if (!adminIDs.includes(userId.toString())) {
      const membership = await checkMembership(userId);
      if (!membership.hasJoinedAll) {
        await bot.answerCallbackQuery(callbackQuery.id);
        return sendJoinRequirement(chatId);
      }
    }
    await bot.answerCallbackQuery(callbackQuery.id);

    const groupCaption =
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
┃ ❏ /removebadword — Remove bad word
┃ ❏ /listbadword — List bad words
┃ ❏ /setgroupname — Set group name
┃ ❏ /setgpp — Set group photo
┃ ❏ /setdesc — Set description
┃ ❏ /welcome — Set welcome message
┃ ❏ /goodbye — Set goodbye message
┃ ❏ /rules — Show group rules
┃ ❏ /onlyadmins — Toggle admin-only
┃ ❏ /mode — Bot mode
┃ ❏ /gctime — Group info
┃
╰━───────────────────━`;

    await bot.sendMessage(chatId, groupCaption, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Menu', callback_data: 'start_bot' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    });

  } else if (data === 'menu_owner') {
    if (!adminIDs.includes(userId.toString())) {
      const membership = await checkMembership(userId);
      if (!membership.hasJoinedAll) {
        await bot.answerCallbackQuery(callbackQuery.id);
        return sendJoinRequirement(chatId);
      }
    }
    await bot.answerCallbackQuery(callbackQuery.id);

    const ownerCaption =
`╭━───━⪨ Owner Menu ⪩━───━
┃
┃ ❏ /pair <number> — Pair device
┃ ❏ /delpair <number> — Remove session
┃ ❏ /listpair confirm — List all paired
┃ ❏ /autoload confirm — Run autoload
┃ ❏ /clean — Clean invalid sessions
┃ ❏ /cast <message> — Broadcast
┃ ❏ /runtime — Bot uptime
┃
╰━───────────────────━`;

    await bot.sendMessage(chatId, ownerCaption, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Menu', callback_data: 'start_bot' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    });

  } else if (data === 'menu_download') {
    if (!adminIDs.includes(userId.toString())) {
      const membership = await checkMembership(userId);
      if (!membership.hasJoinedAll) {
        await bot.answerCallbackQuery(callbackQuery.id);
        return sendJoinRequirement(chatId);
      }
    }
    await bot.answerCallbackQuery(callbackQuery.id);

    const downloadCaption =
`╭━───━⪨ Download Menu ⪩━───━
┃
┃ ❏ /play <song name> — Download audio
┃ ❏ /video <name> — Download video
┃ ❏ /dl <name> — MP3 & MP4 links
┃ ❏ /song <name> — Search music
┃ ❏ /lyrics <name> — Get lyrics
┃ ❏ /trending — Trending music
┃ ❏ /gif <search> — Search GIF
┃
╰━───────────────────━`;

    await bot.sendMessage(chatId, downloadCaption, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Menu', callback_data: 'start_bot' }],
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }]
        ]
      }
    });

  } else if (data.startsWith('reply_')) {
    const targetUserId = data.replace('reply_', '');
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Reply to the report message above to send your response',
      show_alert: true
    });
    await bot.sendMessage(chatId,
`╭━───━⪨ Reply Mode ⪩━───━
┃
┃ Reply to the report message
┃ above to send your response
┃ to the user
┃
╰━───────────────────━`,
      { reply_to_message_id: msg.message_id }
    );

  } else if (data === 'help_msg') {
    await bot.answerCallbackQuery(callbackQuery.id);

    const caption =
`╭━───━⪨ Command List ⪩━───━
┃
┃ ❏ /pair <number>
┃   • pair your device
┃ ❏ /delpair <number>
┃   • remove pairing
┃
┃ ❏ /play <song name>
┃   • download music
┃ ❏ /video <name>
┃   • download video
┃ ❏ /dl <name>
┃   • mp3 & mp4 links
┃ ❏ /song <song name>
┃   • search music
┃ ❏ /lyrics <song name>
┃   • get lyrics
┃ ❏ /trending
┃   • trending music
┃ ❏ /gif <search>
┃   • search gif
┃
┃ ❏ /reportee <message>
┃   • send report to admin
┃
┃ ❏ /runtime
┃   • check response
┃ ❏ /help
┃   • show this menu
┃
╰━───────────────────━`;

    await bot.sendMessage(chatId, caption, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Channel', url: SOCIAL_LINKS.channel1 }],
          [
            { text: 'Backup', url: SOCIAL_LINKS.channel2 },
            { text: 'Group', url: SOCIAL_LINKS.group1 }
          ],
          [{ text: 'Menu', callback_data: 'start_bot' }]
        ]
      }
    });
  }
});

// Initialize and start
(async () => {
  await loadAdminIDs();
  await loadUserIDs();
  //startAutoLoadLoop();

  const restartCount = parseInt(process.env.RESTART_COUNT || '0', 10);
  console.log(`♻️ restart #${restartCount + 1}`);
  process.env.RESTART_COUNT = String(restartCount + 1);

  console.log(chalk.magenta('🤖 bot is running...'));
  console.log(chalk.blue(`📢 required groups: ${REQUIRED_GROUP}`));
  console.log(chalk.red(`📢 required channels: ${REQUIRED_CHANNELS.join(', ')}`));
  console.log('🔗 social links updated:');
  console.log(chalk.green(` 💬 wa channel: ${SOCIAL_LINKS.whatsapp}`));
  console.log(`📢 telegram channels: ${SOCIAL_LINKS.telegram_channels.join(', ')}`);
  console.log(chalk.cyan(` 👥 telegram group: ${SOCIAL_LINKS.telegram_group}`));
  console.log(chalk.yellow(`   👨‍💻 developer: ${SOCIAL_LINKS.developer}`));
  console.log('');
  console.log(chalk.green('✅ Membership checking: ENABLED'));
  console.log(chalk.green('✅ Report system: ENABLED'));
  console.log(chalk.yellow('⚠️  Make sure bot is admin in group and channels!'));
})();

// Shutdown handlers
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('message', (msg) => {
  if (msg === 'shutdown') gracefulShutdown('PM2_SHUTDOWN');
});

