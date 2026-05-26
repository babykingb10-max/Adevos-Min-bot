/**
 * Send a safe reply — catches errors silently so one bad message
 * never crashes the whole bot.
 */
async function safeReply(bot, chatId, text, options = {}) {
  try {
    return await bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...options });
  } catch (err) {
    console.error(`[safeReply] Failed to send message to ${chatId}: ${err.message}`);
  }
}

/**
 * Extract the username or first name from a Telegram message sender.
 */
function getSenderName(msg) {
  const user = msg.from;
  if (!user) return 'Unknown';
  return user.username ? `@${user.username}` : user.first_name || 'Unknown';
}

/**
 * Check if a message was sent in a group or supergroup.
 */
function isGroup(msg) {
  return msg.chat.type === 'group' || msg.chat.type === 'supergroup';
}

/**
 * Check if the sender is an admin in a group chat.
 */
async function isAdmin(bot, chatId, userId) {
  try {
    const member = await bot.getChatMember(chatId, userId);
    return ['administrator', 'creator'].includes(member.status);
  } catch {
    return false;
  }
}

/**
 * Format bytes into human-readable size string.
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * Escape special Markdown characters in a string.
 */
function escapeMarkdown(text) {
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { safeReply, getSenderName, isGroup, isAdmin, formatBytes, escapeMarkdown, sleep };

