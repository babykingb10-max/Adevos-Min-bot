require('./setting/config')
const { 
  default: baileys, proto, jidNormalizedUser, generateWAMessage, 
  generateWAMessageFromContent, getContentType, prepareWAMessageMedia 
} = require("@whiskeysockets/baileys");

const {
  downloadContentFromMessage, emitGroupParticipantsUpdate, emitGroupUpdate, 
  generateWAMessageContent, makeInMemoryStore, MediaType, areJidsSameUser, 
  WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState, 
  GroupMetadata, initInMemoryKeyStore, MiscMessageGenerationOptions, 
  useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, 
  WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto, 
  WALocationMessage, WAContextInfo, WAGroupMetadata, ProxyAgent, 
  waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, 
  WAContactsArrayMessage, WAGroupInviteMessage, WATextMessage, 
  WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, 
  MediariyuInfo, URL_REGEX, WAUrlInfo, WA_DEFAULT_EPHEMERAL, 
  WAMediaUpload, mentionedJɪsmm, processTime, Browser, MessageType, 
  Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers, 
  GroupSettingChange, DisriyuectReason, WASocket, getStream, WAProto, 
  isBaileys, AnyMessageContent, fetchLatestBaileysVersion, 
  templateMessage, InteractiveMessage, Header 
} = require("@whiskeysockets/baileys");
const runtimeUsage = require("./runtimeUsage");
const fs = require('fs')
const util = require('util')
const chalk = require('chalk')
const os = require('os')
const axios = require('axios')
const fsx = require('fs-extra')
const crypto = require('crypto')
const googleTTS = require('google-tts-api')
const ffmpeg = require('fluent-ffmpeg')
const speed = require('performance-now')
const timestampp = speed();
const jimp = require("jimp")
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);
const latensi = speed() - timestampp
const { fetchBuffer, buffergif } = require("./allfunc/myfunc5")
const moment = require('moment-timezone')
const yts = require('yt-search');
const ram = runtimeUsage();
const uploadImage = require('./allfunc/Data6');
const uploadFile  = require('./allfunc/Data7');
const ytdl = require('@vreden/youtube_scraper');
const { smsg, tanggal, getTime, isUrl, sleep, clockString, runtime, fetchJson, getBuffer, jsonformat, format, parseMention, getRandom, getGroupAdmins, generateProfilePicture } = require('./allfunc/storage')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid, addExif } = require('./allfunc/exif.js')
const Kingpic = fs.readFileSync(`./media/image1.jpg`)
const numberEmojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];
// At the very top of your index.js or main bot file
const tictactoeGames = {}; // Stores ongoing Tic-Tac-Toe games per chat
const hangmanGames = {};   // Stores ongoing Hangman games per chat
const hangmanVisual = [
    "😃🪓______", // 6 attempts left
    "😃🪓__|____",
    "😃🪓__|/___",
    "😃🪓__|/__",
    "😃🪓__|/\\_",
    "😃🪓__|/\\_", 
    "💀 Game Over!" // 0 attempts left
];
const { getSetting, setSetting } = require("./setting/Settings.js")
const groupCache = new Map(); // Cache group metadata

module.exports = King = async (King, m, chatUpdate, store) => {
const { from } = m
try {
      

const body = (
    m.mtype === "conversation" ? m.message?.conversation :
    m.mtype === "extendedTextMessage" ? m.message?.extendedTextMessage?.text :

    m.mtype === "imageMessage" ? m.message?.imageMessage?.caption :
    m.mtype === "videoMessage" ? m.message?.videoMessage?.caption :
    m.mtype === "documentMessage" ? m.message?.documentMessage?.caption || "" :
    m.mtype === "audioMessage" ? m.message?.audioMessage?.caption || "" :
    m.mtype === "stickerMessage" ? m.message?.stickerMessage?.caption || "" :

    m.mtype === "buttonsResponseMessage" ? m.message?.buttonsResponseMessage?.selectedButtonId :
    m.mtype === "listResponseMessage" ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId :
    m.mtype === "templateButtonReplyMessage" ? m.message?.templateButtonReplyMessage?.selectedId :
    m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg?.nativeFlowResponseMessage?.paramsJson).id :


    m.mtype === "messageContextInfo" ? m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || m.text :
    m.mtype === "reactionMessage" ? m.message?.reactionMessage?.text :
    m.mtype === "contactMessage" ? m.message?.contactMessage?.displayName :
    m.mtype === "contactsArrayMessage" ? m.message?.contactsArrayMessage?.contacts?.map(c => c.displayName).join(", ") :
    m.mtype === "locationMessage" ? `${m.message?.locationMessage?.degreesLatitude}, ${m.message?.locationMessage?.degreesLongitude}` :
    m.mtype === "liveLocationMessage" ? `${m.message?.liveLocationMessage?.degreesLatitude}, ${m.message?.liveLocationMessage?.degreesLongitude}` :
    m.mtype === "pollCreationMessage" ? m.message?.pollCreationMessage?.name :
    m.mtype === "pollUpdateMessage" ? m.message?.pollUpdateMessage?.name :
    m.mtype === "groupInviteMessage" ? m.message?.groupInviteMessage?.groupJid :

    m.mtype === "viewOnceMessage" ? (m.message?.viewOnceMessage?.message?.imageMessage?.caption ||
                                     m.message?.viewOnceMessage?.message?.videoMessage?.caption ||
                                     "[Pesan sekali lihat]") :
    m.mtype === "viewOnceMessageV2" ? (m.message?.viewOnceMessageV2?.message?.imageMessage?.caption ||
                                       m.message?.viewOnceMessageV2?.message?.videoMessage?.caption ||
                                       "[Pesan sekali lihat]") :
    m.mtype === "viewOnceMessageV2Extension" ? (m.message?.viewOnceMessageV2Extension?.message?.imageMessage?.caption ||
                                                m.message?.viewOnceMessageV2Extension?.message?.videoMessage?.caption ||
                                                "[Pesan sekali lihat]") :

    m.mtype === "ephemeralMessage" ? (m.message?.ephemeralMessage?.message?.conversation ||
                                      m.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
                                      "[Pesan sementara]") :

    m.mtype === "interactiveMessage" ? "[Pesan interaktif]" :

    m.mtype === "protocolMessage" ? "[Pesan telah dihapus]" :

    ""
);
global.autoViewStatus = false;
global.autoLikeStatus = false;
const prefix = '.'; // Only dot as prefix
const owner = JSON.parse(fs.readFileSync('./allfunc/owner.json'))
const Premium = JSON.parse(fs.readFileSync('./allfunc/premium.json'))
const isCmd = body && body.startsWith(prefix);
//const isCmd = body && body.startsWith && body.startsWith(prefix);
const args = body.slice(prefix.length).trim().split(/ +/); // everything after the dot
const command = args.shift().toLowerCase(); // first word is the command
const text = args.join(" ")
const footer = '\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀᴅᴇᴠᴏꜱ-x ᴛᴇᴄʜ'// ɢʟᴏʙᴀʟ ғᴏᴏᴛᴇʀ
const botNumber = await  King.decodeJid(King.user.id)
const isCreator = [botNumber, ...owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
const isDev = owner
  .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
  const isOwner = [botNumber, ...owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
const isPremium = [botNumber, ...Premium].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
const qtext = q = args.join(" ")
const quoted = m.quoted ? m.quoted : m
const from = mek.key.remoteJid
const { spawn: spawn, exec } = require('child_process')
const isGroup = typeof from === "string" && from.endsWith("@g.us");
const sender = m.isGroup ? (m.key.participant ? m.key.participant : m.participant) : m.key.remoteJid
const groupMetadata = m.isGroup ? await King.groupMetadata(from).catch(e => {}) : ''
let participants = []
if (m.isGroup) {
    const groupMetadata = await King.groupMetadata(m.chat)
    participants = groupMetadata.participants
}

const groupAdmins = m.isGroup ? getGroupAdmins(participants) : []
const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
const groupName = m.isGroup ? groupMetadata.subject : "";
const pushname = m.pushName || "No Name"
const time = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('HH:mm:ss z')
const mime = (quoted.msg || quoted).mimetype || ''
const todayDateWIB = new Date().toLocaleDateString('id-ID', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
const githubstalk = require('./allfunc/githubstalk')
const npmstalk = require('./allfunc/npmstalk')
const bubbleCharMap = {
    'a':'ⓐ','b':'ⓑ','c':'ⓒ','d':'ⓓ','e':'ⓔ','f':'ⓕ','g':'ⓖ','h':'ⓗ','i':'ⓘ','j':'ⓙ',
    'k':'ⓚ','l':'ⓛ','m':'ⓜ','n':'ⓝ','o':'ⓞ','p':'ⓟ','q':'ⓠ','r':'ⓡ','s':'ⓢ','t':'ⓣ',
    'u':'ⓤ','v':'ⓥ','w':'ⓦ','x':'ⓧ','y':'ⓨ','z':'ⓩ',
    'A':'Ⓐ','B':'Ⓑ','C':'Ⓒ','D':'Ⓓ','E':'Ⓔ','F':'Ⓕ','G':'Ⓖ','H':'Ⓗ','I':'Ⓘ','J':'Ⓙ',
    'K':'Ⓚ','L':'Ⓛ','M':'Ⓜ','N':'Ⓝ','O':'Ⓞ','P':'Ⓟ','Q':'Ⓠ','R':'Ⓡ','S':'Ⓢ','T':'Ⓣ',
    'U':'Ⓤ','V':'Ⓥ','W':'Ⓦ','X':'Ⓧ','Y':'Ⓨ','Z':'Ⓩ'
};
const glitchCharMap = {
    'a':'̷a','b':'̷b','c':'̷c','d':'̷d','e':'̷e','f':'̷f','g':'̷g','h':'̷h','i':'̷i',
    'j':'̷j','k':'̷k','l':'̷l','m':'̷m','n':'̷n','o':'̷o','p':'̷p','q':'̷q','r':'̷r',
    's':'̷s','t':'̷t','u':'̷u','v':'̷v','w':'̷w','x':'̷x','y':'̷y','z':'̷z',
    'A':'̷A','B':'̷B','C':'̷C','D':'̷D','E':'̷E','F':'̷F','G':'̷G','H':'̷H','I':'̷I',
    'J':'̷J','K':'̷K','L':'̷L','M':'̷M','N':'̷N','O':'̷O','P':'̷P','Q':'̷Q','R':'̷R',
    'S':'̷S','T':'̷T','U':'̷U','V':'̷V','W':'̷W','X':'̷X','Y':'̷Y','Z':'̷Z'
};
const fancyCharMap = {
    'a': '𝒜', 'b': 'ℬ', 'c': '𝒞', 'd': '𝒟', 'e': 'ℰ', 'f': 'ℱ', 'g': '𝒢',
    'h': 'ℋ', 'i': 'ℐ', 'j': '𝒥', 'k': '𝒦', 'l': 'ℒ', 'm': 'ℳ', 'n': '𝒩',
    'o': '𝒪', 'p': '𝒫', 'q': '𝒬', 'r': 'ℛ', 's': '𝒮', 't': '𝒯', 'u': '𝒰',
    'v': '𝒱', 'w': '𝒲', 'x': '𝒳', 'y': '𝒴', 'z': '𝒵',
    'A': '𝒜', 'B': 'ℬ', 'C': '𝒞', 'D': '𝒟', 'E': 'ℰ', 'F': 'ℱ', 'G': '𝒢',
    'H': 'ℋ', 'I': 'ℐ', 'J': '𝒥', 'K': '𝒦', 'L': 'ℒ', 'M': 'ℳ', 'N': '𝒩',
    'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': 'ℛ', 'S': '𝒮', 'T': '𝒯', 'U': '𝒰',
    'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵',
};
async function loading() {
    const toki = [
        `𝕬𝖉𝖊𝖛𝖔𝖘 𝖒𝖎𝖓-𝖇𝖔𝖙 𝖎𝖓𝖎𝖙𝖎𝖆𝖑𝖎𝖟𝖎𝖓𝖌...`,

        `𝕬𝖉𝖊𝖛𝖔𝖘 𝖒𝖎𝖓-𝖇𝖔𝖙 𝖈𝖔𝖓𝖓𝖊𝖈𝖙𝖊𝖉...`
    ];

    // Send initial message
    let msg = await King.sendMessage(from, { text: "𝕬𝖉𝖊𝖛𝖔𝖘 𝖒𝖎𝖓-𝖇𝖔𝖙 𝖎𝖓𝖎𝖙𝖎𝖆𝖑𝖎𝖟𝖎𝖓𝖌....." });

    // Loop to edit same message
    for (let i = 0; i < toki.length; i++) {
        await King.sendMessage(from, {
            text: toki[i],
            edit: msg.key
        });
        await new Promise(resolve => setTimeout(resolve, 200)); // smooth delay
    }
}
const reply = (teks) => {
    King.sendMessage(m.chat, {
        text: teks,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 2,
            isForwarded: false,
            forwardedNewsletterMessageInfo: {
                newsletterName: "𝐀𝐝𝐞𝐯𝐨𝐬-𝐗 𝐓𝐞𝐜𝐡 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥",
                newsletterJid: "120363408344756821@newsletter", // Updated JID
            },
        }
    }, { quoted: m });
}
async function sendImage(imageUrl, caption) {
  King.sendMessage(m.chat, {
    image: { url: imageUrl },
    caption,
    contextInfo: {
      forwardingScore: 2,
      isForwarded: false,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363408344756821@newsletter",
        newsletterName: "𝐀𝐝𝐞𝐯𝐨𝐬-𝐗 𝐓𝐞𝐜𝐡 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥",
      }
    }
  }, { quoted: m });
}
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);
const Kingie = "𝗔𝗗𝗘𝗩𝗢𝗦_𝗠𝗜𝗡_𝗕𝗢𝗧_𝗗𝗢𝗠𝗔𝗜𝗡";
if (!King.public) {
if (!isCreator) return
}
const example = (teks) => {
return `Usage : *${prefix+command}* ${teks}`
}
if (!global.banned) global.banned = {} // stores banned users JIDs
if (getSetting(m.sender, "autobio", false)) {
    King.updateProfileStatus(`ᴀᴅᴇᴠᴏꜱ-x ᴛᴇᴄʜ | ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀᴅᴇᴠᴏꜱ`).catch(_ => _)
}
if (isCmd)  {
    console.log(chalk.black(chalk.bgWhite('[ᴀᴅᴇᴠᴏꜱ-x]')), chalk.black(chalk.bgGreen(new Date)), chalk.black(chalk.bgBlue(body || m.mtype)) + '\n' + chalk.magenta('=> From'), chalk.green(pushname), chalk.yellow(m.sender) + '\n' + chalk.blueBright('=>In'), chalk.green(m.isGroup ? pushname : 'Private Chat', m.chat))
}

if (getSetting(m.chat, "autoReact", false)) {
    const emojis = [
        "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊",
        "😍", "😘", "😎", "🤩", "🤔", "😏", "😣", "😥", "😮", "🤐",
        "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓",
        "😔", "😕", "🙃", "🤑", "😲", "😖", "😞", "😟", "😤", "😢",
        "😭", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳",
        "🤪", "🀄", "😠", "🀄", "😷", "🤒", "🤕", "🤢", "🤮", "🤧",
        "😇", "🥳", "🤠", "🤡", "🤥", "🤫", "🤭", "🧐", "🤓", "😈",
        "👿", "👹", "👺", "💀", "👻", "🖕", "🙏", "🤖", "🎃", "😺",
        "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "💋", "💌",
        "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💟", "💔", "❤️"
    ];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    try {
        await King.sendMessage(m.chat, {
            react: { text: randomEmoji, key: m.key },
        });
    } catch (err) {
        console.error('Error while reacting:', err.message);
    }
}

if (getSetting(m.chat, "autoTyping", false)) {
    King.sendPresenceUpdate('composing', from)
}
if (getSetting(m.chat, "autoRecording", false)) {
    King.sendPresenceUpdate('recording', from)
}
if (getSetting(m.chat, "autoRecordType", false)) {
    let xeonrecordin = ['recording','composing']
    let xeonrecordinfinal = xeonrecordin[Math.floor(Math.random() * xeonrecordin.length)]
    King.sendPresenceUpdate(xeonrecordinfinal, from)
}
     
//----------------------Func End----------------//

if (getSetting(m.chat, "autoRecording", false)) {
    King.sendPresenceUpdate('recording', from)
}  
    
if (getSetting(m.chat, "autoTyping", false)) {
    King.sendPresenceUpdate('composing', from)
}

if (getSetting(m.chat, "autoRecordType", false)) {
    let xeonrecordin = ['recording','composing']
    let xeonrecordinfinal = xeonrecordin[Math.floor(Math.random() * xeonrecordin.length)]
    King.sendPresenceUpdate(xeonrecordinfinal, from)
}

if (getSetting(m.sender, "autoread", false)) {
   try {
      await King.readMessages([m.key]) 
   } catch (e) {
      console.log("Auto-Read Error:", e)
   }
}

if (getSetting(m.sender, "banned", false)) {
    await King.sendMessage(m.chat, { text: `⛔ You are banned from using this bot, @${m.sender.split('@')[0]}`, mentions: [m.sender] }, { quoted: m })
    return
}

if (getSetting(m.chat, "feature.autoreply", false)) {
   const autoReplyList = { "hi": "Hello 👋", "hello": "Hi there!", "I am Adevos-X 🥷": "Coolest Whatsapp bot 😌" }
   if (autoReplyList[m.text?.toLowerCase()]) {
      await King.sendMessage(m.chat, { text: autoReplyList[m.text.toLowerCase()] }, { quoted: m })
   }
}
if (getSetting(m.chat, "feature.antibadword", false)) {
   const badWords = ["fuck", "bitch", "sex", "nigga","bastard","fool","mumu","idiot","werey","mad","dick","pussy","bast"]
   if (badWords.some(word => m.text?.toLowerCase().includes(word))) {
      await King.sendMessage(m.chat, { text: `❌ @${m.sender.split('@')[0]} watch your language 😟!`, mentions: [m.sender] })
      await King.sendMessage(m.chat, { delete: m.key })
   }
}

const antilinkDB = JSON.parse(fs.readFileSync('./database/antilink.json'))
const warnDB = JSON.parse(fs.readFileSync('./database/warnings.json'))

const saveAntilink = () =>
  fs.writeFileSync('./database/antilink.json', JSON.stringify(antilinkDB, null, 2))

const saveWarn = () =>
  fs.writeFileSync('./database/warnings.json', JSON.stringify(warnDB, null, 2))
  
  const linkRegex = /(?:https?:\/\/|www\.|chat\.whatsapp\.com\/|t\.me\/|wa\.me\/|bit\.ly\/|tinyurl\.com\/|[a-z0-9-]+\.(com|net|org|ng|io|gg|co|me|xyz))/i



  
if (m.isGroup && antilinkDB[m.chat]?.enabled && !isAdmins && !isCreator && m.text) {
  if (linkRegex.test(m.text)) {
    const mode = antilinkDB[m.chat].mode || 'delete';

    // ALWAYS DELETE THE LINK
    await King.sendMessage(m.chat, { delete: m.key }).catch(() => {});

    // ======================
    // MODE: KICK IMMEDIATELY
    // ======================
    if (mode === 'kick') {
      try {
        await King.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        await King.sendMessage(m.chat, {
          text: `@${m.sender.split('@')[0]} _was removed for sending a forbidden link_`,
          mentions: [m.sender]
        });
      } catch (err) {
        await King.sendMessage(m.chat, {
          text: `⚠️ Cannot kick @${m.sender.split('@')[0]}. Make sure I am admin.`,
          mentions: [m.sender]
        });
      }
      return; // stop further processing
    }

    // =========================================================================================================
    // MODE: WARN THEN KICK
    // ========================================================================================================
    if (mode === 'warn') {
      if (!warnDB[m.chat]) warnDB[m.chat] = {};
      if (!warnDB[m.chat][m.sender]) warnDB[m.chat][m.sender] = 0;

      warnDB[m.chat][m.sender] += 1;
      saveWarn();

      const warnCount = warnDB[m.chat][m.sender];

      if (warnCount < 3) {
        await King.sendMessage(m.chat, {
          text: `@${m.sender.split('@')[0]} _*links are forbidden in this group Warns: ${warnCount}/3*_`,
          mentions: [m.sender]
        });
      } else {
        try {
        await King.sendMessage(m.chat, {
            text: `@${m.sender.split('@')[0]} _*was removed for sending links Warn limit exceeded 3/3*_`,
            mentions: [m.sender]
          });
          await King.groupParticipantsUpdate(m.chat, [m.sender], 'remove');  
        } catch (err) {
          await King.sendMessage(m.chat, {
            text: `⚠️ Cannot kick @${m.sender.split('@')[0]}. Make sure I am admin.`,
            mentions: [m.sender]
          });
        }

        delete warnDB[m.chat][m.sender];
        saveWarn();
      }
      return; // stop further processing
    }

    // ======================
    // MODE: DELETE ONLY
    // ======================
    if (mode === 'delete') {
      await King.sendMessage(m.chat, {
        text: `@${m.sender.split('@')[0]} _*links are not allowed in this group*_`,
        mentions: [m.sender]
      });
      return; // stop further processing
    }
  }
}

//================================================= FUNCTION TO MAKE COMMANDS WORK ONLY WHEN YOU USE PREFIX==========//
function usedWithPrefix(m, command, prefix) {
    if (!m.text) return false
    return m.text.trim().startsWith(prefix + command)
}

// Anti-bot check (only in groups)
if (m.isGroup && getSetting(m.chat, "feature.antibot", false)) {
    let botPrefixes = ['.', '!', '/', '#'];
    let firstChar = m.text?.trim()[0];

    if (firstChar && botPrefixes.includes(firstChar)) {
        if (m.sender !== ownerNumber + "@s.whatsapp.net") {
            await King.sendMessage(m.chat, {
                text: `🤖 Anti-Bot active! @${m.sender.split('@')[0]} not allowed.`,
                mentions: [m.sender]
            });

            // Proper delete method for most libraries
            if (King.deleteMessage) {
                await King.deleteMessage(m.chat, m.key);
            }
        }
    }
}

const randomEmoji = () => {
  const pool = ['🔥','😍','👌','😂','😮','❤️','💯','👏','🤔','🥱','😅','🤬','🥶','🤡','😎','🤓','🌟','✅','💯'];
  return pool[Math.floor(Math.random() * pool.length)];
};
//=================================================================
async function sendPoll(jid, text, list) {
King.relayMessage(jid, {
"pollCreationMessage": {
"name": text,
"options": list.map(v => { return { optionName: v } }),
"selectableOptionsCount": list.length
}
}, {})
}
function getCurrentTime() {
    const moment = require('moment-timezone');

    // Set timezone
    const tz = "Africa/Lagos";
    const now = moment().tz(tz);

    const date = now.format("YYYY-MM-DD");
    const time = now.format("HH:mm:ss");
    const day = now.format("dddd");

    return `
TIME: 🕰️ *Current Bot Time:*

📅 *Date:* ${date}
🕒 *Time:* ${time} (${tz})
📆 *Day:* ${day}
`;
}
// ===============
// EMOJI EDITING 
// ===============

async function editEmoji(King, m, sequence) {
    // Send initial message
    let msg = await King.sendMessage(m.chat, { text: sequence[0] }, { quoted: m });

    // Edit message step-by-step
    for (let i = 1; i < sequence.length; i++) {
        await new Promise(res => setTimeout(res, 550)); // speed
        await King.sendMessage(m.chat, { 
            text: sequence[i], 
            edit: msg.key 
        });
    }
}

const epPhoto = {
    glitchtext:        { slug: 'glitchtext', emoji: '⚡' },
    writetext:         { slug: 'writetext', emoji: '✍️' },
    advancedglow:      { slug: 'advancedglow', emoji: '✨' },
    typographytext:    { slug: 'typographytext', emoji: '🎨' },
    pixelglitch:       { slug: 'pixelglitch', emoji: '🟪' },
    neonglitch:        { slug: 'neonglitch', emoji: '💡' },
    flagtext:          { slug: 'flagtext', emoji: '🚩' },
    flag3dtext:        { slug: 'flag3dtext', emoji: '🧱' },
    deletingtext:      { slug: 'deletingtext', emoji: '🗑️' },
    blackpinkstyle:    { slug: 'blackpinkstyle', emoji: '🩷' },
    glowingtext:       { slug: 'glowingtext', emoji: '🌟' },
    underwatertext:    { slug: 'underwatertext', emoji: '🌊' },
    logomaker:         { slug: 'logomaker', emoji: '🏷️' },
    cartoonstyle:      { slug: 'cartoonstyle', emoji: '🎭' },
    papercutstyle:     { slug: 'papercutstyle', emoji: '📄' },
    watercolortext:    { slug: 'watercolortext', emoji: '💧' },
    effectclouds:      { slug: 'effectclouds', emoji: '☁️' },
    blackpinklogo:     { slug: 'blackpinklogo', emoji: '💖' },
    gradienttext:      { slug: 'gradienttext', emoji: '🌈' },
    summerbeach:       { slug: 'summerbeach', emoji: '🏖️' },
    luxurygold:        { slug: 'luxurygold', emoji: '🥇' },
    multicoloredneon:  { slug: 'multicoloredneon', emoji: '🎆' },
    sandsummer:        { slug: 'sandsummer', emoji: '🏝️' },
    galaxywallpaper:   { slug: 'galaxywallpaper', emoji: '🌌' },
    style1917:         { slug: 'style1917', emoji: '🕰️' },
    maKingeon:        { slug: 'maKingeon', emoji: '💡' },
    royaltext:         { slug: 'royaltext', emoji: '👑' },
    freecreate:        { slug: 'freecreate', emoji: '🎉' },
    galaxystyle:       { slug: 'galaxystyle', emoji: '🌠' },
    lighteffects:      { slug: 'lighteffects', emoji: '💥' }
};

async function generateEPPhoto(command, args, from, m, King) {
    try {
        if (!args || args.length < 1) {
            return King.sendMessage(
                from,
                { text: `❗Please provide text!\n*Example: .${command} Hello World*` },
                { quoted: m }
            );
        }

        const text = args.join(" ");
        const item = epPhoto[command];

        if (!item) {
            return King.sendMessage(from, { text: "⚠️ Unknown command." }, { quoted: m });
        }

        // ✨ LOADING MESSAGE
        const loading = await King.sendMessage(
            from,
            { text: `🔁 Generating ${item.emoji} ${command} photo...` },
            { quoted: m }
        );

        // Build API URL
        const apiUrl = `https://apis.prexzyvilla.site/${item.slug}?text=${encodeURIComponent(text)}`;

        // Fetch the image
        const result = await fetch(apiUrl);
        if (!result.ok) throw new Error("API request failed!");

        const buffer = Buffer.from(await result.arrayBuffer());

        // 🖼️ Send final image
        await King.sendMessage(
            from,
            {
                image: buffer,
                caption: `${item.emoji} *${command.toUpperCase()}*\n\n✅ Generated for: ${text}`
            },
            { quoted: m }
        );


    } catch (err) {
        console.error(`Error in ${command}:`, err);

        await King.sendMessage(
            from,
            { text: `⚠️ Error generating ${command}. Please try again later.` },
            { quoted: m }
        );
    }
}

// Mapping of commands to API slugs and emoji/caption
const celebrities = {
    zuck: { slug: 'mark-zuckerberg', emoji: '🧑🏻‍💻' },
    ronaldo: { slug: 'cristiano-ronaldo', emoji: '⚽' },
    billgates: { slug: 'bill-gates', emoji: '💼' },
    elonmusk: { slug: 'elon-musk', emoji: '🚀' },
    justinbieber: { slug: 'justin-bieber', emoji: '🎤' },
    donaldtrump: { slug: 'donald-trump', emoji: '🇺🇸' },
    joebiden: { slug: 'joe-biden', emoji: '🇺🇸' },
    johnnysins: { slug: 'johnny-sins', emoji: '🧑' },
    miakhalifa: { slug: 'mia-khalifa', emoji: '🔥' },
    therock: { slug: 'the-rock', emoji: '💪' },
    rihanna: { slug: 'rihanna', emoji: '💃' },
    taylorswift: { slug: 'taylor-swift', emoji: '🎶' },
    tomcruise: { slug: 'tom-cruise', emoji: '🎬' },
    tomholland: { slug: 'tom-holland', emoji: '🕸️' }
};

async function generateCelebrityTweet(command, args, from, m, King) {
    try {
        if (!args || args.length < 1) {
            return King.sendMessage(from, { 
                text: `❗Please provide text!\n*Example: .${command} hello world*` 
            }, { quoted: m });
        }

        const text = args.join(" ");
        const celeb = celebrities[command];

        if (!celeb) {
            return King.sendMessage(from, { text: '⚠️ Unknown command.' }, { quoted: m });
        }

        m.reply(`🔁 Generating ${celeb.emoji} ${command} tweet...`);

        const apiUrl = `https://api.nexoracle.com/xtweets/${celeb.slug}?apikey=10541f05658586025e&text=${encodeURIComponent(text)}`;

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("API request failed!");

        const buffer = Buffer.from(await res.arrayBuffer());

        await King.sendMessage(from, {
            image: buffer,
            caption: `${celeb.emoji} ${command.charAt(0).toUpperCase() + command.slice(1)} tweeted:\n\n${text}`
        }, { quoted: m });

        console.log(`✅ ${command} tweet generated successfully`);
    } catch (error) {
        console.error(`Error in ${command} command:`, error);
        await King.sendMessage(from, { 
            text: `⚠️ Error while generating ${command} tweet. Please try again later.` 
        }, { quoted: m });
    }
}


//LOADING FUNCTION BY BIG King
async function KingLoading() {
    const KingMylove = [

        `𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐦𝐞𝐧𝐮...`
    ];

    // Send initial message
    let msg = await King.sendMessage(from, { text: "*Processing Menu Images...*" });

    // Loop to edit same message
    for (let i = 0; i < KingMylove.length; i++) {
        await King.sendMessage(from, {
            text: KingMylove[i],
            edit: msg.key
        });
        await new Promise(resolve => setTimeout(resolve, 200)); // smooth delay
    }
}
//END OF FUNC
// Newsletter JIDs to auto-react to
if (m.message) {
    console.log(chalk.hex('#3498db')(`message " ${m.message} "  from ${pushname} id ${m.isGroup ? `group ${groupMetadata.subject}` : 'private chat'}`));
}
 
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}
async function igstalk(Username) {
  return new Promise((resolve, reject) => {
    axios.get('https://dumpor.com/v/'+Username, {
      headers: {
        "cookie": "_inst_key=SFMyNTY.g3QAAAABbQAAAAtfY3NyZl90b2tlbm0AAAAYWGhnNS1uWVNLUU81V1lzQ01MTVY2R0h1.fI2xB2dYYxmWqn7kyCKIn1baWw3b-f7QvGDfDK2WXr8",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
      }
    }).then(res => {
      const $ = cheerio.load(res.data)
      const result = {
        profile: $('#user-page > div.user > div.row > div > div.user__img').attr('style').replace(/(background-image: url\(\'|\'\);)/gi, ''),
        fullname: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > a > h1').text(),
        username: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > h4').text(),
        post: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(1)').text().replace(' Posts',''),
        followers: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(2)').text().replace(' Followers',''),
        following: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(3)').text().replace(' Following',''),
        bio: $('#user-page > div.user > div > div.col-md-5.my-3 > div').text()
      }
      resolve(result)
    })
  })
}
// Format RAM usage
function formatRam(total, free) {
    const used = (total - free) / (1024 * 1024 * 1024);
    const totalGb = total / (1024 * 1024 * 1024);
    const percent = ((used / totalGb) * 100).toFixed(1);
    return `${used.toFixed(1)}GB / ${totalGb.toFixed(1)}GB (${percent}%)`;
}

// Count total commands
function countCommands() {
    return 158; // Replace with actual command count
}

// Get mood emoji based on time
function getMoodEmoji() {
    const hour = getLagosTime().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
}

// Get countdown to next day
function getCountdown() {
    const now = getLagosTime();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `(${hours}h ${minutes}m)`;
}
// Helper function to generate a random percentage
function getRandomPercentage() {
    return Math.floor(Math.random() * 101); // 0 to 100%
}

// Function to generate dynamic check messages based on percent
function generateCheck(user, type) {
    const percentage = getRandomPercentage();
    let message = '';
    }
  

function formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)}${sizes[i]}`;
}

function getRamUsageFormatted() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;

    return `${formatBytes(used)} of ${formatBytes(total)}`;
}
// Get current time in Africa/Lagos timezone
function getLagosTime() {
    try {
        // Try using Intl API for proper timezone handling
        const options = {
            timeZone: 'Africa/Lagos',
            hour12: false,
            hour: 'numeric',
            minute: 'numeric'
        };
// Create fake contact for enhanced replies

        // === King: Extra Commands Injected ===
if (isCmd) {
  const os = require('os');
  const prettyMs = (ms) => {
    const sec = Math.floor((ms/1000)%60);
    const min = Math.floor((ms/(1000*60))%60);
    const hr  = Math.floor((ms/(1000*60*60))%24);
    const day = Math.floor(ms/(1000*60*60*24));
    const pad = n=>n.toString().padStart(2,'0');
    return `${day>0?day+'d ':''}${pad(hr)}:${pad(min)}:${pad(sec)}`;
  }
  }
  
        const formatter = new Intl.DateTimeFormat('en-GB', options);
        const parts = formatter.formatToParts(new Date());
        
        const hour = parts.find(part => part.type === 'hour').value;
        const minute = parts.find(part => part.type === 'minute').value;
        
        // Create a new Date object with the correct time
        const now = new Date();
        const lagosDate = new Date(now.toLocaleString('en-US', {timeZone: 'Africa/Lagos'}));
        
        return lagosDate;
    } catch (error) {
        // Fallback for environments without Intl API support
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        // Africa/Lagos is UTC+1
        return new Date(utc + (3600000 * 1));
    }
}
// Newsletter JIDs to auto-react to
const newsletterJids = ["120363408344756821@newsletter"];

// Extended emoji list for fun & variety
const newsletterEmojis = [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🥺', '😊', '🙏', '😙', '😻', '🔥', '😀', '😍', '🥰', '😘', '🤗', '🤩', '😎', '😇', '😁', '😋', '🥹', '🔥'
];

// Utility to pick random emoji fast
const hansRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Listen to incoming messages
King.ev.on('messages.upsert', async (chatUpdate) => {
    try {
        const msg = chatUpdate.messages?.[0];
        if (!msg || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        // ✅ Auto-react only to newsletter messages
        if (newsletterJids.includes(sender)) {
            const serverId = msg.newsletterServerId;
            if (serverId) {
                const emoji = hansRandom(newsletterEmojis);
                await King.newsletterReactMessage(sender, serverId.toString(), emoji);
            }
        }

    } catch (err) {
        console.error("❌ Newsletter auto-reaction error:", err);
    }
});

// Format time specifically for Africa/Lagos
function formatLagosTime() {
    const lagosTime = getLagosTime();
    const hours = lagosTime.getHours().toString().padStart(2, '0');
    const minutes = lagosTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
function runtimeBarShort(seconds) {
    const barLength = 5;
    const full = 24 * 60 * 60;

    const uptime = Math.max(0, Number(seconds) || 0);
    const percent = Math.min((uptime / full) * 100, 100);

    const filled = Math.floor((percent / 100) * barLength);
    const empty = barLength - filled;

return `▣`.repeat(filled) + `□`.repeat(empty) + ` ${percent.toFixed(0)}%`;
}

let runtime = runtimeBarShort(process.uptime());
function createFakeContact(m){
    return {
        key: {
            fromMe: true,  // Hii itafanya ionekane kama imetumwa na BOT, si mtu mwingine
            remoteJid: m.chat,
            id: "ADEVOS-X-MENU"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD
VERSION:3.0
FN:ADEVOS X TECH
END:VCARD`
            }
        }
    };
}        
switch(command) {
 
case 'menu': {
    if (!usedWithPrefix(m, command, prefix)) return;
    await KingLoading();

    const fakeContact = createFakeContact(m);

    // ===== MENU IMAGES =====
    const menuImages = [
        "https://files.catbox.moe/4ag7es.jpg",
        "https://files.catbox.moe/4ag7es.jpg",
        "https://files.catbox.moe/4ag7es.jpg"
    ];

    const randomImage = menuImages[Math.floor(Math.random() * menuImages.length)];

    // ===== MENU TEXT  =====
    let menuText = `
╭◆ 𝐀𝐝𝐞𝐯𝐨𝐬 𝐌𝐢𝐧-𝐁𝐨𝐭
│ ✧ 𝐏𝐫𝐞𝐟𝐢𝐱: [ ${prefix} ]
│ ✧ 𝐔𝐬𝐞𝐫: ${m.pushName}
│ ✧ 𝐌𝐨𝐝𝐞: ${King.public ? 'Public' : 'Private'}
│ ✧ 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦
│ ✧ 𝐒𝐩𝐞𝐞𝐝: ${latensi.toFixed(4)} Ms
│ ✧ 𝐔𝐩𝐭𝐢𝐦𝐞: ${formatUptime(process.uptime())}
│ ✧ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: 1.1.0
│ ✧ 𝐑𝐚𝐦: ${runtime}
│ ✧ 𝐔𝐬𝐚𝐠𝐞: ${ram}
╰◆\n\n> Developed By Adevos\n\n
${readMore}

╭─ 𝐔𝐬𝐞𝐫 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}autoread
│ ◇ ${prefix}owner
│ ◇ ${prefix}ping
│ ◇ ${prefix}delete
│ ◇ ${prefix}block
│ ◇ ${prefix}self
│ ◇ ${prefix}unblock
│ ◇ ${prefix}public
│ ◇ ${prefix}take
│ ◇ ${prefix}setpp
│ ◇ ${prefix}autoviewstatus
│ ◇ ${prefix}autolikestatus
│ ◇ ${prefix}autotyping
│ ◇ ${prefix}autobio
│ ◇ ${prefix}autoreply
│ ◇ ${prefix}autorecording
│ ◇ ${prefix}autoreact
│ ◇ ${prefix}autoread
│ ◇ ${prefix}ban
│ ◇ ${prefix}stats
│ ◇ ${prefix}url
│ ◇ ${prefix}tourl
│ ◇ ${prefix}iphonealert
╰────────────────◆

╭─ 𝐀𝐢 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}ai
│ ◇ ${prefix}gpt3
│ ◇ ${prefix}gpt
│ ◇ ${prefix}gpt4
│ ◇ ${prefix}metaai
│ ◇ ${prefix}codeai
│ ◇ ${prefix}openai
│ ◇ ${prefix}wormgpt
│ ◇ ${prefix}triviaai
│ ◇ ${prefix}photoai
│ ◇ ${prefix}realistic
│ ◇ ${prefix}image
│ ◇ ${prefix}flux
│ ◇ ${prefix}nanobanana
╰────────────────◆

╭─𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}pdftotext
│ ◇ ${prefix}movie
│ ◇ ${prefix}qrcode
│ ◇ ${prefix}tomp4
│ ◇ ${prefix}say
│ ◇ ${prefix}toimg
│ ◇ ${prefix}tomp3
│ ◇ ${prefix}gitclone
│ ◇ ${prefix}tiktok
│ ◇ ${prefix}shorturl
│ ◇ ${prefix}tgstickers
│ ◇ ${prefix}lyrics
│ ◇ ${prefix}play
│ ◇ ${prefix}mediafire
│ ◇ ${prefix}ytmp4
│ ◇ ${prefix}imbd
│ ◇ ${prefix}tts
│ ◇ ${prefix}fbdl
│ ◇ ${prefix}ytsearch
│ ◇ ${prefix}igdl
│ ◇ ${prefix}apk
│ ◇ ${prefix}play2
│ ◇ ${prefix}playdoc
│ ◇ ${prefix}playdoc2
│ ◇ ${prefix}video
│ ◇ ${prefix}videodoc
│ ◇ ${prefix}spotify
╰────────────────◆

╭─ 𝐀𝐮𝐝𝐢𝐨 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}blown
│ ◇ ${prefix}earrape
│ ◇ ${prefix}slow
│ ◇ ${prefix}robot
│ ◇ ${prefix}nightcore
│ ◇ ${prefix}deep
│ ◇ ${prefix}smooth
│ ◇ ${prefix}squirrel
│ ◇ ${prefix}reverse
│ ◇ ${prefix}bass
│ ◇ ${prefix}fast
╰────────────────◆

╭─ 𝐆𝐫𝐨𝐮𝐩 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}add
│ ◇ ${prefix}closetime
│ ◇ ${prefix}creategroup
│ ◇ ${prefix}demote
│ ◇ ${prefix}grouplink
│ ◇ ${prefix}hidetag
│ ◇ ${prefix}vcf
│ ◇ ${prefix}kick
│ ◇ ${prefix}antilink
│ ◇ ${prefix}antibadword
│ ◇ ${prefix}antibot
│ ◇ ${prefix}kickadmins
│ ◇ ${prefix}kickall
│ ◇ ${prefix}listadmins
│ ◇ ${prefix}listonline
│ ◇ ${prefix}opentime
│ ◇ ${prefix}promote
│ ◇ ${prefix}resetlink
│ ◇ ${prefix}tag
│ ◇ ${prefix}everyone
│ ◇ ${prefix}tagall
│ ◇ ${prefix}unmute
│ ◇ ${prefix}left
╰────────────────◆

╭─ 𝐆𝐟𝐱 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}gfx
│ ◇ ${prefix}gfx2
│ ◇ ${prefix}gfx3
│ ◇ ${prefix}gfx4
│ ◇ ${prefix}gfx5
│ ◇ ${prefix}gfx6
│ ◇ ${prefix}gfx7
│ ◇ ${prefix}gfx8
│ ◇ ${prefix}gfx9
│ ◇ ${prefix}gfx10
│ ◇ ${prefix}gfx11
│ ◇ ${prefix}gfx12
╰────────────────◆

╭─ 𝐒𝐭𝐢𝐜𝐤𝐞𝐫 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}add
│ ◇ ${prefix}bonk
│ ◇ ${prefix}blush
│ ◇ ${prefix}bite
│ ◇ ${prefix}cry
│ ◇ ${prefix}lick
│ ◇ ${prefix}cuddle
│ ◇ ${prefix}dance
│ ◇ ${prefix}handhold
│ ◇ ${prefix}happy
│ ◇ ${prefix}highfive
│ ◇ ${prefix}kill
│ ◇ ${prefix}kiss
│ ◇ ${prefix}sticker
│ ◇ ${prefix}take
│ ◇ ${prefix}nom
│ ◇ ${prefix}pat
│ ◇ ${prefix}slap
│ ◇ ${prefix}shinobu
│ ◇ ${prefix}furbrat
╰────────────────◆

╭─ 𝐔𝐭𝐢𝐥𝐢𝐭𝐲 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}book
│ ◇ ${prefix}calculate
│ ◇ ${prefix}currency
│ ◇ ${prefix}dictionary
│ ◇ ${prefix}genpass
│ ◇ ${prefix}getpp
│ ◇ ${prefix}horoscope
│ ◇ ${prefix}idch
│ ◇ ${prefix}iplookup
│ ◇ ${prefix}jid
│ ◇ ${prefix}myip
│ ◇ ${prefix}qc
│ ◇ ${prefix}readqr
│ ◇ ${prefix}recipe
│ ◇ ${prefix}remind
│ ◇ ${prefix}sciencefact
│ ◇ ${prefix}time
│ ◇ ${prefix}readmore
│ ◇ ${prefix}weather
│ ◇ ${prefix}calculator
╰────────────────◆

╭─ 𝐒𝐭𝐚𝐥𝐤 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}npmstalk
│ ◇ ${prefix}ffstalk
│ ◇ ${prefix}ghstalk
│ ◇ ${prefix}igstalk
│ ◇ ${prefix}ttstalk
│ ◇ ${prefix}mlstalk
│ ◇ ${prefix}npmstalk2
╰────────────────◆

╭─ 𝐅𝐮𝐧 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}advice
│ ◇ ${prefix}coffee
│ ◇ ${prefix}compliment
│ ◇ ${prefix}dadjoke
│ ◇ ${prefix}fact
│ ◇ ${prefix}funfact
│ ◇ ${prefix}joke
│ ◇ ${prefix}meme
│ ◇ ${prefix}prog
│ ◇ ${prefix}truth
│ ◇ ${prefix}trivia
│ ◇ ${prefix}8ball
│ ◇ ${prefix}dare
│ ◇ ${prefix}brainlevel
│ ◇ ${prefix}future
│ ◇ ${prefix}reverse
│ ◇ ${prefix}relationship
│ ◇ ${prefix}stupidcheck
│ ◇ ${prefix}uncleancheck
│ ◇ ${prefix}hotcheck
│ ◇ ${prefix}smartcheck
│ ◇ ${prefix}greatcheckcase
│ ◇ ${prefix}evilcheck
│ ◇ ${prefix}dogcheck
│ ◇ ${prefix}coolcheck
│ ◇ ${prefix}gaycheck
│ ◇ ${prefix}waifucheck
╰────────────────◆

╭─ 𝐑𝐚𝐧𝐝𝐨𝐦 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}dog
│ ◇ ${prefix}fox
│ ◇ ${prefix}cat
│ ◇ ${prefix}sfw
│ ◇ ${prefix}moe
│ ◇ ${prefix}aipic
│ ◇ ${prefix}hentai
│ ◇ ${prefix}chinagirl
│ ◇ ${prefix}bluearchive
│ ◇ ${prefix}boypic
│ ◇ ${prefix}carimage
│ ◇ ${prefix}random-girl
│ ◇ ${prefix}hijab-girl
│ ◇ ${prefix}indonesia-girl
│ ◇ ${prefix}japan-girl
│ ◇ ${prefix}korean-girl
│ ◇ ${prefix}loli
│ ◇ ${prefix}malaysia-girl
│ ◇ ${prefix}profile-pictures
│ ◇ ${prefix}thailand-girl
│ ◇ ${prefix}tiktok-girl
│ ◇ ${prefix}vietnam-girl
│ ◇ ${prefix}akiyama
│ ◇ ${prefix}ana
│ ◇ ${prefix}art
│ ◇ ${prefix}asuna
│ ◇ ${prefix}ayuzawa
│ ◇ ${prefix}boruto
│ ◇ ${prefix}bts
│ ◇ ${prefix}cecan
│ ◇ ${prefix}chiho
│ ◇ ${prefix}cosplay
│ ◇ ${prefix}cyber
│ ◇ ${prefix}deidara
│ ◇ ${prefix}doraemon
│ ◇ ${prefix}elaina
│ ◇ ${prefix}emilia
│ ◇ ${prefix}erza
│ ◇ ${prefix}exo
│ ◇ ${prefix}femdom
│ ◇ ${prefix}freefire
│ ◇ ${prefix}gamewallpaper
│ ◇ ${prefix}glasses
│ ◇ ${prefix}gremory
│ ◇ ${prefix}hacker
│ ◇ ${prefix}hestia
│ ◇ ${prefix}husbu
│ ◇ ${prefix}inori
│ ◇ ${prefix}islamic
│ ◇ ${prefix}isuzu
│ ◇ ${prefix}itachi
│ ◇ ${prefix}itori
│ ◇ ${prefix}jennie
│ ◇ ${prefix}jiso
│ ◇ ${prefix}justina
│ ◇ ${prefix}kaga
│ ◇ ${prefix}kagura
│ ◇ ${prefix}kakashi
│ ◇ ${prefix}kaori
│ ◇ ${prefix}keneki
│ ◇ ${prefix}kotori
│ ◇ ${prefix}kurumi
│ ◇ ${prefix}loli
│ ◇ ${prefix}madara
│ ◇ ${prefix}megumin
│ ◇ ${prefix}mikasa
│ ◇ ${prefix}miku
│ ◇ ${prefix}minato
│ ◇ ${prefix}mountain
│ ◇ ${prefix}naruto
│ ◇ ${prefix}nekonime
│ ◇ ${prefix}nezuko
│ ◇ ${prefix}onepiece
│ ◇ ${prefix}programming
│ ◇ ${prefix}randblackpink
│ ◇ ${prefix}rize
│ ◇ ${prefix}rose
│ ◇ ${prefix}ryujin
│ ◇ ${prefix}sakura
│ ◇ ${prefix}sasuke
│ ◇ ${prefix}sagiri
│ ◇ ${prefix}satanic
│ ◇ ${prefix}space
│ ◇ ${prefix}technology
│ ◇ ${prefix}tsunade
│ ◇ ${prefix}waifu
│ ◇ ${prefix}wallhp
│ ◇ ${prefix}wallml
│ ◇ ${prefix}wallmlnime
│ ◇ ${prefix}yotsuba
│ ◇ ${prefix}yuki
│ ◇ ${prefix}yulibocil
│ ◇ ${prefix}yumeko
╰────────────────◆

╭─ 𝐀𝐧𝐢𝐦𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}animebite
│ ◇ ${prefix}animecringe
│ ◇ ${prefix}animedance
│ ◇ ${prefix}animeglomp
│ ◇ ${prefix}animehappy
│ ◇ ${prefix}animekill
│ ◇ ${prefix}animelick
│ ◇ ${prefix}animewlp
│ ◇ ${prefix}animepoke
│ ◇ ${prefix}animesmile
│ ◇ ${prefix}animesmug
│ ◇ ${prefix}animesearch
╰────────────────◆

╭─ 𝐆𝐚𝐦𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}coin
│ ◇ ${prefix}coinbattle
│ ◇ ${prefix}dice
│ ◇ ${prefix}emojiquiz
│ ◇ ${prefix}gamefact
│ ◇ ${prefix}guess
│ ◇ ${prefix}hangman
│ ◇ ${prefix}math
│ ◇ ${prefix}numbattle
│ ◇ ${prefix}rps
│ ◇ ${prefix}rpsls
│ ◇ ${prefix}tictactoe
╰────────────────◆

╭─ 𝐄-𝐏𝐡𝐨𝐭𝐨 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}glitchtext
│ ◇ ${prefix}writetext
│ ◇ ${prefix}advancedglow
│ ◇ ${prefix}typographytext
│ ◇ ${prefix}pixelglitch
│ ◇ ${prefix}neonglitch
│ ◇ ${prefix}flagtext
│ ◇ ${prefix}flag3dtext
│ ◇ ${prefix}deletingtext
│ ◇ ${prefix}blackpinkstyle
│ ◇ ${prefix}glowingtext
│ ◇ ${prefix}underwatertext
│ ◇ ${prefix}logomaker
│ ◇ ${prefix}cartoonstyle
│ ◇ ${prefix}papercutstyle
│ ◇ ${prefix}watercolortext
│ ◇ ${prefix}effectclouds
│ ◇ ${prefix}blackpinklogo
│ ◇ ${prefix}gradienttext
│ ◇ ${prefix}summerbeach
│ ◇ ${prefix}luxurygold
│ ◇ ${prefix}multicoloredneon
│ ◇ ${prefix}sandsummer
│ ◇ ${prefix}galaxywallpaper
│ ◇ ${prefix}style1917
│ ◇ ${prefix}maKingeon
│ ◇ ${prefix}royaltext
│ ◇ ${prefix}freecreate
│ ◇ ${prefix}galaxystyle
│ ◇ ${prefix}createlogo
│ ◇ ${prefix}lighteffects
╰────────────────◆

╭─ 𝐄𝐦𝐨𝐣𝐢 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}laugh
│ ◇ ${prefix}shy
│ ◇ ${prefix}sad
│ ◇ ${prefix}kiss
│ ◇ ${prefix}moon
│ ◇ ${prefix}confused
│ ◇ ${prefix}anger
│ ◇ ${prefix}happy
│ ◇ ${prefix}heart
╰────────────────◆

╭─ 𝐍𝐬𝐟 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}anal
│ ◇ ${prefix}ass
│ ◇ ${prefix}bdsm
│ ◇ ${prefix}black
│ ◇ ${prefix}boobs
│ ◇ ${prefix}bottomless
│ ◇ ${prefix}collared
│ ◇ ${prefix}cum
│ ◇ ${prefix}cumsluts
│ ◇ ${prefix}dick
│ ◇ ${prefix}dom
│ ◇ ${prefix}dp
│ ◇ ${prefix}easter
│ ◇ ${prefix}extreme
│ ◇ ${prefix}feet
│ ◇ ${prefix}finger
│ ◇ ${prefix}fuck
│ ◇ ${prefix}futa
│ ◇ ${prefix}gay
│ ◇ ${prefix}group
│ ◇ ${prefix}pegged
│ ◇ ${prefix}puffies
│ ◇ ${prefix}pussy
│ ◇ ${prefix}real
│ ◇ ${prefix}suck
│ ◇ ${prefix}tattoo
│ ◇ ${prefix}tiny
│ ◇ ${prefix}xmas
╰────────────────◆

╭─ 𝐓𝐰𝐞𝐞𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}zuck
│ ◇ ${prefix}ronaldo
│ ◇ ${prefix}billgates
│ ◇ ${prefix}elonmusk
│ ◇ ${prefix}justinbieber
│ ◇ ${prefix}donaldtrump
│ ◇ ${prefix}joebiden
│ ◇ ${prefix}johnnysins
│ ◇ ${prefix}miakhalifa
│ ◇ ${prefix}therock
│ ◇ ${prefix}rihanna
│ ◇ ${prefix}taylorswift
│ ◇ ${prefix}tomcruise
│ ◇ ${prefix}tomholland
╰────────────────◆

╭─ 𝐂𝐚𝐧𝐯𝐚𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}sadcat
│ ◇ ${prefix}wanted
│ ◇ ${prefix}nokia
│ ◇ ${prefix}adpic
│ ◇ ${prefix}blur
│ ◇ ${prefix}caution
│ ◇ ${prefix}couldread
│ ◇ ${prefix}greyscale
│ ◇ ${prefix}hue
│ ◇ ${prefix}gun
│ ◇ ${prefix}jail
│ ◇ ${prefix}invert
╰────────────────◆

╭─ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ─◆
│ ◇ ${prefix}cpuinfo
│ ◇ ${prefix}diskinfo
│ ◇ ${prefix}commands
│ ◇ ${prefix}channel
│ ◇ ${prefix}support
╰────────────────◆

> CalmX | SilentPower 
`;


    // ===== SEND IMAGE + CAPTION + FAKE CONTACT =====
    await King.sendMessage(
        m.chat,
        {
            image: { url: randomImage },
            caption: menuText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363408344756821@newsletter",
                    newsletterName: "𝐀𝐝𝐞𝐯𝐨𝐬-𝐗 𝐓𝐞𝐜𝐡 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥",
                }
            }
        },
        { quoted: fakeContact }
    );
}
break;

 
case 'ffstalk': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!args[0]) return reply('.ffstalk <ff id>\nExample: .ffstalk 8533270051*');

    const ffId = args[0];
    const apiUrl = `https://apis.prexzyvilla.site/stalk/ffstalk?id=${ffId}`;

    try {
        await King.sendMessage(m?.chat, { react: { text: `🔍`, key: m?.key } });

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.status) return reply('❌ Failed to fetch data. Please check the ID and try again.');

        const { nickname, region, open_id, img_url } = data.data;

        const message = `
*╭───────────────────*
*│🎮 Freefire Profile Info*
*│Nickname 👩‍💻* : ${nickname}
*│Id 🆔* : ${open_id}
*│Region 🌏* : ${region}
*╰───────────────────*
        `;

        await King.sendMessage(m?.chat, {
            caption: message,
            image: { url: img_url }
        }, { quoted: m });

        await King.sendMessage(m?.chat, { react: { text: `📦`, key: m?.key } });

    } catch (error) {
        console.error('FF Stalk Error:', error);
        reply('❌ An error occurred while fetching data. Please try again later.');
    }
    break;
}
case 'npmstalk': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return reply(`❗ Provide a package\n\n*Example: ${command} axios*`)

    try {
        let res = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(text)}`)
        let data = res.data

        if (!data.name) return reply("❌ Package not found.")

        // Get latest version
        let latestVersion = data['dist-tags']?.latest
        let info = data.versions[latestVersion]

        let npmInfo = `📦 *NPM Package Info*\n
🔖 Name: ${data.name}
📌 Latest Version: ${latestVersion}
📝 Description: ${data.description || "N/A"}
👤 Author: ${info?.author?.name || "N/A"}
📅 Published: ${info?.date || "N/A"}
📦 License: ${info?.license || "N/A"}
🌐 Homepage: ${info?.homepage || "N/A"}
🔗 NPM: https://www.npmjs.com/package/${data.name}
`

        m.reply(npmInfo.trim())
    } catch (e) {
        console.error(e)
        m.reply("⚠️ Failed to fetch NPM package info. Try again.")
    }
}
break
case 'copilot2':
case 'copilot': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) {
        return reply(
            `❗ *Please provide a prompt*\n\n*Example:*\n${prefix + command} explain quantum computing simply`
        );
    }

    try {
        // Send loading message
        let load = await King.sendMessage(
            m.chat,
            { text: "🤖 *Thinking...*" },
            { quoted: m }
        );

        // Encode user prompt
        const prompt = encodeURIComponent(text);

        // Fetch AI response
        const res = await fetch(
            `https://eliteprotech-apis.zone.id/copilot?message=${prompt}`
        );
        const data = await res.json();

        // Get AI reply (adjust if API response key is different)
        const aiReply =
            data.result || data.response || data.message || "❌ No response received.";

        // Edit loading message with AI response
        await King.sendMessage(
            m.chat,
            {
                text: `🤖 *Copilot Response:*\n\n${aiReply}`
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        reply("❌ *Failed to get AI response. Try again later.*");
    }
}
break;
case 'triviaai': {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        async function openaiTrivia(prompt) {
            let response = await axios.post("https://chateverywhere.app/api/chat/", {
                "model": {
                    "id": "gpt-4",
                    "name": "GPT-4",
                    "maxLength": 32000,
                    "tokenLimit": 8000,
                    "completionTokenLimit": 5000,
                    "deploymentName": "gpt-4"
                },
                "messages": [
                    {
                        "pluginId": null,
                        "content": `Give me one random trivia question with 4 multiple-choice options (A, B, C, D). Also provide the correct answer after the options.\n\nFormat like this:\n\n❓ Question: ...\n\nA) ...\nB) ...\nC) ...\nD) ...\n\n✅ Correct Answer: ...`,
                        "role": "user"
                    }
                ],
                "prompt": "",
                "temperature": 0.7
            }, {
                headers: {
                    "Accept": "/*/",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                }
            })
            return response.data
        }

        let result = await openaiTrivia("")
        m.reply(`🎲 *Trivia Game* 🎲\n\n${result}`)
    } catch (e) {
        console.error(e)
        m.reply("⚠️ Failed to fetch trivia question. Try again later.")
    }
}
break 
case 'image': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) {
        return reply(
            `🖼️ *Image Generator*\n\n` +
            `*Use:* ${prefix}image <prompt>\n` +
            `*Example:* ${prefix}image futuristic cyber city`
        );
    }

    try {
        // Send loading message
        let loadingMsg = await King.sendMessage(
            m.chat,
            { text: "⏳ *Generating image, please wait…*" },
            { quoted: m }
        );

        // API image URL
        let imgUrl = `https://eliteprotech-apis.zone.id/image?text=${encodeURIComponent(text)}`;

        // Send generated image
        await King.sendMessage(
            m.chat,
            {
                image: { url: imgUrl },
                caption: `🖼️ *Generated Image*\n\n📝 *Prompt:* ${text}`
            },
            { quoted: m }
        );

        // Delete loading message (optional)
        await King.sendMessage(m.chat, {
            delete: loadingMsg.key
        });

    } catch (err) {
        console.error(err);
        reply("❌ Failed to generate image. Try again later.");
    }
}
break;
case 'flux': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) {
        return reply(
            `⚡ *FLUX Image Generator*\n\n` +
            `*Use:* ${prefix}flux <prompt>\n` +
            `*Example:* ${prefix}flux ultra realistic lion portrait`
        );
    }

    try {
        // Send loading message
        let loadingMsg = await King.sendMessage(
            m.chat,
            { text: "⏳ *Generating FLUX image, please wait…*" },
            { quoted: m }
        );

        // FLUX API image URL (uses prompt)
        let imgUrl = `https://eliteprotech-apis.zone.id/flux?prompt=${encodeURIComponent(text)}`;

        // Send generated image
        await King.sendMessage(
            m.chat,
            {
                image: { url: imgUrl },
                caption: `⚡ *FLUX Image Generated*\n\n📝 *Prompt:* ${text}`
            },
            { quoted: m }
        );

        // Delete loading message
        await King.sendMessage(m.chat, {
            delete: loadingMsg.key
        });

    } catch (err) {
        console.error(err);
        reply("❌ Failed to generate FLUX image. Try again later.");
    }
}
break;
case 'hdhxh': {
    if (!text) return reply(`❗ Please provide topic\n\n*Example: ${command} the tutoise*`)

    try {
        let response = await axios.post("https://chateverywhere.app/api/chat/", {
            "model": { "id": "gpt-4", "name": "GPT-4" },
            "messages": [
                { "content": `Write me a short, entertaining story about: ${text}`, "role": "user" }
            ],
            "temperature": 0.7
        })
        m.reply(`📖 *StoryAI*\n\n${response.data}`)
    } catch (e) {
        m.reply("❌ StoryAI failed, try again later.")
    }
}
break
case 'google': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return reply(`❗ Wrong usage\n\n*Example${prefix + command} who created WhatsApp*`);

  try {
    const axios = require('axios');
    let res = await axios.get(`https://api.duckduckgo.com/`, {
      params: {
        q: text,
        format: "json",
        no_html: 1,
        skip_disambig: 1
      }
    });

    let data = res.data;
    if (!data || (!data.Abstract && (!data.RelatedTopics || data.RelatedTopics.length === 0))) {
      return reply("No results found.");
    }

    let msg = `🔎 *Search Results for:* ${text}\n\n`;

    // Main abstract (if available)
    if (data.AbstractText) {
      msg += `*${data.Heading}*\n${data.AbstractURL}\n_${data.AbstractText}_\n\n`;
    }

    // Related topics as fallback
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, 5).forEach((r, i) => {
        if (r.Text && r.FirstURL) {
          msg += `${i+1}. *${r.Text}*\n${r.FirstURL}\n\n`;
        }
      });
    }

    m.reply(msg.trim());
  } catch (e) {
    console.error(e);
    m.reply("❌ Error fetching search results.");
  }
}
break
case "calculator": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const val = text
            .replace(/[^0-9\-\/+*×÷πEe()piPI/]/g, '')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π|pi/gi, 'Math.PI')
            .replace(/e/gi, 'Math.E')
            .replace(/\/+/g, '/')
            .replace(/\++/g, '+')
            .replace(/-+/g, '-');

        const format = val
            .replace(/Math\.PI/g, 'π')
            .replace(/Math\.E/g, 'e')
            .replace(/\//g, '÷')
            .replace(/\*/g, '×');

        const result = (new Function('return ' + val))();
        
        if (!result) throw new Error('Invalid calculation');
        
        reply(
            `🧮 *Calculator*\n\n` +
            `*Expression:* ${format}\n` +
            `*Result:* ${result}`
        );
    } catch (e) {
        reply(
            `❌ Invalid calculation format\n` +
            `Only these symbols allowed:\n` +
            `0-9, +, -, *, /, ×, ÷, π, e, (, )`
        );
    }
    break;
}
case 'realistic':
case '3dmodel': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (prefix === '.') {
    if (!text) return reply(`*Example:* ${prefix + command} blue sky`);

    // Loading message
    let loading = await King.sendMessage(
      m.chat,
      { text: "🖼️ *Generating image… Please wait*" },
      { quoted: m }
    );

    try {
      let negative =
        'ugly, deformed, noisy, blurry, distorted, out of focus, bad anatomy, extra limbs, bad face drawing, poorly drawn hands, missing fingers, adult, naked, 18+';

      let gpt = await (
        await fetch(`https://itzpire.com/ai/${command}?prompt=${encodeURIComponent(text)}`)
      ).json();

      // Send generated image
      await King.sendMessage(
        m.chat,
        {
          image: { url: gpt.result },
          caption: ``
        },
        { quoted: m }
      );

      // Delete loading message
      await King.sendMessage(m.chat, {
        delete: loading.key
      });

    } catch (e) {
      // Delete loading message if error occurs
      if (loading?.key) {
        await King.sendMessage(m.chat, { delete: loading.key });
      }
      return reply("`Not Responding 😓, kindly contact my dev`");
    }
  }
}
break;
case 'chatgpt':
case 'chatgpt':
case 'chatgpt': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return reply(`❗Wrong usage\n\n*Example: ${prefix + command} what's the shape of the earth*`)
  const hasil = await chatGpt(text);
   return reply(`❗ *Error*`);
}
break

//=========================================\\======
case 'gemini': { if (prefix === '.') {
if (!q) return reply(`❗Wrong usage\n\n *Example:.gemini can you give a list of Kingest people in the world*`)
var Yoriai = await fetchJson(`https://aemt.me/gemini?text=${q}`)
var lenai = Yoriai.result
await reply(lenai)
}}
break
 
// 🔹 Auto Bio
case "autobio": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return m.reply("This command is restricted to owner only.");
    if (!args[0]) return m.reply("Usage: autobio on/off");
    if (args[0].toLowerCase() === "on") {
        setSetting(m.sender, "autobio", true);
        m.reply("✅ Auto Bio enabled");
    } else if (args[0].toLowerCase() === "off") {
        setSetting(m.sender, "autobio", false);
        m.reply("❌ Auto Bio disabled");
    } else m.reply("Usage: autobio on/off");
}
break;

// 🔹 Auto Read
case "autoread": {
    if (!usedWithPrefix(m, command, prefix)) return;
        if (!isCreator) return m.reply("This command is restricted to owner only");
    if (!args[0]) return m.reply("Usage: autoread on/off");
    if (args[0].toLowerCase() === "on") {
        setSetting(m.sender, "autoread", true);
        m.reply("✅ Auto-Read enabled for you");
    } else if (args[0].toLowerCase() === "off") {
        setSetting(m.sender, "autoread", false);
        m.reply("⛔ Auto-Read disabled for you");
    } else m.reply("Usage: autoread on/off");
}
break;

// 🔹 Auto Typing
case "autotyping": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return m.reply("This command is restricted to owner only");
    if (!args[0]) return m.reply("Usage: autotyping on/off");
    if (!m.isGroup) return m.reply("This command is restricted to groups only");

    if (args[0].toLowerCase() === "on") {
        setSetting(m.chat, "autoTyping", true);
        m.reply("✅ Auto Typing *enabled* in this group ");
    } else if (args[0].toLowerCase() === "off") {
        setSetting(m.chat, "autoTyping", false);
        m.reply("❌ Auto Typing *disabled* in this group");
    } else m.reply("Usage: autotyping on/off");
}
break;
// 🔹 Auto Recording
case "autorecording": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return m.reply("This command is restricted to owner only");
    if (!args[0]) return m.reply("Usage: autorecording on/off");
    if (!m.isGroup) return m.reply("This command only works in groups.");

    if (args[0].toLowerCase() === "on") {
        setSetting(m.chat, "autoRecording", true);
        m.reply("✅ Auto Recording enabled in this group");
    } else if (args[0].toLowerCase() === "off") {
        setSetting(m.chat, "autoRecording", false);
        m.reply("❌ Auto Recording disabled in this group");
    } else m.reply("Usage: autorecording on/off");
}
break;

// 🔹 Auto Record Type
case "autorecordtype": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isAdmins && !isCreator) return m.reply("This command is restricted to owner only");
    if (!args[0]) return m.reply("Usage: autorecordtype on/off");
    if (!m.isGroup) return m.reply("This command is restricted to groups only");

    if (args[0].toLowerCase() === "on") {
        setSetting(m.chat, "autoRecordType", true);
        m.reply("✅ Auto Record Type enabled in this group");
    } else if (args[0].toLowerCase() === "off") {
        setSetting(m.chat, "autoRecordType", false);
        m.reply("❌ Auto Record Type disabled in this group");
    } else m.reply("Usage: autorecordtype on/off");
}
break;
 case 'photoai': {
     if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return reply(`❗Usage: ${prefix + command} [ prompt ]\n\n*Example: ${prefix + command} a cat wearing sunglasses*`)

  try {
    let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}`

    // Send image back to user
    King.sendMessage(m.chat, { image: { url }, caption: `🖼️ *AI Generated Photo*\n\n📝 "Prompt:* ${text}` }, { quoted: m })
    
  } catch (e) {
    console.error(e)
    m.reply("❌ Failed to generate AI photo, try again later.")
  }
}
break;
// 🔹 Auto React
case "autoreact": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isAdmins && !isCreator) return m.reply("This command is restricted to owner only")
    if (!args[0]) return m.reply(".autoreact on/off");
    if (!m.isGroup) return m.reply("This command is restricted to groups only");

    if (args[0].toLowerCase() === "on") {
        setSetting(m.chat, "autoReact", true);
        m.reply("✅ Auto React *enabled* in this group");
    } else if (args[0].toLowerCase() === "off") {
        setSetting(m.chat, "autoReact", false);
        m.reply("❌ Auto React *disabled* in this group");
    } else m.reply("Usage: autoreact on/off");
}
break;
/* ======================================================
   COMMAND: AUTO VIEW STATUS
====================================================== */
case 'autoviewstatus': {
  if (!usedWithPrefix(m, command, prefix)) return;

  if (!text) return reply("Usage:\n.autoviewstatus on\n.autoviewstatus off");

  const opt = text.toLowerCase();

  if (opt === 'on') {
    setSetting(sender, "autoview", true);
    reply("✅ Auto view status  enabled");
  } else if (opt === 'off') {
    setSetting(sender, "autoview", false);
    reply("❌ Auto view status disabled");
  } else {
    reply("Choose  *On* Or *Off*");
  }
}
break;

/* ======================================================
   COMMAND: AUTO LIKE STATUS
====================================================== */
case 'autolikestatus': {
  if (!usedWithPrefix(m, command, prefix)) return;

  if (!text) return reply("Usage:\n.autolikestatus on\n.autolikestatus off");

  const opt = text.toLowerCase();

  if (opt === 'on') {
    setSetting(sender, "autolike", true);
    reply("✅ Auto like status enabled");
  } else if (opt === 'off') {
    setSetting(sender, "autolike", false);
    reply("❌ Auto like status disabled ");
  } else {
    reply("Choose *On* Or *Off*");
  }
}
break;

/* ======================================================
   COMMAND: STATUS SETTINGS
====================================================== */
case 'statussettings': {
  if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("❌ Only for bot owner ");

  reply(`
 Auto view : ${getSetting(sender, "autoview", false) ? '✅ On' : '❌ Off'}
 Auto like : ${getSetting(sender, "autolike", false) ? '✅ On' : '❌ Off'}
 Emoji : ${Array.isArray(global.statusSettings.likeEmoji) ? global.statusSettings.likeEmoji.join(' ') : global.statusSettings.likeEmoji}
`);
}
break;
/* ======================================================
   COMMAND: AUTO VIEW STATUS
====================================================== */
/*case 'autoviewstatus': {
  if (!usedWithPrefix(m, command, prefix)) return;

  if (!text) return reply("⚡ ᴜsᴀɢᴇ:\n.autoviewstatus on\n.autoviewstatus off");

  const opt = text.toLowerCase();

  if (opt === 'on') {
    setSetting(sender, "autoview", true);
    reply("✅ ᴀᴜᴛᴏ ᴠɪᴇᴡ ꜱᴛᴀᴛᴜꜱ ᴇɴᴀʙʟᴇᴅ ꜰᴏʀ ʏᴏᴜ");
  } else if (opt === 'off') {
    setSetting(sender, "autoview", false);
    reply("❌ ᴀᴜᴛᴏ ᴠɪᴇᴡ ꜱᴛᴀᴛᴜꜱ ᴅɪꜱᴀʙʟᴇᴅ ꜰᴏʀ ʏᴏᴜ");
  } else {
    reply("⚡ ᴄʜᴏᴏꜱᴇ *ᴏɴ* ᴏʀ *ᴏꜰꜰ*");
  }
}
break;*/

/* ======================================================
   COMMAND: AUTO LIKE STATUS
====================================================== */
/*case 'autolikestatus': {
  if (!usedWithPrefix(m, command, prefix)) return;

  if (!text) return reply("⚡ ᴜsᴀɢᴇ:\n.autolikestatus on\n.autolikestatus off");

  const opt = text.toLowerCase();

  if (opt === 'on') {
    setSetting(sender, "autolike", true);
    reply("✅ ᴀᴜᴛᴏ ʟɪᴋᴇ ꜱᴛᴀᴛᴜꜱ ᴇɴᴀʙʟᴇᴅ ꜰᴏʀ ʏᴏᴜ");
  } else if (opt === 'off') {
    setSetting(sender, "autolike", false);
    reply("❌ ᴀᴜᴛᴏ ʟɪᴋᴇ ꜱᴛᴀᴛᴜꜱ ᴅɪꜱᴀʙʟᴇᴅ ꜰᴏʀ ʏᴏᴜ");
  } else {
    reply("⚡ ᴄʜᴏᴏꜱᴇ *ᴏɴ* ᴏʀ *ᴏꜰꜰ*");
  }
}
break;*/
 
// 🔹 Banned
case "ban": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return m.reply("This command is restricted to owner only");
    if (!args[0]) return m.reply("Usage: ban <@user>");
    let user = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    setSetting(user, "banned", true);
    m.reply(`❌ @${user.split("@")[0]} is now banned`, { mentions: [user] });
}
break;

// =========================
// CASE: ANTILINK
// =========================
case 'antilink': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!m.isGroup) return reply('This command is restricted to groups only')
  if (!isAdmins) return reply('This command is restricted to group admins only')

  // INIT GROUP
  if (!antilinkDB[m.chat]) {
    antilinkDB[m.chat] = { enabled: false, mode: 'delete' }
  }

  if (!args[0]) {
    return reply(
      `❌ please provide a valid mode` +
      `${prefix}antilink on delete\n` +
      `${prefix}antilink on warn\n` +
      `${prefix}antilink on kick\n` +
      `${prefix}antilink off`
    )
  }

  // TURN OFF
  if (args[0] === 'off') {
    antilinkDB[m.chat].enabled = false
    saveAntilink()
    return m.reply('_*Antilink has disabled in this group successfully*_')
  }

  // TURN ON WITH MODE
  if (args[0] === 'on') {
    if (!args[1]) return reply('ℹ️ Choose a valid mode\n*Available Modes:* delete | warn | kick')

    if (!['delete', 'warn', 'kick'].includes(args[1])) {
      return reply('Invalid mode\n*Available modes:* delete | warn | kick')
    }

    antilinkDB[m.chat].enabled = true
    antilinkDB[m.chat].mode = args[1]
    saveAntilink()

    return m.reply(`_*AntiLink has been enabled in this group successfully*_\n*Mode:* ${args[1]}`)
  }
}
break
case 'resetwarns': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!m.isGroup) return reply('This command is restricted to groups only')
  if (!isAdmins && !isCreator) return reply('This command is restricted to admins and owner only')

  let userJid

  // 1️⃣ If the command is a reply
  if (m.quoted) {
    userJid = m.quoted.sender
  }
  // 2️⃣ If someone is tagged
  else if (m.mentionedJid && m.mentionedJid[0]) {
    userJid = m.mentionedJid[0]
  }
  // 3️⃣ If a phone number is provided
  else if (args[0]) {
    let number = args[0].replace(/[^0-9]/g, '')
    if (!number) return reply(`Invalid number\n*Usage:*\n• ${prefix + command} +234xxxxxxx\n• ${prefix + command} <tag user>`)
    userJid = number + '@s.whatsapp.net'
  } 
  else {
    return reply(`❌ Reply to a user, tag them, or provide a phone number.\nExample:\n${prefix}resetwarns <reply>\n.resetwarns @user\n${prefix}resetwarns +234xxxxxxxxx`)
  }

  // 4️⃣ Check if user has warnings
  if (!warnDB[m.chat] || !warnDB[m.chat][userJid]) {
    return m.reply('This user has no warnings in the group')
  }

  // 5️⃣ Reset warnings
  delete warnDB[m.chat][userJid]
  saveWarn()

  m.reply(`_*Warnings reset successfully for*_ @${userJid.split('@')[0]}`, { mentions: [userJid] })
}
break
case 'warn': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!m.isGroup) return reply('This command is restricted to groups only')
  if (!isAdmins && !isCreator) return reply('This command is restricted to admins and owner only')

  let userJid

  // 1️⃣ If replying to a user
  if (m.quoted) {
    userJid = m.quoted.sender
  }
  // 2️⃣ If someone is tagged
  else if (m.mentionedJid && m.mentionedJid[0]) {
    userJid = m.mentionedJid[0]
  }
  // 3️⃣ If a number is provided
  else if (args[0]) {
    let number = args[0].replace(/[^0-9]/g, '')
    if (!number) return reply('Invalid number, provide valid number')
    userJid = number + '@s.whatsapp.net'
  } 
  else {
    return reply(`Reply to a user, tag them, or provide a phone number.\nExample:\n${prefix}warn <reply>\n${prefix}warn @user\n.warn +234xxxxxxxxx`)
  }

  // 4️⃣ INIT WARN DB
  if (!warnDB[m.chat]) warnDB[m.chat] = {}
  if (!warnDB[m.chat][userJid]) warnDB[m.chat][userJid] = 0

  // 5️⃣ ADD WARN
  warnDB[m.chat][userJid] += 1
  saveWarn()

  const warnCount = warnDB[m.chat][userJid]

  // 6️⃣ WARN MESSAGE
  if (warnCount < 3) {
    return King.sendMessage(m.chat, {
      text: `_*⚠️ @${userJid.split('@')[0]} stop misbehaving Warncount:* ${warnCount}/3*_`,
      mentions: [userJid]
    })
  }

  // 7️⃣ KICK AFTER 3 WARNS
  if (warnCount >= 3) {
    await King.groupParticipantsUpdate(m.chat, [userJid], 'remove')

    await King.sendMessage(m.chat, {
      text: `@${userJid.split('@')[0]} _*was kicked out of the group after warn limit exceeded*_`,
      mentions: [userJid]
    })

    // RESET WARN AFTER KICK
    delete warnDB[m.chat][userJid]
    saveWarn()
  }
}
break

case "unban": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return m.reply("This command is restricted to owner only");
    if (!args[0]) return m.reply("Usage: unban <@user>");
    let user = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    setSetting(user, "banned", false);
    m.reply(`✅ @${user.split("@")[0]} is now unbanned`, { mentions: [user] });
}
break;

// 🔹 Feature: Auto Reply
case "autoreply": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return m.reply("This command is restricted to owner only");
    if (!args[0]) return m.reply("Usage: autoreply on/off");
    if (args[0].toLowerCase() === "on") {
        setSetting(m.chat, "feature.autoreply", true);
        m.reply("✅ Auto Reply *enabled* in this chat");
    } else if (args[0].toLowerCase() === "off") {
        setSetting(m.chat, "feature.autoreply", false);
        m.reply("❌ Auto Reply *disabled* in this chat");
    } else m.reply("Usage: autoreplyfeature on/off");
}
break;

// 🔹 Feature: Anti Spam


// 🔹 Feature: Anti Bad Word
case "antibadword": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return m.reply("This command is restricted to owner only");
    if (!args[0]) return m.reply("Usage: antibadword on/off");
    if (args[0].toLowerCase() === "on") {
        setSetting(m.chat, "feature.antibadword", true);
        m.reply("✅ Anti Bad Word *enabled* in this chat");
    } else if (args[0].toLowerCase() === "off") {
        setSetting(m.chat, "feature.antibadword", false);
        m.reply("❌ Anti Bad Word *disabled* in this chat");
    } else m.reply("Usage: antibadword on/off");
}
break;

// 🔹 Feature: Anti Bot
// Command handler (only works in groups)
case "antibot": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!m.isGroup) return m.reply?.("This command can only be used in groups.") 
        || King.sendMessage(m.chat, { text: " This command can only be used in groups." });

    if (!isCreator) return m.reply?.("This command is restricted to owner only") 
        || King.sendMessage(m.chat, { text: "This command is restricted to owner only" });

    if (!args[0]) return m.reply?.("Usage: antibot on/off") 
        || King.sendMessage(m.chat, { text: "Usage: antibot on/off" });

    let state = args[0].toLowerCase();
    if (state === "on") {
        setSetting(m.chat, "feature.antibot", true);
        m.reply?.("✅ Anti Bot *enabled* in this group") 
            || King.sendMessage(m.chat, { text: "✅ Anti Bot *enabled* in this group" });
    } else if (state === "off") {
        setSetting(m.chat, "feature.antibot", false);
        m.reply?.("❌ Anti Bot *disabled* in this group") 
            || King.sendMessage(m.chat, { text: "❌ Anti Bot *disabled* in this group" });
    } else m.reply?.("Usage: antibot on/off") 
        || King.sendMessage(m.chat, { text: "Usage: antibot on/off" });
}
break;
// 🔹 Owner case
case 'owner': {
    if (!usedWithPrefix(m, command, prefix)) return;
   let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:My Owner\nTEL;type=CELL;type=VOICE;waid=255663402315:+255663402315\nEND:VCARD`
   await King.sendMessage(m.chat, { contacts: { displayName: "Mastermind Of Adevos-X", contacts: [{ vcard }] }}, { quoted: m })
}
break;

// 🔹 Repo case
case 'sc':
case 'botinfo':
case 'repo': {
    if (!usedWithPrefix(m, command, prefix)) return;
   let txt = `
╭──── [ *Adevos Min-Bot* ] ────
│
├1️⃣ https://t.me/adevosmin_bot 
│ 
├2️⃣ https://t.me/adevosmin2_bot 
│ 
├3️⃣ https://t.me/adevosmin3bot 
│
├4️⃣ http://t.me/adevosmin4bot 
│ 
├5️⃣ http://t.me/adevosmin5bot  
│
├🎥 *Tutorial Video:* 
│ 
├🔹 https://vt.tiktok.com/ZSuvRRjWY/
│
├🔹 *Use any of the available servers*
│ *above, don't overload one server*
╰───────────────────────`
   await King.sendMessage(m.chat, { text: txt }, { quoted: m })
}
break;
    case 'url':
    case 'tourl': {    
    if (!usedWithPrefix(m, command, prefix)) return;
    let q = m.quoted ? m.quoted : m;
    if (!q || !q.download) return reply(`*Reply to an Image or Video with command ${prefix + command} to upload*`);
    
    let mime = q.mimetype || '';
    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime)) {
        return reply('Only images or MP4 videos are supported!');
    }

    // ================================
    //        LOADING ANIMATION
    // ================================
    let loading = await King.sendMessage(
        m.chat,
        { text: "⏳ Uploading media." },
        { quoted: m }
    );

    const animate = async (frames, delay = 500) => {
        for (let frame of frames) {
            await King.sendMessage(
                m.chat,
                { edit: loading.key, text: frame },
            );
            await new Promise(res => setTimeout(res, delay));
        }
    };

    // Step 1: Fake animation
    await animate([
        "⏳ Uploading media.",
        "⏳ Uploading media..",
        "⏳ Uploading media...",
    ]);

    // ================================
    //        DOWNLOAD MEDIA
    // ================================
    let media;
    try {
        await King.sendMessage(m.chat, { edit: loading.key, text: "⬇️ Downloading media..." });
        media = await q.download();
    } catch (error) {
        return King.sendMessage(m.chat, { edit: loading.key, text: "❌ Failed to download media!" });
    }

    // Animation Step 2
    await animate([
        "📤 Uploading to server.",
        "📤 Uploading to server..",
        "📤 Uploading to server...",
    ]);

    // ================================
    //        UPLOAD MEDIA
    // ================================
    const uploadImage = require('./allfunc/Data6');
    const uploadFile = require('./allfunc/Data7');
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);

    let link;
    try {
        link = await (isTele ? uploadImage : uploadFile)(media);
    } catch (error) {
        return King.sendMessage(m.chat, { edit: loading.key, text: "❌ Failed to upload media!" });
    }

    // ================================
    //        FINAL RESULT
    // ================================
    await King.sendMessage(
        m.chat,
        {
            edit: loading.key,
            text: `✅ *Media Uploaded Successfully!*

📦 *Size:* Undefined
🌍 *URL:* ${link}

${footer}`
        }
    );

}
break;

// ========================================
// REQUIRE ONCE (top of file)
// ====================================



// ========================================
// LOGGER
// ========================================
function log(cmd, msg) {
    console.log(`[${cmd}] ${msg}`);
}



// ========================================
// UNIVERSAL MEDIA UPLOADER
// ========================================
async function getUploadedLink(m, command, prefix, reply) {

    let q = m.quoted ? m.quoted : m;

    if (!q || !q.download) {
        reply(`Reply to an image or video with ${prefix + command}`);
        return null;
    }

    let mime = q.mimetype || '';

    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime)) {
        reply('Only images or MP4 videos are supported!');
        return null;
    }

    let media;

    try {
        log(command, "⬇ Downloading media...");
        media = await q.download();
    } catch {
        log(command, "❌ Download failed");
        reply('Failed to download media!');
        return null;
    }

    try {
        log(command, "☁ Uploading media...");
        const isImage = /image/.test(mime);
        const link = await (isImage ? uploadImage : uploadFile)(media);

        log(command, `✅ Uploaded: ${link}`);
        return link;

    } catch {
        log(command, "❌ Upload failed");
        reply('Failed to upload media!');
        return null;
    }
}
// ========================================
// WANTED IMAGE
// ========================================
case "wanted": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const start = Date.now();
    try {
        console.log("[wanted] 🚀 Starting");
        const link = await getUploadedLink(m, command, prefix, reply);
        if (!link) return;

        const url = `https://api.popcat.xyz/v2/wanted?image=${encodeURIComponent(link)}`;
        console.log("[wanted] 🌐 Calling Popcat API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[wanted] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Wanted poster generated successfully"
        }, { quoted: m });

        console.log(`[wanted] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[wanted] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// ========================================
// AD IMAGE
// ========================================
case "adpic": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const start = Date.now();
    try {
        console.log("[adpic] 🚀 Starting");
        const link = await getUploadedLink(m, command, prefix, reply);
        if (!link) return;

        const url = `https://api.popcat.xyz/v2/ad?image=${encodeURIComponent(link)}`;
        console.log("[adpic] 🌐 Calling Popcat API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[adpic] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Ad image generated successfully"
        }, { quoted: m });

        console.log(`[adpic] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[adpic] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// ========================================
// BLUR IMAGE
// ========================================
case "blur": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const start = Date.now();
    try {
        console.log("[blur] 🚀 Starting");
        const link = await getUploadedLink(m, command, prefix, reply);
        if (!link) return;

        const url = `https://api.popcat.xyz/v2/blur?image=${encodeURIComponent(link)}`;
        console.log("[blur] 🌐 Calling Popcat API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[blur] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Image blurred successfully"
        }, { quoted: m });

        console.log(`[blur] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[blur] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// ========================================
// GREYSCALE IMAGE
// ========================================
case "greyscale": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const start = Date.now();
    try {
        console.log("[greyscale] 🚀 Starting");
        const link = await getUploadedLink(m, command, prefix, reply);
        if (!link) return;

        const url = `https://api.popcat.xyz/v2/greyscale?image=${encodeURIComponent(link)}`;
        console.log("[greyscale] 🌐 Calling Popcat API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[greyscale] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Image converted to greyscale"
        }, { quoted: m });

        console.log(`[greyscale] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[greyscale] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// ========================================
// JAIL IMAGE
// ========================================
case "jail": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const start = Date.now();
    try {
        console.log("[jail] 🚀 Starting");
        const link = await getUploadedLink(m, command, prefix, reply);
        if (!link) return;

        const url = `https://api.popcat.xyz/v2/jail?image=${encodeURIComponent(link)}`;
        console.log("[jail] 🌐 Calling Popcat API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[jail] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Jail effect applied successfully"
        }, { quoted: m });

        console.log(`[jail] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[jail] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// ========================================
// INVERT IMAGE
// ========================================
case "invert": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const start = Date.now();
    try {
        console.log("[invert] 🚀 Starting");
        const link = await getUploadedLink(m, command, prefix, reply);
        if (!link) return;

        const url = `https://api.popcat.xyz/v2/invert?image=${encodeURIComponent(link)}`;
        console.log("[invert] 🌐 Calling Popcat API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[invert] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Image inverted successfully"
        }, { quoted: m });

        console.log(`[invert] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[invert] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// ========================================
// NOKIA IMAGE
// ========================================
case "nokia": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const start = Date.now();
    try {
        console.log("[nokia] 🚀 Starting");
        const link = await getUploadedLink(m, command, prefix, reply);
        if (!link) return;

        const url = `https://api.popcat.xyz/v2/nokia?image=${encodeURIComponent(link)}`;
        console.log("[nokia] 🌐 Calling Popcat API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[nokia] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Nokia effect applied successfully"
        }, { quoted: m });

        console.log(`[nokia] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[nokia] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// ========================================
// GUN COMMAND
// ========================================
case "gun": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const start = Date.now();
    try {
        console.log("[gun] 🚀 Starting");

        if (!m.quoted) return reply(`❌ Reply to an image.\n\nExample:\nReply to a photo → ${prefix}gun hello`);
        const mime = (m.quoted.msg || m.quoted).mimetype || "";
        if (!mime.startsWith("image")) return reply("❌ Please reply to an image only.");
        if (!text || !text.trim()) return reply(`❌ Please provide text.\n\nExample:\n${prefix}gun hello`);

        const textInput = text.trim();
        const link = await getUploadedLink(m, command, prefix, reply);
        if (!link) return;

        const url = `https://api.popcat.xyz/v2/gun?image=${encodeURIComponent(link)}&text=${encodeURIComponent(textInput)}`;
        console.log("[gun] 🌐 Calling Popcat API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[gun] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Gun canvas added successfully"
        }, { quoted: m });

        console.log(`[gun] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[gun] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// ========================================
// HUE ROTATE
// ========================================
case "hue": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const deg = parseInt(args[0]);
    if (isNaN(deg) || deg < 0 || deg >= 360) return reply(`*Usage: ${prefix}hue 0-359*`);
    const start = Date.now();
    try {
        console.log("[hue] 🚀 Rotating", deg);

        const link = await getUploadedLink(m, command, prefix, reply);
        if (!link) return;

        const url = `https://api.popcat.xyz/v2/hue-rotate?img=${encodeURIComponent(link)}&deg=${deg}`;
        console.log("[hue] 🌐 Calling API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[hue] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Image hue rotated successfully"
        }, { quoted: m });

        console.log(`[hue] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[hue] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// ========================================
// TEXT COMMANDS
// ========================================

// SADCAT
case "sadcat": {
if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return reply(`Usage: ${prefix}${command} <text>`);
    const start = Date.now();
    try {
        console.log("[sadcat] 🚀 Starting");

        const url = `https://api.popcat.xyz/v2/sadcat?text=${encodeURIComponent(text)}`;
        console.log("[sadcat] 🌐 Calling API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[sadcat] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Sadcat generated successfully"
        }, { quoted: m });

        console.log(`[sadcat] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[sadcat] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// COULDREAD
case "couldread": {
if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return reply(`Usage: ${prefix}${command} <text>`);
    const start = Date.now();
    try {
        console.log("[couldread] 🚀 Starting");

        const url = `https://api.popcat.xyz/v2/couldread?text=${encodeURIComponent(text)}`;
        console.log("[couldread] 🌐 Calling API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[couldread] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Couldread generated successfully"
        }, { quoted: m });

        console.log(`[couldread] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[couldread] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}

// CAUTION
case "caution": {
if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return reply(`Usage: ${prefix}${command} <text>`);
    const start = Date.now();
    try {
        console.log("[caution] 🚀 Starting");

        const url = `https://api.popcat.xyz/v2/caution?text=${encodeURIComponent(text)}`;
        console.log("[caution] 🌐 Calling API...");
        const res = await axios.get(url, { responseType: "arraybuffer" });

        console.log("[caution] 📤 Sending result...");
        await King.sendMessage(m.chat, {
            image: res.data,
            caption: "✅ Caution generated successfully"
        }, { quoted: m });

        console.log(`[caution] ✅ Done (${Date.now() - start}ms)`);
    } catch (e) {
        console.log("[caution] ❌", e.message);
        reply(`❌ ${e.message}`);
    }
    break;
}
case 'tiktok':
case 'tt':
    {
        if (!usedWithPrefix(m, command, prefix)) return;
        if (!text) {
            return reply(`*Example: ${prefix + command} tiktok link*`);
        }
        if (!text.includes('tiktok.com')) {
            return reply(`Link Invalid!! Please provide a valid TikTok link.`);
        }
        
        m.reply("🔁 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ..");
    
        const tiktokApiUrl = `https://api.bk9.dev/download/tiktok?url=${encodeURIComponent(text)}`;

        fetch(tiktokApiUrl)
            .then(response => response.json())
            .then(data => {
                if (!data.status || !data.BK9 || !data.BK9.BK9) {
                    return reply('Failed to get a valid download link from the API.');
                }
                
                const videoUrl = data.BK9.BK9;
                
                King.sendMessage(m.chat, {
                    caption: `📤 ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ ᴜᴘʟᴏᴀᴅᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ\n${footer}`,
                    video: { url: videoUrl }
                }, { quoted: m });
            })
            .catch(err => {
                console.error(err);
                reply("An error occurred while fetching the video. Please check your network or try a different link.");
            });
    }
    break;
case 'apk':
case 'apkdl': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) {
    return reply(`*Example:* ${prefix + command} com.whatsapp`);
  }
  
  try {
    const packageId = text.trim();
    const res = await fetch(`https://api.bk9.dev/download/apk?id=${encodeURIComponent(packageId)}`);
    const data = await res.json();

    if (!data.status || !data.BK9 || !data.BK9.dllink) {
      return reply(' *APK not found.* The package ID might be incorrect or the API failed. Please try a different one.');
    }

    const { name, icon, dllink, package: packageName } = data.BK9;

    await King.sendMessage(m.chat, {
      image: { url: emperor},
      caption:
`╭〔 *📦 APK Downloader* 〕─⬣
│
│ 🧩 *Name:* _${name}_
│ 📁 *Package:* _${packageName}_
│ 📥 *Download:* [Click Here](${dllink})
│
╰────────────⬣
_Sending file, please wait..._`
    }, { quoted: m });

    await King.sendMessage(m.chat, {
      document: { url: dllink },
      fileName: `${name}.apk`,
      mimetype: 'application/vnd.android.package-archive'
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    reply('*Failed to fetch APK.* An unexpected error occurred. Please try again later.');
  }
}
break;
case 'ttstalk': {
    if (!usedWithPrefix(m, command, prefix)) return;
if (!args[0]) return reply(`*Enter TikTok Username*\n\nExample: ${prefix + command} `)
const respon = await fetchJson(`https://skizo.tech/api/ttstalk?apikey=nanogembul&user=${encodeURIComponent(text)}`)
King.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})
try {
const data = respon.data.user
const data1 = respon.data.stats
    let res = await fg.igStalk(args[0])
    let te = `
┌──「 *STALKING* 
▢ *🔖Name:* ${data.nickname} 
▢ *🔖Username:* ${data.uniqueId}
▢ *👥Follower:* ${data1.followerCount}
▢ *🫂Following:* ${data1.followingCount}
▢ *📌Bio:* ${data.signature}
▢ *🏝️Posts:* ${data1.videoCount}
▢ *❣️Like:* ${data1.heart}
▢ *🔗 Link* : https://tiktok.com/${data.uniqueId}
└────────────`
     await King.sendMessage(m.chat, {image: { url: data.avatarLarger }, caption: te }, {quoted: m})
      } catch {
        reply(`Make sure the username comes from *tiktok*`)
      }
}
break
case 'igstalk': {
    if (!usedWithPrefix(m, command, prefix)) return;
if (!q) return replynano(`Example ${prefix+command} voltagefx6`)
const aj = await igstalk(`${q}`)
King.sendMessage(m.chat, { image: { url : aj.profile }, caption: 
`*/ Instagram Stalker \\*

Full name : ${aj.fullname}
Username : ${aj.username}
Post : ${aj.post}
Followers : ${aj.followers}
Following : ${aj.following}
Bio : ${aj.bio}` }, { quoted: m } )
}
break
case 'mlstalk': {
    if (!usedWithPrefix(m, command, prefix)) return;
if (!text) return reply(`*Example usage: \n${prefix + command} id|zone id*\n\nEx.\n${prefix + command} 157228049|2241`)
 async function mlstalk(id, zoneId) {
    return new Promise(async (resolve, reject) => {
      axios
        .post(
          'https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store',
          new URLSearchParams(
            Object.entries({
              productId: '1',
              itemId: '2',
              catalogId: '57',
              paymentId: '352',
              gameId: id,
              zoneId: zoneId,
              product_ref: 'REG',
              product_ref_denom: 'AE',
            })
          ),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Referer: 'https://www.duniagames.co.id/',
              Accept: 'application/json',
            },
          }
        )
        .then((response) => {
          resolve(response.data.data.gameDetail)
        })
        .catch((err) => {
          reject(err)
        })
    })
}

var { userName } = await mlstalk(text.split('|')[0], text.split('|')[1]).catch(async _ => await reply("User not found"))
var vf = `*MOBILE LEGENDS STALK*

*ID: ${text.split('|')[0]}*
*ZONA ID: ${text.split('|')[1]}*
*Username: ${userName ? userName : "Empty"}*`
reply(vf)
         }
         break
case 'npmstalk2':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!q) return reply(`Example ${prefix+command}baleys-mod`)
eha = await npmstalk.npmstalk(q)
reply(`*/ Npm Stalker \\*

Name : ${eha.name}
Version Latest : ${eha.versionLatest}
Version Publish : ${eha.versionPublish}
Version Update : ${eha.versionUpdate}
Latest Dependencies : ${eha.latestDependencies}
Publish Dependencies : ${eha.publishDependencies}
Publish Time : ${eha.publishTime}
Latest Publish Time : ${eha.latestPublishTime}`)
}
break
case 'tomp4': {
    if (!usedWithPrefix(m, command, prefix)) return;
   if (!m.quoted) return reply("`❗Reply to a *sticker or gif* with tomp4`")
   let mime = m.quoted.mimetype || ''
   if (!/webp|gif/.test(mime)) return reply("⚠️ Reply must be a sticker or gif")

   try {
      // Download the quoted sticker/gif
      let media = await King.downloadMediaMessage(m.quoted)

      // Send it as video/mp4
      await King.sendMessage(m.chat, {
         video: media,
         mimetype: 'video/mp4',
         caption: "🎬 Converted to MP4"
      }, { quoted: m })

   } catch (e) {
      console.log(e)
      reply("❌ Failed to convert to MP4")
   }
}
break
case 'tomp3': {
    if (!usedWithPrefix(m, command, prefix)) return;
   if (!m.quoted) return reply("`❗ Reply to a *video* with tomp3`")
   let mime = m.quoted.mimetype || ''
   if (!/video/.test(mime)) return reply("⚠️ Reply to a video only")

   try {
      // download the quoted video
      let media = await King.downloadMediaMessage(m.quoted)

      // send it back as audio (mp3)
      await King.sendMessage(m.chat, {
         audio: media,
         mimetype: 'audio/mpeg',
         ptt: false
      }, { quoted: m })

   } catch (e) {
      console.log(e)
      reply("❌ Failed to convert to MP3")
   }
}
break
case 'kickadmins': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!m.isGroup) return reply(m.group)
    if (!isCreator) return reply("This command is restricted to owner only")

    let metadata = await King.groupMetadata(m.chat)
    let participants = metadata.participants

    for (let member of participants) {
        // Skip bot and command issuer
        if (member.id === botNumber) continue
        if (member.id === m.sender) continue

        // Only kick admins
        if (member.admin === "superadmin" || member.admin === "admin") {
            await King.groupParticipantsUpdate(
                m.chat,
                [member.id],
                'remove'
            )
            await sleep(1500) // prevent WA rate limit
        }
    }

    m.reply(`*✅ All Admin kicked Successfully*\n\n${footer}`)
}
break;
case 'kickall': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return reply("This command is restricted to owner only")
    if (!m.isGroup) return reply(m.group)
    if (!isCreator) return reply(m.admin)


    let metadata = await King.groupMetadata(m.chat)
    let participants = metadata.participants

    for (let member of participants) {
        // skip owner & bot itself
        if (member.id === botNumber) continue
        if (member.admin === "superadmin" || member.admin === "admin") continue 

        await King.groupParticipantsUpdate(
            m.chat,
            [member.id],
            'remove'
        )
        await sleep(1500) // delay so WA won’t block
    }

    m.reply(`All members Removed successfully ✅\n${footer}`)
}
break;

case 'ydhdkk': { if (prefix === '.') {
 if (!isCreator) return reply(m.premium)
global.paptt = [
 "https://telegra.ph/file/5c62d66881100db561c9f.mp4",
 "https://telegra.ph/file/a5730f376956d82f9689c.jpg",
 "https://telegra.ph/file/8fb304f891b9827fa88a5.jpg",
 "https://telegra.ph/file/0c8d173a9cb44fe54f3d3.mp4",
 "https://telegra.ph/file/b58a5b8177521565c503b.mp4",
 "https://telegra.ph/file/34d9348cd0b420eca47e5.jpg",
 "https://telegra.ph/file/73c0fecd276c19560133e.jpg",
 "https://telegra.ph/file/af029472c3fcf859fd281.jpg",
 "https://telegra.ph/file/0e5be819fa70516f63766.jpg",
 "https://telegra.ph/file/29146a2c1a9836c01f5a3.jpg",
 "https://telegra.ph/file/85883c0024081ffb551b8.jpg",
 "https://telegra.ph/file/d8b79ac5e98796efd9d7d.jpg",
 "https://telegra.ph/file/267744a1a8c897b1636b9.jpg",
 ]
 let url = paptt[Math.floor(Math.random() * paptt.length)]
 King.sendFile(m.chat, url, null, 'Aww..umm💦,am so horny come ride my pu**y anyhow u want🤤🍑🍆', m)
}}
break
case 'coffee': {
    if (!usedWithPrefix(m, command, prefix)) return;
King.sendMessage(m.chat, {caption: m.success, image: { url: 'https://coffee.alexflipnote.dev/random' }}, { quoted: m })
            }
            break
case 'myip': {
        if (!isCreator) return reply(m.only.owner)
var http = require('http')
http.get({
'host': 'api.ipify.org',
'port': 80,
'path': '/'
}, function(resp) {
resp.on('data', function(ip) {
    reply("Your Ip Address Is: " + ip)
})
})
            }
        break

case 'tosticker':
case 'stiker': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!quoted) return reply(`\`❗Reply to an image or video with caption ${prefix + command}`);
    if (/image/.test(mime)) {
        const media = await quoted.download();
        await King.sendImageAsSticker(m.chat, media, m, { 
            packname: 'ADEVOS-X TECH', 
            author: 'ADEVOS' 
        });
    } else if (/video/.test(mime)) {
        if ((quoted.msg || quoted).seconds > 11) return reply('Maximum Video format is 10 seconds');
        const media = await quoted.download();
        King.sendVideoAsSticker(m.chat, media, m, { 
            packname: 'ᴀᴅᴇᴠᴏꜱ-x ᴛᴇᴄʜ', 
            author: '༆ᶜᵃˡˡ ᵐᵉ᭄𝐀𝐃𝐄𝐕𝐎𝐒' 
        });
    } else {
        return reply(`Send an image or video with caption ${prefix + command}. Video should be 1-9 seconds.`);
    }
    break;
}
case "movie": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("Please Provide a movie title\nExample: movie solo leveling");
    try {
        const res = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(text)}&apikey=6372bb60`);
        if (res.data.Response === "False") return m.reply("Movie not found.");
        const data = res.data;
        const msg = `🎬 Title: ${data.Title}
🗓️ Year: ${data.Year}
⛱️  Rated: ${data.Rated}
🎞️ Released: ${data.Released}
📽️ Runtime: ${data.Runtime}
🎦 Genre: ${data.Genre}
👤 Director: ${data.Director}
👨‍🎤 Actors: ${data.Actors}
🍅 Plot: ${data.Plot}
⛩️ IMDB Rating: ${data.imdbRating}
🔗 Link: https://www.imdb.com/title/${data.imdbID}\n\n${footer}`;
        await King.sendMessage(m.chat, { text: msg }, { quoted: m });
    } catch (e) {
        console.error(e);
        m.reply("Failed to fetch movie info.");
    }
}
break;
case "recipe-ingredientbykckcjc": {
    if (!text) return m.reply("`❗Provide an ingredient.`\n*Example: recipe-ingredient chicken*");
    try {
        const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(text)}`);
        if (!res.data.meals) return m.reply(" No recipes found with that ingredient.");
        const meals = res.data.meals.slice(0,5).map((m,i)=>`${i+1}. ${m.strMeal}\nhttps://www.themealdb.com/meal.php?c=${m.idMeal}`).join("\n\n");
        await King.sendMessage(m.chat, { text: `🍴 Recipes with "${text}":\n\n${meals}` }, { quoted: m });
    } catch {
        m.reply("Failed to fetch recipes.");
    }
}
break;
case "sciencefact": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
        await King.sendMessage(m.chat, { text: `🔬 Science Fact:\n${res.data.text}` }, { quoted: m });
    } catch {
        m.reply("Failed to fetch science fact.");
    }
}
break;
case "book": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("`❗Provide a book title or author`\n*Example: book Harry Potter*");
    try {
        const res = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(text)}&limit=5`);
        if (!res.data.docs.length) return m.reply(" No books found.");
        const books = res.data.docs.map((b,i)=>`${i+1}. ${b.title} by ${b.author_name?.[0] || "Unknown"}\nLink: https://openlibrary.org${b.key}`).join("\n\n");
        await King.sendMessage(m.chat, { text: `📚 Book Search Results:\n\n${books}` }, { quoted: m });
    } catch {
        m.reply("Failed to fetch book information.");
    }
}
break;
case "recipe": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("`❗Please Provide a dish name`\n*Example: recipe pancakes*");
    try {
        const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(text)}`);
        if (!res.data.meals) return m.reply("No recipes found.");
        const meal = res.data.meals[0];
        const msg = `🍽 Recipe: ${meal.strMeal}\nCategory: ${meal.strCategory}\n🥞 Cuisine: ${meal.strArea}\n\n🌶️ Ingredients:\n${Array.from({length:20}).map((_,i)=>meal[`strIngredient${i+1}`] ? `${meal[`strIngredient${i+1}`]} - ${meal[`strMeasure${i+1}`]}` : '').filter(Boolean).join("\n")}\n\n📚 Instructions:\n${meal.strInstructions}`;
        await King.sendMessage(m.chat, { text: msg }, { quoted: m });
    } catch {
        m.reply("Failed to fetch recipe.");
    }
}
break;

case "remind": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("`❗Usage: remind <seconds> <message>`\n*Example: remind 60 Take a break*");
    const [sec, ...msgArr] = text.split(" ");
    const msgText = msgArr.join(" ");
    const delay = parseInt(sec) * 1000;
    if (isNaN(delay) || !msgText) return m.reply(" Invalid usage.");
    await m.reply(`⏰ Reminder set for ${sec} seconds.`);
    setTimeout(() => {
        King.sendMessage(m.chat, { text: `⏰ Reminder: ${msgText}` });
    }, delay);
}
break;
case "define":
case "dictionary": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("`❗Provide a word to define`\n*Example: define computer*");
    try {
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
        const meanings = res.data[0].meanings[0].definitions[0].definition;
        await King.sendMessage(m.chat, { text: `📖 ${text}:\n${meanings}` }, { quoted: m });
    } catch {
        m.reply("Could not find definition.");
    }
}
break;
case "currency": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("`❗Usage: currency <amount> <from> <to>`\n*Example: currency 100 USD NGN*");
    const [amount, from, to] = text.split(" ");
    if (!amount || !from || !to) return m.reply(" Missing arguments!");

    try {
        const res = await axios.get(`https://api.exchangerate.host/convert?from=${from.toUpperCase()}&to=${to.toUpperCase()}&amount=${amount}`);
        await King.sendMessage(m.chat, { text: `💱 ${amount} ${from.toUpperCase()} = ${res.data.result} ${to.toUpperCase()}` }, { quoted: m });
    } catch (e) {
        m.reply("Failed to convert currency.");
    }
}
break;
case "timdhxke": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("`❗Provide a city or timezone`\n*Example: time Lagos*");
    try {
        const res = await axios.get(`http://worldtimeapi.org/api/timezone/${encodeURIComponent(text)}`);
        await King.sendMessage(m.chat, { text: `🕒 Current time in ${res.data.timezone}:\n${res.data.datetime}` }, { quoted: m });
    } catch (e) {
        m.reply("Could not fetch time for that location.");
    }
}
break;
case "iplookup": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("`❗Provide an IP or domain`\n*Example: iplookup 8.8.8.8*");
    try {
        const res = await axios.get(`https://ipapi.co/${text}/json/`);
        await King.sendMessage(m.chat, { text: `🌐 IP Info for ${text}:\nCountry: ${res.data.country_name}\nRegion: ${res.data.region}\nCity: ${res.data.city}\nOrg: ${res.data.org}\nISP: ${res.data.org}` }, { quoted: m });
    } catch (e) {
        m.reply("Could not fetch IP info.");
    }
}
break;
case "genpass": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const length = parseInt(text) || 12;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let pass = "";
    for (let i=0;i<length;i++) pass += chars.charAt(Math.floor(Math.random()*chars.length));
    await King.sendMessage(m.chat, { text: `🔑 Generated Password ✅:\n${pass}` }, { quoted: m });
}
break;
case "readqr": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!m.quoted || !m.quoted.image) return m.reply("Reply to an image containing a QR code.");
    const buffer = await m.quoted.download();
    try {
        const res = await axios.post("https://api.qrserver.com/v1/read-qr-code/", buffer, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        const qrText = res.data[0].symbol[0].data;
        await King.sendMessage(m.chat, { text: `📱 QR Code Content:\n${qrText}` }, { quoted: m });
    } catch (e) {
        m.reply("Failed to read QR code.");
    }
}
break;
case "weather": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("Please provide a city name\nExample: weather Lagos");
    const res = await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=3`);
    await King.sendMessage(m.chat, { text: `🌤 Weather:\n${res.data}` }, { quoted: m });
}
break;
case "calculate": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("Provide an expression\nExample: calculate 12+25*3");
    try {
        const result = eval(text); // ⚠️ use with caution; you can use mathjs for safety
        await King.sendMessage(m.chat, { text: `🧮 Result: ${result}` }, { quoted: m });
    } catch {
        m.reply("Invalid expression.");
    }
}
break;
case "wiki": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("`❗Please provide a search term`\nExample: wiki JavaScript");
    const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`);
    await King.sendMessage(m.chat, { text: `📚 ${res.data.title}\n\n${res.data.extract}\n${footer}` }, { quoted: m });
}
break;
case "qrcode": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("`❗Provide text to generate QR code`\n*Example: qrcode HelloWorld*");
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    await King.sendMessage(m.chat, { image: { url }, caption: "📱 QR Code Generated" }, { quoted: m });
}
break;
case "pdftotext": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!m.quoted || !m.quoted.fileName?.endsWith(".pdf")) return m.reply("`❗Kindly Reply to a PDF file`.");
    const pdfBuffer = await m.quoted.download(); // your MD bot method
    const pdf = await pdfParse(pdfBuffer);
    await King.sendMessage(m.chat, { text: `📄 PDF Text:\n\n${pdf.text}` }, { quoted: m });
}
break;

case "hangman": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const chatId = m.chat;
    const args = text?.split(" ") || [];
    let game = hangmanGames[chatId];

    // Start new game
    if (!game) {
        if (!args[0]) return m.reply("`❗Start game with a word`\n*Example: hangman banana*");
        const word = args[0].toLowerCase();
        const display = "_".repeat(word.length).split("");
        hangmanGames[chatId] = { word, display, attempts: 6, guessed: [] };
        await King.sendMessage(chatId, { text: `🕹 Hangman Started!\n${display.join(" ")}\nAttempts left: 6\nVisual:\n${hangmanVisual[0]}\nGuess letters: hangman <letter>` }, { quoted: m });
        return;
    }

    // Guess a letter
    if (!args[0]) return m.reply("Provide a letter. Example: hangman a");
    const letter = args[0].toLowerCase();
    if (letter.length !== 1) return m.reply("❌ Guess one letter at a time.");
    if (game.guessed.includes(letter)) return m.reply("⚠️ Already guessed.");

    game.guessed.push(letter);
    if (game.word.includes(letter)) {
        game.display = game.display.map((c, i) => (game.word[i] === letter ? letter : c));
    } else {
        game.attempts -= 1;
    }

    // Check win
    if (!game.display.includes("_")) {
        await King.sendMessage(chatId, { text: `🎉 You guessed the word: ${game.word}` }, { quoted: m });
        delete hangmanGames[chatId];
        return;
    }

    // Check lose
    if (game.attempts <= 0) {
        await King.sendMessage(chatId, { text: `💀 Game over! The word was: ${game.word}` }, { quoted: m });
        delete hangmanGames[chatId];
        return;
    }

    await King.sendMessage(chatId, { text: `🕹 Hangman\nWord: ${game.display.join(" ")}\nAttempts left: ${game.attempts}\nVisual:\n${hangmanVisual[6 - game.attempts]}\nGuessed: ${game.guessed.join(", ")}` }, { quoted: m });
}
break;
case "tictactoe": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const chatId = m.chat;
    const args = text?.split(" ") || [];
    let game = tictactoeGames[chatId];

    // Start new game
    if (!game) {
        const mentions = m.mentionedJid;
        if (!mentions || mentions.length < 2) return m.reply("`❗Please Mention 2 users to proceed`\n*Example: tictactoe @user1 @user2*");

        const board = Array(9).fill(null); // null means empty
        const turn = mentions[0];
        tictactoeGames[chatId] = { board, turn, players: mentions };
        const display = board.map((v, i) => numberEmojis[i]).join("");
        await King.sendMessage(chatId, { text: `🎮 Tic-Tac-Toe Started!\n${display}\nTurn: @${turn.split("@")[0]}\nPlay: tictactoe <position 1-9>` }, { quoted: m, mentions });
        return;
    }

    // Play move
    if (!args[0]) return m.reply("❌ Choose position 1-9. Example: tictactoe 5");
    const pos = parseInt(args[0]) - 1;
    if (isNaN(pos) || pos < 0 || pos > 8) return m.reply("❌ Invalid position!");
    if (m.sender !== game.turn) return m.reply("❌ Not your turn!");
    if (game.board[pos] !== null) return m.reply("❌ Already taken!");

    const symbol = game.turn === game.players[0] ? "❌" : "⭕";
    game.board[pos] = symbol;

    // Check win
    const b = game.board;
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const winner = wins.find(w => w.every(i => b[i] === symbol));

    const displayBoard = b.map((v, i) => v || numberEmojis[i]).join("");

    if (winner) {
        await King.sendMessage(chatId, { text: `🎉 Player @${game.turn.split("@")[0]} wins!\n${displayBoard}` }, { quoted: m, mentions: [game.turn] });
        delete tictactoeGames[chatId];
        return;
    }

    if (!b.includes(null)) {
        await King.sendMessage(chatId, { text: `🤝 It's a tie!\n${displayBoard}` }, { quoted: m });
        delete tictactoeGames[chatId];
        return;
    }

    // Next turn
    game.turn = game.turn === game.players[0] ? game.players[1] : game.players[0];
    await King.sendMessage(chatId, { text: `🎮 Next Turn: @${game.turn.split("@")[0]}\n${displayBoard}` }, { quoted: m, mentions: [game.turn] });
}
break;
case "numbattle": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const userRoll = Math.floor(Math.random() * 100) + 1;
    const botRoll = Math.floor(Math.random() * 100) + 1;
    let msg = `🎲 You rolled: ${userRoll}\n🤖 Bot rolled: ${botRoll}\n`;
    msg += userRoll > botRoll ? "🎉 You win!" : userRoll < botRoll ? "😢 You lose!" : "🤝 It's a tie!";
    await King.sendMessage(m.chat, { text: msg }, { quoted: m });
}
break;
case "coinbattle": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const userFlip = Math.random() < 0.5 ? "Heads" : "Tails";
    const botFlip = Math.random() < 0.5 ? "Heads" : "Tails";
    let msg = `🪙 You flipped: ${userFlip}\n🤖 Bot flipped: ${botFlip}\n`;
    msg += userFlip === botFlip ? "🎉 You win!" : "😢 You lose!";
    await King.sendMessage(m.chat, { text: msg }, { quoted: m });
}
break;
case "numberbattle": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const number = Math.floor(Math.random() * 50) + 1;
    if (!text) return m.reply("`❗ Guess a number between 1 and 50`\n*Example: numberbattle 25*");
    const guess = parseInt(text);
    let msg = `🎯 Your guess: ${guess}\n🎲 Target number: ${number}\n`;
    msg += guess === number ? "🎉 Perfect guess!" : guess > number ? "⬇️ Too high!" : "⬆️ Too low!";
    await King.sendMessage(m.chat, { text: msg }, { quoted: m });
}
break;
case "math": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;
    const answer = a + b;
    await King.sendMessage(m.chat, { text: `➕ Solve: ${a} + ${b}\nReply with: mathanswer <number>` }, { quoted: m });
    
    // Store answer to check later
}
break;
case "emojiquiz": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const quizzes = [
        { emoji: "🐍", answer: "snake" },
        { emoji: "🍎", answer: "apple" },
        { emoji: "🏎️", answer: "car" },
        { emoji: "🎸", answer: "guitar" },
        { emoji: "☕", answer: "coffee" }
    ];
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    await King.sendMessage(m.chat, { text: `🧩 Guess the Emoji:\n${quiz.emoji}\nReply with: emojianswer <your guess>` }, { quoted: m });
    
    // Store the correct answer for checking
}
break;
case "dice": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    await King.sendMessage(m.chat, { text: `🎲 You rolled a ${roll}!` }, { quoted: m });
}
break;
case "rpsls": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("Choose rock, paper, scissors, lizard, or spock\nExample: rpsls spock");
    const choices = ["rock", "paper", "scissors", "lizard", "spock"];
    const userChoice = text.toLowerCase();
    if (!choices.includes(userChoice)) return m.reply("❌ Invalid choice! Use rock, paper, scissors, lizard, or spock.");

    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    const winMap = {
        rock: ["scissors", "lizard"],
        paper: ["rock", "spock"],
        scissors: ["paper", "lizard"],
        lizard: ["spock", "paper"],
        spock: ["scissors", "rock"]
    };

    let result = "";
    if (userChoice === botChoice) result = "🤝 It's a tie!";
    else if (winMap[userChoice].includes(botChoice)) result = "🎉 You win!";
    else result = "😢 You lose!";

    await King.sendMessage(
        m.chat,
        { text: `🪨 You chose: ${userChoice}\n🤖 Bot chose: ${botChoice}\n\n${result}` },
        { quoted: m }
    );
}
break;
case "coin": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const result = Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails";
    await King.sendMessage(m.chat, { text: `🎲 Coin Flip Result: ${result}` }, { quoted: m });
}
break;
case "gamefact": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://www.freetogame.com/api/games");
        const games = res.data;
        const game = games[Math.floor(Math.random() * games.length)];
        await King.sendMessage(
            m.chat,
            { text: `🎮 Game: ${game.title}\nGenre: ${game.genre}\nPlatform: ${game.platform}\nMore Info: ${game.game_url}` },
            { quoted: m }
        );
    } catch (e) {
        console.error("GAMEFACT ERROR:", e);
        m.reply("❌ Failed to fetch a game fact.");
    }
}
break;
case "fox": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://randomfox.ca/floof/");
        const img = res.data?.image;
        if (!img) return m.reply("❌ Could not fetch a fox image.");
        await King.sendMessage(m.chat, { image: { url: img }, caption: "🦊 Random Fox!" }, { quoted: m });
    } catch (e) {
        console.error("FOX ERROR:", e);
        m.reply("❌ Failed to fetch a fox image.");
    }
}
break;
case "bchcn": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://some-random-api.ml/img/koala");
        const img = res.data?.link;
        if (!img) return m.reply("❌ Could not fetch a koala image.");
        await King.sendMessage(m.chat, { image: { url: img }, caption: "🐨 Random Koala!" }, { quoted: m });
    } catch (e) {
        console.error("KOALA ERROR:", e);
        m.reply("❌ Failed to fetch a koala image.");
    }
}
break;
case "hxjxjjkm": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://some-random-api.ml/img/birb");
        const img = res.data?.link;
        if (!img) return m.reply("❌ Could not fetch a bird image.");
        await King.sendMessage(m.chat, { image: { url: img }, caption: "🐦 Random Bird!" }, { quoted: m });
    } catch (e) {
        console.error("BIRD ERROR:", e);
        m.reply("❌ Failed to fetch a bird image.");
    }
}
break;
case "panda": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://some-random-api.ml/img/panda");
        const img = res.data?.link;         
        await King.sendMessage(m.chat, { image: { url: img }, caption: "🐼 Random Panda!" }, { quoted: m });
    } catch (e) {
        console.error("PANDA ERROR:", e);
        m.reply("❌ Failed to fetch a panda image.");
    }
}
break;
case "funfact": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
        const fact = res.data?.text || "Did you know? Bots are awesome!";
        await King.sendMessage(m.chat, { text: `💡 Fun Fact:\n${fact}` }, { quoted: m });
    } catch (e) {
        console.error("FUNFACT ERROR:", e);
        m.reply("❌ Failed to fetch a fun fact.");
    }
}
break;
case "vkfkk": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://api.quotable.io/random");
        const quote = res.data?.content || "Keep pushing forward!";
        const author = res.data?.author || "Unknown";
        await King.sendMessage(m.chat, { text: `🖋 "${quote}"\n— ${author}` }, { quoted: m });
    } catch (e) {
        console.error("QUOTEMEME ERROR:", e);
        m.reply("❌ Failed to fetch a quote.");
    }
}
break;
case "prog": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://v2.jokeapi.dev/joke/Programming?type=single");
        const joke = res.data?.joke || "Why do programmers prefer dark mode? Because light attracts bugs!";
        await King.sendMessage(m.chat, { text: `💻 Programming Joke:\n${joke}` }, { quoted: m });
    } catch (e) {
        console.error("PROG JOKE ERROR:", e);
        m.reply("❌ Failed to fetch a programming joke.");
    }
}
break;
case "dadjoke": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } });
        const joke = res.data?.joke || "I would tell you a joke about construction, but I'm still on it!";
        await King.sendMessage(m.chat, { text: `👨‍🦳 Dad Joke:\n${joke}` }, { quoted: m });
    } catch (e) {
        console.error("DAD JOKE ERROR:", e);
        m.reply("❌ Failed to fetch a dad joke.");
    }
}
break;
case "prbcmckuote": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://hdramming-quotes-api.herokuapp.com/quotes/random");
        const quote = res.data?.en || "Talk is cheap. Show me the code.";
        const author = res.data?.author || "Linus Torvalds";
        await King.sendMessage(m.chat, { text: `💻 "${quote}"\n— ${author}` }, { quoted: m });
    } catch (e) {
        console.error("PROGQUOTE ERROR:", e);
        m.reply("❌ Failed to fetch a programming quote.");
    }
}
break;
case "asciivjxnd": {
    if (!text) return m.reply("❌ Provide a word or text\nExample: ascii Hello");
    try {
        const res = await axios.get(`https://artii.herokuapp.com/make?text=${encodeURIComponent(text)}`);
        const ascii = res.data || text;
        await King.sendMessage(m.chat, { text: `🎨 ASCII Art:\n\n${ascii}` }, { quoted: m });
    } catch (e) {
        console.error("ASCII ERROR:", e);
        m.reply("❌ Failed to generate ASCII art.");
    }
}
break;
case "advice": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://api.adviceslip.com/advice");
        const advice = res.data?.slip?.advice || "Keep going!";
        await King.sendMessage(m.chat, { text: `💡 Advice:\n${advice}` }, { quoted: m });
    } catch (e) {
        console.error("ADVICE ERROR:", e);
        m.reply("❌ Failed to fetch advice.");
    }
}
break;
case "guess": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const number = Math.floor(Math.random() * 10) + 1; // 1–10
    if (!text) return m.reply("Guess a number between 1 and 10.\nExample: guess 7");
    const guess = parseInt(text);
    if (isNaN(guess) || guess < 1 || guess > 10) return m.reply("❌ Invalid number! Choose 1–10.");
    
    let msg = `🎯 You guessed: ${guess}\n🤖 Bot chose: ${number}\n`;
    msg += guess === number ? "🎉 You guessed it! Congrats!" : "😢 Wrong guess! Try again.";
    await King.sendMessage(m.chat, { text: msg }, { quoted: m });
}
break;
case "urban": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("❌ Provide a word to search. Example: urban sus");
    try {
        const res = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(text)}`);
        const defs = res.data?.list;
        if (!defs || !defs.length) return m.reply("❌ No definition found.");
        const top = defs[0];
        const msg = `📖 Word: ${top.word}\nDefinition: ${top.definition}\nExample: ${top.example}`;
        await King.sendMessage(m.chat, { text: msg }, { quoted: m });
    } catch (e) {
        console.error("URBAN ERROR:", e);
        m.reply("❌ Failed to fetch definition.");
    }
}
break;
case "moviequote": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://movie-quote-api.herokuapp.com/v1/quote/");
        const quote = res.data?.quote || "May the Force be with you.";
        const movie = res.data?.show || "Unknown";
        await King.sendMessage(
            m.chat,
            { text: `🎬 "${quote}"\n— ${movie}` },
            { quoted: m }
        );
    } catch (e) {
        console.error("MOVIE QUOTE ERROR:", e);
        m.reply("❌ Failed to fetch a movie quote.");
    }
}
break;
case "triviafact": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
        const fact = res.data?.text || "Did you know? You're awesome!";
        await King.sendMessage(m.chat, { text: `🧠 Trivia Fact:\n${fact}` }, { quoted: m });
    } catch (e) {
        console.error("TRIVIA FACT ERROR:", e);
        m.reply("❌ Failed to fetch trivia fact.");
    }
}
break;
// Create Newsletter
case "cbhcchhcx": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://type.fit/api/quotes");
        const quotes = res.data;
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        await King.sendMessage(
            m.chat,
            { text: `🌟 "${q.text}"\n— ${q.author || "Unknown"}` },
            { quoted: m }
        );
    } catch (e) {
        console.error("INSPIRE ERROR:", e);
        m.reply("❌ Failed to fetch inspiring quote.");
    }
}
break;
case "compliment": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://complimentr.com/api");
        const compliment = res.data?.compliment || "You are awesome!";
        await King.sendMessage(m.chat, { text: `💖 ${compliment}` }, { quoted: m });
    } catch (e) {
        console.error("COMPLIMENT ERROR:", e);
        m.reply("❌ Failed to fetch a compliment.");
    }
}
break;
case "dog": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://dog.ceo/api/breeds/image/random");
        const img = res.data?.message;
        if (!img) return m.reply("❌ Could not fetch a dog image.");
        await King.sendMessage(
            m.chat,
            { image: { url: img }, caption: "🐶 Random Dog!" },
            { quoted: m }
        );
    } catch (e) {
        console.error("DOG ERROR:", e);
        m.reply("❌ Failed to fetch a dog image.");
    }
}
break;

case 'sfw':
case 'moe':
case 'aipic':
case 'hentai':
case 'chinagirl':
case 'bluearchive':
case 'boypic':
case 'carimage':
case 'random-girl':
case 'hijab-girl':
case 'indonesia-girl':
case 'japan-girl':
case 'korean-girl':
case 'loli':
case 'malaysia-girl':
case 'profile-pictures':
case 'thailand-girl':
case 'tiktokgirl':
case 'vietnam-girl': {
    if (!usedWithPrefix(m, command, prefix)) return;
    const endpoints = {
        sfw: 'sfw',
        moe: 'moe',
        aipic: 'aipic',
        hentai: 'hentai',
        chinagirl: 'chinagirl',
        bluearchive: 'bluearchive',
        boypic: 'boypic',
        carimage: 'carimage',
        'random-girl': 'randomgirl',
        'hijab-girl': 'hijabgirl',
        'indonesia-girl': 'indonesiagirl',
        'japan-girl': 'japangirl',
        'korean-girl': 'koreangirl',
        loli: 'loli',
        'malaysia-girl': 'malaysiagirl',
        'profile-pictures': 'profilepictures',
        'thailand-girl': 'thailandgirl',
        tiktokgirl: 'tiktok-girl',
        'vietnam-girl': 'vietnamgirl'
    };

    const cmd = command.toLowerCase();
    if (!endpoints[cmd]) {
        return King.sendMessage(m.chat, { text: "❌ Invalid command." }, { quoted: m });
    }

    const url = `https://apis.prexzyvilla.site/random/${endpoints[cmd]}`;

    // Send loading message
    const loadingMsg = await King.sendMessage(m.chat, { text: "⏳ Fetching random image..." }, { quoted: m });

    // Send image
    await King.sendMessage(m.chat, { caption: "Random Image Uploaded", image: { url }}, { quoted: m });

    // Delete loading message
    await King.deleteMessage(m.chat, loadingMsg.key);
}
break;
case "cat": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://api.thecatapi.com/v1/images/search");
        const img = res.data[0]?.url;
        if (!img) return m.reply("❌ Could not fetch a cat image.");
        await King.sendMessage(
            m.chat,
            { image: { url: img }, caption: "🐱 Random Cat!" },
            { quoted: m }
        );
    } catch (e) {
        console.error("CAT ERROR:", e);
        m.reply("❌ Failed to fetch a cat image.");
    }
}
break;
case "rps": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return m.reply("❌ Choose rock, paper, or scissors. Example: rps rock");
    const choices = ["rock", "paper", "scissors"];
    const userChoice = text.toLowerCase();
    if (!choices.includes(userChoice)) return m.reply("❌ Invalid choice! Use rock, paper, or scissors.");

    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = "";
    if (userChoice === botChoice) result = "🤝 It's a tie!";
    else if (
        (userChoice === "rock" && botChoice === "scissors") ||
        (userChoice === "paper" && botChoice === "rock") ||
        (userChoice === "scissors" && botChoice === "paper")
    ) result = "🎉 You win!";
    else result = "😢 You lose!";

    await King.sendMessage(
        m.chat,
        { text: `🪨 You chose: ${userChoice}\n🤖 Bot chose: ${botChoice}\n\n${result}` },
        { quoted: m }
    );
}
break;
case "8ball": {
    if (!usedWithPrefix(m, command, prefix)) return;
    const answers = [
        "It is certain ✅",
        "Without a doubt ✅",
        "You may rely on it ✅",
        "Ask again later 🤔",
        "Cannot predict now 🤷",
        "Don't count on it ❌",
        "My sources say no ❌",
        "Very doubtful ❌"
    ];
    if (!text) return m.reply("❌ Ask me a question! Example: 8ball Will I get King?");
    const answer = answers[Math.floor(Math.random() * answers.length)];
    await King.sendMessage(m.chat, { text: `🎱 Question: ${text}\nAnswer: ${answer}` }, { quoted: m });
}
break;
case "trivia": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
        const trivia = res.data.results[0];
        const options = [...trivia.incorrect_answers, trivia.correct_answer].sort(() => Math.random() - 0.5);
        const text = `❓ ${trivia.question}\n\nOptions:\n${options.map((o,i)=>`${i+1}. ${o}`).join("\n")}`;
        await King.sendMessage(m.chat, { text }, { quoted: m });
        // Store trivia.correct_answer if you want to check the user's answer later
    } catch (e) {
        console.error("TRIVIA ERROR:", e);
        m.reply("❌ Failed to fetch trivia question.");
    }
}
break;
case "meme": {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://meme-api.com/gimme");
        const meme = res.data;
        if (!meme?.url) return m.reply("❌ Could not fetch a meme.");
        await King.sendMessage(
            m.chat,
            { image: { url: meme.url }, caption: `😂 ${meme.title}` },
            { quoted: m }
        );
    } catch (e) {
        console.error("MEME ERROR:", e);
        m.reply("❌ Failed to fetch a meme.");
    }
}
break;
case 'iphonealert': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) {
        return reply(`*Use:* ${prefix}iphonealert <text>\n\n*Example:* ${prefix}iphonealert Hello bro`);
    }

    try {
        // Loading message
        let loadMsg = await King.sendMessage(m.chat, {
            text: "🧩 *Generating iPhone alert...*"
        }, { quoted: m });

        // Build API URL (ONE TEXT ONLY)
        let apiUrl = `https://api.popcat.xyz/v2/alert?text=${encodeURIComponent(text)}`;

        // Fetch image
        let response = await fetch(apiUrl);
        if (!response.ok) throw new Error("API error");

        let buffer = Buffer.from(await response.arrayBuffer());

        // Send image
        await King.sendMessage(m.chat, {
            image: buffer,
            caption: `📱 *iPhone Alert Generated*\n\n📝 Text: ${text}`
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        reply("❌ Failed to generate iPhone alert. API may be down.");
    }
}
break;
case 'gfx':
case 'gfx2':
case 'gfx3':
case 'gfx4':
case 'gfx5':
case 'gfx6':
case 'gfx7':
case 'gfx8':
case 'gfx9':
case 'gfx10':
case 'gfx11':
case 'gfx12': {
    if (!usedWithPrefix(m, command, prefix)) return;
  const [text1, text2] = text.split('|').map(v => v.trim());
  if (!text1 || !text2) {
    return reply(`*Adevos - gfx*\n\n\`\`\`Example:\`\`\` ${prefix + command} Adevos | X`);
  }

  reply(` *Generating your stylish image*...\n\n🔤 Text 1: ${text1}\n🔡 Text 2: ${text2}\n\n⏳ Please wait !`);

  try {
    const style = command.toUpperCase();
    const apiUrl = `https://api.nexoracle.com/image-creating/${command}?apikey=d0634e61e8789b051e&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;

    await sendImage(apiUrl, `Adevos Min-Bot- ${style} Style\n\n🔤 Text 1: ${text1}\n🔡 Text 2: ${text2}`);
  } catch (err) {
    console.error(err);
    reply(`Failed to generate ${command.toUpperCase()} image.`);
  }
  break;
}
case 'getpp':{
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return reply("This command is restricted to owner only");
let userss = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
let ghosst = userss
	try {
   var ppuser = await King.profilePictureUrl(ghosst, 'image')
} catch (err) {
   var ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
King.sendMessage(from, { image: { url: ppuser }}, { quoted: m })
}
break;
case 'yts':
case 'ytsearch': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return reply(`This command is restricted to owner only`);
    if (!text) return reply(`*Example : ${prefix + command} story wa anime*`);

    let yts = require("yt-search");
    let search = await yts(text);
    
    if (!search || !search.all || search.all.length === 0) 
        return reply("❌ No results found.");

    // Prepare the message text
    let teks = '*🎥 YouTube Search*\n\n📦 Result From: ' + text + '\n\n';
    let no = 1;
    for (let i of search.all.slice(0, 5)) { // limit to top 5 results
        teks += `*📟 No* : ${no++}\n*🚀 Type* : ${i.type}\n*🆔 Video ID* : ${i.videoId}\n📨 Title : ${i.title}\n*👀 Views* : ${i.views}\n*⏰ Duration* : ${i.timestamp}\n*📤 Uploaded* : ${i.ago}\n🔗 Url : ${i.url}\n\n─────────────────\n\n`;
    }

    // Take the first result for thumbnail & buttons
    let video = search.all[0];

    let buttons = [
        { buttonId: `${prefix}yta ${video.url}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
        { buttonId: `${prefix}ytv ${video.url}`, buttonText: { displayText: '📹 Video' }, type: 1 }
    ];

    let buttonMessage = {
        image: { url: video.thumbnail },
        caption: teks,
        footer: 'Select to download as Audio or Video',
        buttons: buttons,
        headerType: 4
    };

    await King.sendMessage(m.chat, buttonMessage, { quoted: m });
}
break;
  
case 'animewlp':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://nekos.life/api/v2/img/wallpaper`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;


case 'resetlink': {
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
if (!m.isGroup) return reply(mess.only.group)
if (!otAdmins) return reply('Bots Must Be Admins First')
if (!isAdmins) return reply('Admin only!')
King.groupRevokeInvite(m.chat)
}
break;
case 'animedl': {
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
    if (!q.includes("|")) {
        return reply("📌 *Please provide a valid anime name and episode number!*\n\nExample: `.animedl Solo Leveling | 1`");
    }

    try {
        const [animeName, episode] = q.split("|").map(x => x.trim()); 

        const apiUrl = `https://draculazxy-xyzdrac.hf.space/api/Animedl?q=${encodeURIComponent(animeName)}&ep=${encodeURIComponent(episode)}`;

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 

        const { data } = await axios.get(apiUrl, {
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });

        if (data.STATUS !== 200 || !data.download_link) {
            return reply("⚠️ *Failed to retrieve the anime episode!*\n\nPlease check the anime name and episode number.");
        }

        const { anime, episode: epNumber, download_link } = data;

        let message = `
🎥 *Anime Found!*

📺 *Name:* ${anime}
📌 *Episode:* ${epNumber}

📥 *Downloading... Please wait!*
ADEVOS MIN-BOT DOWNLOADER ✅
        `.trim();

        await reply(message);

    
        await King.sendMessage(m.chat, {
            document: { url: download_link },
            mimetype: "video/mp4",
            fileName: `${anime} - Episode ${epNumber}.mp4`
        }, { quoted: m });

    } catch (error) {
        console.error("❌ Anime Downloader Error:", error.message);
        reply("⚠️ *Server Error!*\n\nPlease try again later.");
    }
}
break;
case 'animesearch': {
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
if (!text) return reply(`Which anime are you lookin for?`)
const malScraper = require('mal-scraper')
        const anime = await malScraper.getInfoFromName(text).catch(() => null)
        if (!anime) return reply(`Could not find`)
let animetxt = `
🎀 *Title: ${anime.title}*
🎋 *Type: ${anime.type}*
🎐 *Premiered on: ${anime.premiered}*
💠 *Total Episodes: ${anime.episodes}*
📈 *Status: ${anime.status}*
💮 *Genres: ${anime.genres}
📍 *Studio: ${anime.studios}*
🌟 *Score: ${anime.score}*
💎 *Rating: ${anime.rating}*
🏅 *Rank: ${anime.ranked}*
💫 *Popularity: ${anime.popularity}*
♦️ *Trailer: ${anime.trailer}*
🌐 *URL: ${anime.url}*
❄ *Description:* ${anime.synopsis}*`
                await King.sendMessage(m.chat,{image:{url:anime.picture}, caption:animetxt},{quoted:m})
                }
                break;
                
            case 'animehighfive':{
                if (!usedWithPrefix(m, command, prefix)) return;
            if (isban) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/highfive`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animecringe':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/cringe`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animedance':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
reply(mess.wait)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/dance`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animehappy':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/happy`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animeglomp':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/glomp`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animesmug':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
reply(mess.wait)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/smug`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animeblush':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
reply(mess.wait)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/blush`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;

case 'animewave':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/wave`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animesmile':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/smile`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animepoke':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/poke`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'codeai': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return reply(`❗Usage: ${command} [ your coding question] \n\n*Example: ${command} write a calculator with javascript*`)

    try {
        async function openaiCode(prompt) {
            let response = await axios.post("https://chateverywhere.app/api/chat/", {
                "model": {
                    "id": "gpt-4",
                    "name": "GPT-4",
                    "maxLength": 32000,
                    "tokenLimit": 8000,
                    "completionTokenLimit": 5000,
                    "deploymentName": "gpt-4"
                },
                "messages": [
                    {
                        "pluginId": null,
                        "content": `You are a coding assistant. Answer only with clean, working code (with explanation if needed).\n\n${prompt}`,
                        "role": "user"
                    }
                ],
                "prompt": "",
                "temperature": 0.4
            }, {
                headers: {
                    "Accept": "/*/",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                }
            })
            return response.data
        }

        let result = await openaiCode(text)
        m.reply(`👨‍💻 *CodeAI Response*\n\n${result}`)
    } catch (e) {
        console.error(e)
        m.reply("⚠️ Failed to fetch AI code response. Try again later.")
    }
}
break;
case 'animewink':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/wink`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animebonk':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator)  return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/bonk`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animebully':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/bully`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animeyeet':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/yeet`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'createlogo': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) {
    return m.reply(" Enter the logo title, idea and slogan. Format: .createlogo Title|Idea|Slogan");
  }

  const [title, idea, slogan] = text.split("|");

  if (!title || !idea || !slogan) {
    return m.reply("❗Incorrect format.Use : .createlogo Title|Idea|Slogan\n\n*Example :* .createlogo King|thegoat| always");
  }

  try {
    const payload = {
      ai_icon: [333276, 333279],
      height: 300,
      idea: idea,
      industry_index: "N",
      industry_index_id: "",
      pagesize: 4,
      session_id: "",
      slogan: slogan,
      title: title,
      whiteEdge: 80,
      width: 400
    };

    const { data } = await axios.post("https://www.sologo.ai/v1/api/logo/logo_generate", payload);
    
    if (!data.data.logoList || data.data.logoList.length === 0) {
      return m.reply("Failed to Create Logo");
    }

    const logoUrls = data.data.logoList.map(logo => logo.logo_thumb);
    
    for (const url of logoUrls) {
      await King.sendMessage(m.chat, { image: { url: url } });
    }
  } catch (error) {
    console.error("Error generating logo:", error);
    await m.reply("Failed to Create Logo");
  }
};
break;        
case 'animebite':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/bite`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animelick':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/lick`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;
case 'animekill':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply(`This command is restricted to owner only`)
 waifudd = await axios.get(`https://waifu.pics/api/sfw/kill`)       
            await King.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: m.success}, { quoted:m }).catch(err => {
return('Error!')
})
}
break;


           case 'cry': case 'kill': case 'hug': case 'pat': case 'lick': 
case 'kiss': case 'bite': case 'yeet': case 'bully': case 'bonk':
case 'wink': case 'poke': case 'nom': case 'slap': case 'smile': 
case 'wave': case 'awoo': case 'blush': case 'smug': case 'glomp': 
case 'happy': case 'dance': case 'cringe': case 'cuddle': case 'highfive': 
case 'shinobu': case 'handhold': {
    if (!usedWithPrefix(m, command, prefix)) return;
 if (!isCreator) return reply("Sorry only the owner can use this command")
axios.get(`https://api.waifu.pics/sfw/${command}`)
.then(({data}) => {
King.sendImageAsSticker(from, data.url, m, { packname: global.packname, author: global.author })
})
}
break;
case 'metaai': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return reply(`❗Usage: ${command} <your question>\n\n*Example: ${command} what is a noun*`)

    async function metaai(text, logic) {
        let response = await axios.post("https://chateverywhere.app/api/chat/", {
            "model": {
                "id": "gpt-4",
                "name": "Meta AI",
                "maxLength": 32000,
                "tokenLimit": 8000,
                "completionTokenLimit": 5000,
                "deploymentName": "gpt-4"
            },
            "messages": [
                {
                    "pluginId": null,
                    "content": text,
                    "role": "user"
                }
            ],
            "prompt": logic,
            "temperature": 0.5
        }, {
            headers: {
                "Accept": "/*/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            }
        });

        return response.data;
    }

    try {
        let result = await metaai(text, "")

        // handle both string and object responses safely
        let answer = (typeof result === 'string') ? result 
                     : (result?.content || result?.message || JSON.stringify(result, null, 2))

        reply(`🤖 *MetaAI*\n\n${answer}`)
    } catch (e) {
        console.error(e)
        reply("⚠️ Sorry, MetaAI could not respond. Please try again later.")
    }
}
break
case 'gpt4': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return reply(`❗Ask me anything\n*Example ${command} who is Elon Musk*`)
async function openai(text, logic) { // Membuat fungsi openai untuk dipanggil
    let response = await axios.post("https://chateverywhere.app/api/chat/", {
        "model": {
            "id": "gpt-4",
            "name": "GPT-4",
            "maxLength": 32000,  // Sesuaikan token limit jika diperlukan
            "tokenLimit": 8000,  // Sesuaikan token limit untuk model GPT-4
            "completionTokenLimit": 5000,  // Sesuaikan jika diperlukan
            "deploymentName": "gpt-4"
        },
        "messages": [
            {
                "pluginId": null,
                "content": text, 
                "role": "user"
            }
        ],
        "prompt": logic, 
        "temperature": 0.5
    }, { 
        headers: {
            "Accept": "/*/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        }
    });
    
    let result = response.data;
    return result;
}

let pei = await openai(text, "")
reply(pei)
}
break
case 'gpt': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return reply(`❗Ask me anything\n*Example ${command} what is python?*`)
async function openai(text, logic) { // Membuat fungsi openai untuk dipanggil
    let response = await axios.post("https://chateverywhere.app/api/chat/", {
        "model": {
            "id": "gpt-4",
            "name": "GPT-4",
            "maxLength": 32000,  // Sesuaikan token limit jika diperlukan
            "tokenLimit": 8000,  // Sesuaikan token limit untuk model GPT-4
            "completionTokenLimit": 5000,  // Sesuaikan jika diperlukan
            "deploymentName": "gpt-4"
        },
        "messages": [
            {
                "pluginId": null,
                "content": text, 
                "role": "user"
            }
        ],
        "prompt": logic, 
        "temperature": 0.5
    }, { 
        headers: {
            "Accept": "/*/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        }
    });
    
    let result = response.data;
    return result;
}

let pei = await openai(text, "")
reply(pei)
}
break
// LAUGH
case 'laugh': {
    if (!usedWithPrefix(m, command, prefix)) return;
    await editEmoji(King, m, [
        "😀","😃","😄","😁","😆","😂","🤣","🤣🤣"
    ]);
}
break;

// SHY
case 'shy': {
    if (!usedWithPrefix(m, command, prefix)) return;
    await editEmoji(King, m, [
        "😐","🙂","😳","😳😳","🥺","🥺🥺"
    ]);
}
break;

// SAD
case 'sad': {
    if (!usedWithPrefix(m, command, prefix)) return;
    await editEmoji(King, m, [
        "🙂","😕","😟","😢","😢😢","😭","😭😭"
    ]);
}
break;

// KISS
case 'kiss': {
    if (!usedWithPrefix(m, command, prefix)) return;
    await editEmoji(King, m, [
        "🙂","😊","😉","😘","😘😘","💋"
    ]);
}
break;

// MOON
case 'moon': {
    if (!usedWithPrefix(m, command, prefix)) return;
    await editEmoji(King, m, [
        "🌑","🌒","🌓","🌔","🌕","🌕✨"
    ]);
}
break;

// ANGER
case 'anger': {
    if (!usedWithPrefix(m, command, prefix)) return;
    await editEmoji(King, m, [
        "😐","😑","😠","😡","🤬","🤬🔥"
    ]);
}
break;

// HAPPY
case 'happy': {
    if (!usedWithPrefix(m, command, prefix)) return;
    await editEmoji(King, m, [
        "🙂","😊","😁","😄","😆","🤗","🤗✨"
    ]);
}
break;

// CONFUSED
case 'confused': {
    if (!usedWithPrefix(m, command, prefix)) return;
    await editEmoji(King, m, [
        "😐","😕","😖","😵","😵‍💫","😵‍💫❓"
    ]);
}
break;

// HEART
case 'heart': {
    if (!usedWithPrefix(m, command, prefix)) return;
    await editEmoji(King, m, [
        "💛","💚","💙","💜","🧡","❤️","❤️❤️"
    ]);
}
break;
 case 'ai': {
     if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return reply('Example: .ai ᴡʜᴏ ɪs ᴍᴀʀᴋ ᴢᴜɢᴇʀʙᴇʀᴋ?');

  await King.sendPresenceUpdate('composing', m.chat);

  try {
    const { data } = await axios.post("https://chateverywhere.app/api/chat/", {
      model: {
        id: "gpt-4",
        name: "GPT-4",
        maxLength: 32000,
        tokenLimit: 8000,
        completionTokenLimit: 5000,
        deploymentName: "gpt-4"
      },
      messages: [{ pluginId: null, content: text, role: "user" }],
      prompt: text,
      temperature: 0.5
    }, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "WhatsApp Bot"
      }
    });

    await King.sendMessage(m.chat, {
      text: `📦 ᴀɪ ʀᴇsᴘᴏɴsᴇ ᴍᴇssᴀɢᴇ \n\n ǫᴜᴇsᴛɪᴏɴ: ${text}\n\n${data}\n│\nɴᴇᴇᴅ ᴀɴʏᴛʜɪɴɢ ᴇʟsᴇ?`
    }, { quoted: m });

  } catch (e) {
    await reply(`AI encountered a problem: ${e.message}`);
  }
}
break
case 'idch': {
    if (!usedWithPrefix(m, command, prefix)) return;
if (!text) return reply("`❗ Please provide channel link`\n*Example: .idch https://whatsapp.com/channel/*")
if (!text.includes("https://whatsapp.com/channel/")) return reply("not a valid Link ")
let result = text.split('https://whatsapp.com/channel/')[1]
let res = await King.newsletterMetadata("invite", result)
let teks = `📦 ғᴜʟʟ ᴄʜᴀɴɴᴇʟ ɪɴғᴏ 
* *🆔 ID :* ${res.id}
* *👤 Name :* ${res.name}
* *👥 Follower:* ${res.subscribers}
* *📊 Status :* ${res.state}
* *✔️ Verified :* ${res.verification == "VERIFIED" ? "Verified" : "No"}\n${footer}`
return reply(teks)
}
    break;
 case 'closetime': {
     if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return reply("This command is restricted to owner only");
    if (!m.isGroup) {
        return King.sendMessage(m.chat, { text: "This command is for groups only." }, { quoted: m });
    }

    let unit = args[1];
    let value = Number(args[0]);
    if (!value) return reply("*ᴜsᴀɢᴇ:* .closetime <ɴᴜᴍʙᴇʀ> <sᴇᴄᴏɴᴅ/ᴍɪɴᴜᴛᴇ/ʜᴏᴜʀ/ᴅᴀʏ>\n*Example:* .ᴄʟᴏsᴇᴛɪᴍᴇ 5 second");

    let timer;
    if (unit === 'second') {
        timer = value * 1000;
    } else if (unit === 'minute') {
        timer = value * 60000;
    } else if (unit === 'hour') {
        timer = value * 3600000;
    } else if (unit === 'day') {
        timer = value * 86400000;
    } else {
        return reply('ᴄʜᴏᴏsᴇ:*\nsᴇᴄᴏɴᴅ\nᴍɪɴᴜᴛᴇ\nʜᴏᴜʀ\nᴅᴀʏ\n\n*ᴇxᴀᴍᴘʟᴇ:*\n5 sᴇᴄᴏɴᴅ');
    }

    reply(`⏳ ᴏᴘᴇɴ ᴛɪᴍᴇ ${value} ${unit}\nsᴛᴀʀᴛɪɴɢ ɴᴏᴡ....`);

    setTimeout(async () => {
        try {
            await King.groupSettingUpdate(m.chat, 'announcement');
            reply(`✅ *ᴛɪᴍᴇ ᴇʟᴀᴘsᴇᴅ *\nɢʀᴏᴜᴘ ᴄʟᴏsᴇᴅ\n👑 ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs`);
        } catch (e) {
            reply('❌ Failed: ' + e.message);
        }
    }, timer);
}
break;
case 'opentime': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return reply("This command is restricted to owner only");
    if (!m.isGroup) {
        return King.sendMessage(m.chat, { text: "This command is for groups only." }, { quoted: m });
    }

    let unit = args[1];
    let value = Number(args[0]);
    if (!value) return reply('*ᴜsᴀɢᴇ:* .opentime <ɴᴜᴍʙᴇʀ> <sᴇᴄᴏɴᴅ/ᴍɪɴᴜᴛᴇ/ʜᴏᴜʀ/ᴅᴀʏ>\n*Example:* .ᴏᴘᴇɴᴛɪᴍᴇ 5 second');

    let timer;
    if (unit === 'second') {
        timer = value * 1000;
    } else if (unit === 'minute') {
        timer = value * 60000;
    } else if (unit === 'hour') {
        timer = value * 3600000;
    } else if (unit === 'day') {
        timer = value * 86400000;
    } else {
        return reply('*ᴄʜᴏᴏsᴇ:*\nsᴇᴄᴏɴᴅ\nᴍɪɴᴜᴛᴇ\nʜᴏᴜʀ\nᴅᴀʏ\n\n*ᴇxᴀᴍᴘʟᴇ:*\n5 sᴇᴄᴏɴᴅ');
    }

    reply(`⏳ ᴏᴘᴇɴ ᴛɪᴍᴇ ${value} ${unit}\nsᴛᴀʀᴛɪɴɢ ɴᴏᴡ...`);

    setTimeout(async () => {
        try {
            await King.groupSettingUpdate(m.chat, 'not_announcement');
            reply(`✅ *ᴛɪᴍᴇ ᴇʟᴀᴘsᴇᴅ *\nɢʀᴏᴜᴘ ᴏᴘᴇɴᴇᴅ\n👥 ᴍᴇᴍʙᴇʀs ᴄᴀɴ ɴᴏᴡ sᴇɴᴅ ᴍᴇssᴀɢᴇs`);
        } catch (e) {
            reply('❌ Failed: ' + e.message);
        }
    }, timer);
}
break;
case 'fact':
    if (!usedWithPrefix(m, command, prefix)) return;
 if (!isCreator) return reply("This command is restricted to owner only");
    const bby = "https://apis.davidcyril.name.ng/fact";

    try {
        const nyash = await axios.get(bby);
        const bwess = 'https://files.catbox.moe/ba5km9.jpg';
        const ilovedavid = nyash.data.fact;
        await King.sendMessage(m.chat, { image: { url: bwess }, caption: ilovedavid });
    } catch (error) {
        reply("An Error Occured.");
    }
    break;
case 'listonline': {
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return m.reply("This command is restricted to owner only");
        if (!m.isGroup) return reply(m.grouponly);
        King.sendMessage(from, { react: { text: "📷", key: m.key } })
        let id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : m.chat
        let online = [...Object.keys(store.presences[id]), botNumber]
        let liston = 1
        King.sendText(m.chat, ' 「 👥 Members Online」\n\n' + online.map(v => `${liston++} . @` + v.replace(/@.+/, '')).join`\n`, m, { mentions: online })
      }
      break;
case 'gpt3': case 'open-%+%ai': case 'vxnxji': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return reply(`Ask me anything example ${command} how are you?`)
async function openai(text, logic) { // Membuat fungsi openai untuk dipanggil
    let response = await axios.post("https://chateverywhere.app/api/chat/", {
        "model": {
            "id": "gpt-3",
            "name": "GPT-3",
            "maxLength": 32000,  // Sesuaikan token limit jika diperlukan
            "tokenLimit": 8000,  // Sesuaikan token limit untuk model GPT-4
            "completionTokenLimit": 5000,  // Sesuaikan jika diperlukan
            "deploymentName": "gpt-3"
        },
        "messages": [
            {
                "pluginId": null,
                "content": text, 
                "role": "user"
            }
        ],
        "prompt": logic, 
        "temperature": 0.5
    }, { 
        headers: {
            "Accept": "/*/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        }
    });
    
    let result = response.data;
    return result;
}

let pei = await openai(text, "")
m.reply(pei)
}
break;

case 'quote': {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await fetch('https://zenquotes.io/api/random');
        const json = await res.json();
        const quote = json[0].q;
        const author = json[0].a;

        // Optional: Generate image using API
        const quoteImg = `https://dummyimage.com/600x400/000/fff.png&text=${encodeURIComponent(`"${quote}"\n\n- ${author}`)}`;

        King.sendMessage(m.chat, {
            image: { url: quoteImg },
            caption: `_"${quote}"_\n\n— *${author}*`
        }, { quoted: m });

    } catch (err) {
        m.reply('Failed to fetch quote.');
    }
}
break;

case 'joke': {
    if (!usedWithPrefix(m, command, prefix)) return;
  let res = await fetch('https://v2.jokeapi.dev/joke/Any?type=single'); 
  let data = await res.json();

  await King.sendMessage(m.chat, {
    image: { url: 'https://files.catbox.moe/gr1jfa.jpg' },
    caption: `*😂 Here's a joke for you:*\n\n${data.joke}`
  }, { quoted: m });
}
break;
case 'truth': {
    if (!usedWithPrefix(m, command, prefix)) return;
  let res = await fetch('https://api.truthordarebot.xyz/v1/truth');
  let data = await res.json();

  await King.sendMessage(m.chat, {
    image: { url: 'https://files.catbox.moe/lhviht.jpg' },
    caption: `*😳 Truth Time!*\n\n❖ ${data.question}`
  }, { quoted: m });
}
break;
case 'dare': {
    if (!usedWithPrefix(m, command, prefix)) return;
  let res = await fetch('https://api.truthordarebot.xyz/v1/dare');
  let data = await res.json();

  await King.sendMessage(m.chat, {
    image: { url: 'https://files.catbox.moe/t01fmm.jpg' },
    caption: `*😈 Dare Challenge!*\n\n❖ ${data.question}`
  }, { quoted: m });
}
break;
case 'jid':{
    if (!usedWithPrefix(m, command, prefix)) return;
            reply(from)
           }
          break;
case 'bass': case 'blown': case 'deep': case 'earrape': case 'fast': case 'fat': case 'nightcore': case 'reverse': case 'robot': case 'slow': case 'smooth': case 'squirrel':
    try {
        if (!usedWithPrefix(m, command, prefix)) return;
        let set;
        if (/bass/.test(command)) set = '-af equalizer=f=54:width_type=o:width=2:g=20';
        else if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log';
        else if (/deep/.test(command)) set = '-af atempo=4/4,asetrate=44500*2/3';
        else if (/earrape/.test(command)) set = '-af volume=12';
        else if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"';
        else if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"';
        else if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25';
        else if (/reverse/.test(command)) set = '-filter_complex "areverse"';
        else if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
        else if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"';
        else if (/smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
        else if (/squirrel/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"';
        if (set) {
            if (/audio/.test(mime)) {
                let media = await King.downloadAndSaveMediaMessage(quoted);
                let ran = getRandom('.mp3');
                console.log(`Running ffmpeg command: ffmpeg -i ${media} ${set} ${ran}`);
                exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
                    fs.unlinkSync(media);
                    if (err) {
                        console.error(`ffmpeg error: ${err}`);
                        return reply(err);
                    }
                    
                    let buff = fs.readFileSync(ran);
                    King.sendMessage(m.chat, { audio: buff, mimetype: 'audio/mpeg' }, { quoted: m });
                    fs.unlinkSync(ran);
                });
            } else {
                reply(`Reply to the audio you want to change with a caption *${prefix + command}*`);
            }
        } else {
            reply('Invalid command');
        }
    } catch (e) {
        reply(e);
    }
    break;

case 'say':
case 'tts':
case 'gtts': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return reply("Where is the text?");

  let texttts = text;
  const ttsUrl = googleTTS.getAudioUrl(texttts, {
    lang: "en",
    slow: false,
    host: "https://translate.google.com",
  });

  // SHADOW XD style caption
  const caption = `
  Text : ${texttts}
  Speed: 1x
  Language: En
`;

  // Send audio with caption
  return King.sendMessage(m.chat, {
    audio: { url: ttsUrl },
    mimetype: "audio/mp4",
    ptt: true,
    fileName: `${texttts}.mp3`,
    caption,
  }, { quoted: m });
}
break;
// waifu cases

    case "rwaifu": {
        if (!usedWithPrefix(m, command, prefix)) return;
    
    const imageUrl = `https://apis.davidcyril.name.ng/random/waifu`;
    await King.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: "Your rwaifu by Adevos X ✅"
      }, { quoted: m }); // Add quoted  for context
      }
      break;
      case 'waifu' :
          if (!usedWithPrefix(m, command, prefix)) return;

waifudd = await axios.get(`https://waifu.pics/api/nsfw/waifu`) 
King.sendMessage(from, {image: {url:waifudd.data.url},caption:`Your waifu by Adevos X 🤤`}, { quoted:m }).catch(err => {
 return('Error!')
})
break;  
// ======= KELVIN COMMANDS 
case 'reversed': {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        if (!text) return m.reply('❌ Send text to reverse.');

        const reversed = text.split('').reverse().join('');

        King.sendMessage(m.chat, {
            text: `🔁 *Reversed Text:*
${reversed}

> [ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴀs ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀᴅᴇᴠᴏꜱ-x ᴛᴇᴄʜ] `
        }, { quoted: m });

    } catch (err) {
        m.reply('Failed to reverse text.');
    }
}
break;
case 'judge': {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        if (!text) return m.reply('❌ Tell me something to judge 😭');

        const responses = [
            "🧑‍⚖️ Verdict: CAP DETECTED 😂",
            "🧑‍⚖️ Verdict: Approved ✅",
            "🧑‍⚖️ Verdict: Suspicious behaviour 🤨",
            "🧑‍⚖️ Verdict: Bro who allowed this 😭",
            "🧑‍⚖️ Verdict: 100% nonsense 💀"
        ];

        const result = responses[Math.floor(Math.random() * responses.length)];

        King.sendMessage(m.chat, {
            text: `${result}

📌 "${text}"

> [ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴀs ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀᴅᴇᴠᴏꜱ-x ᴛᴇᴄʜ] `
        }, { quoted: m });

    } catch (err) {
        m.reply('Judging failed.');
    }
}
break;
case 'future': {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {

        const futures = [
            "🔮 Tomorrow you will find unexpected money 💰",
            "🔮 Someone is thinking about you right now 😏",
            "🔮 You will sleep late again 😂",
            "🔮 Lucky day incoming 🍀",
            "🔮 Avoid drama today 😭"
        ];

        const result = futures[Math.floor(Math.random() * futures.length)];

        King.sendMessage(m.chat, {
            text: `${result}

> [ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴀs ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀᴅᴇᴠᴏꜱ-x ᴛᴇᴄʜ] `
        }, { quoted: m });

    } catch (err) {
        m.reply('Future prediction failed.');
    }
}
break;
case 'relationship': {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        if (!text.includes(',')) {
            return m.reply('❌ Example:\n.relationship Kelvin,Miku');
        }

        let [name1, name2] = text.split(',');

        const percent = Math.floor(Math.random() * 101);

        let resultText = percent > 70
            ? "🔥 Perfect match!"
            : percent > 40
            ? "🙂 Not bad..."
            : "💀 Wahala relationship";

        King.sendMessage(m.chat, {
            text: `❤️ *Relationship Check*

${name1.trim()} 💕 ${name2.trim()}

Compatibility: *${percent}%*

${resultText}

> [ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴀs ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀᴅᴇᴠᴏꜱ-x ᴛᴇᴄʜ] `
        }, { quoted: m });

    } catch (err) {
        m.reply('Relationship check failed.');
    }
}
break;
case 'brainlevel': {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {

        const iq = Math.floor(Math.random() * 200);

        let status =
            iq > 150 ? "🤯 Genius detected!" :
            iq > 100 ? "😎 Smart person" :
            iq > 50 ? "🙂 Average brain" :
            "😭 Needs charging...";

        King.sendMessage(m.chat, {
            text: `🧠 *Brain Scan Complete...*

IQ Level: *${iq}*

${status}

> [ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴀs ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀᴅᴇᴠᴏꜱ-x ᴛᴇᴄʜ] `
        }, { quoted: m });

    } catch (err) {
        m.reply('Brain scan failed.');
    }
}
break;
 
// =======END OF KELVIN COMMANDS   
case 'vv': {
    if (!usedWithPrefix(m, command, prefix)) return;
if (!isCreator) return reply("Command restricted to owner only");
    if (!m.quoted) return reply('`❗ Reply to a ViewOnce Video, Image, or Audio.`');

    try {
        const mediaBuffer = await King.downloadMediaMessage(m.quoted);

        if (!mediaBuffer) {  
            return reply('Eep~ I couldn’t grab the media. Can you try again, please?\n~ Yours truly, Adevos');  
        }  

        const mediaType = m.quoted.mtype;  

        if (mediaType === 'imageMessage') {  
            await King.sendMessage(m.chat, {   
                image: mediaBuffer,   
                caption: "ɪᴍᴀɢᴇ ᴅɪsᴄʟᴏsᴇᴅ sᴜᴄᴇssғᴜʟʟʏ" + footer
            }, { quoted: m });
        } else if (mediaType === 'videoMessage') {  
            await King.sendMessage(m.chat, {   
                video: mediaBuffer,   
                caption: "ᴠɪᴅᴇᴏ ᴅɪsᴄʟᴏsᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ" + footer  
            }, { quoted: m });
        } else if (mediaType === 'audioMessage') {  
            await King.sendMessage(m.chat, {   
                audio: mediaBuffer,   
                mimetype: 'audio/ogg',  
                ptt: true,  
                caption: "ᴀᴜᴅɪᴏ ᴅɪsᴄʟᴏsᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ" + footer
            }, { quoted: m });
        } else {  
            return reply('Command restricted to owner only');  
        }
    } catch (error) {
        console.error('Error:', error);
        await reply('sᴏᴍᴇᴛʜɪɴɢ ᴡᴇɴᴛ ᴡʀᴏɴɢ\n`❗ᴛʀʏ. ᴀɢᴀɪɴ ʟᴀᴛᴇʀ`');
    }
}
break;
case 'readviewonce2': case 'vv2': {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        if (!m.quoted) return reply('`❗ Reply to a ViewOnce Video, Image, or Audio.`');

        const quotedMessage = m.msg.contextInfo.quotedMessage;
        if (!quotedMessage) return reply('❌ No media found in the quoted message.');

        if (quotedMessage.imageMessage) {
            let imageCaption = quotedMessage.imageMessage.caption || '';
            let imageUrl = await King.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
            await King.sendMessage(King.user.id, { image: { url: imageUrl }, caption: imageCaption });
        }

        if (quotedMessage.videoMessage) {
            let videoCaption = quotedMessage.videoMessage.caption || '';
            let videoUrl = await King.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
            await King.sendMessage(King.user.id, { video: { url: videoUrl }, caption: videoCaption });
        }

        if (quotedMessage.audioMessage) {
            let audioUrl = await King.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
            await King.sendMessage(King.user.id, { audio: { url: audioUrl }, mimetype: 'audio/mp4' });
        }

    } catch (error) {
        console.error('Error processing vv2 command:', error);
    }
    break;
}

case 'qc': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return reply('*Example: .qc your quote*');

  const name = m.pushName || 'User';
  const quote = text.trim();

  let profilePic;
  try {
    profilePic = await King.profilePictureUrl(m.sender, 'image');
  } catch {
    profilePic = 'https://telegra.ph/file/6880771c1f1b5954d7203.jpg'; // fallback
  }

  const url = `https://www.laurine.site/api/generator/qc?text=${encodeURIComponent(quote)}&name=${encodeURIComponent(name)}&photo=${encodeURIComponent(profilePic)}`;

  try {
    await King.sendImageAsSticker(m.chat, url, m, {
      packname: global.packname,
      author: global.author
    });
  } catch (err) {
    console.error('Quote card sticker generation error:', err);
    reply('Oops! Failed to create your quote sticker.');
  }
}
break;

case 'shorturl':{
    if (!usedWithPrefix(m, command, prefix)) return;
if (!text) return reply('*Example: .shorturl google.com*')
let shortUrl1 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
if (!shortUrl1) return reply(`*Error: Could not generate a short URL.*`);
let done = `
✅ *ᴜʀʟ sʜᴏʀᴛᴇɴᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ*

📦 *Shorturl:* ${shorturl1}
🌍 *Original URL:* ${text}

${footer}`.trim();
 reply(done)
}
break;

case 'unblock': case 'unblocked': {
    if (!usedWithPrefix(m, command, prefix)) return;

	 if (!isCreator) return reply("Owner only.");
		let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
		await King.updateBlockStatus(users, 'unblock')
		await reply(`Done ✅`)
	}
	break;
	case 'block': case 'blocked': {
	    if (!usedWithPrefix(m, command, prefix)) return;
	
	 if (!isCreator) return reply("This command is restricted for owner only");
		let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
		await King.updateBlockStatus(users, 'block')
		await reply(`Sucessfully \`blocked\` user ✅`)
			}
	break;

case 'creategc':
case 'creategroup': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("This command is restricted for owner only");

  const groupName = args.join(" ");
  if (!groupName) return reply(`Use *${prefix + command} groupname*`);

  try {
    const cret = await King.groupCreate(groupName, []);
    const code = await King.groupInviteCode(cret.id);
    const link = `https://chat.whatsapp.com/${code}`;

    const teks = `「 📦 Group Created 」
▸ *💳 Name:* ${cret.subject}
▸ *🆔 Group ID:* ${cret.id}
▸ *👤 Owner:* @${cret.owner.split("@")[0]}
▸ *📆 Created:* ${moment(cret.creation * 1000).tz("Africa/Lagos").format("DD/MM/YYYY HH:mm:ss")}
▸ *🔗 Invite Link:* ${link}\n${footer}`;

    King.sendMessage(m.chat, {
      text: teks,
      mentions: [cret.owner]
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    reply("Failed to create group. Please check and try again.");
  }
}
break;
case 'tgstickers': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return reply(`*Example: .tgstickers https://t.me/addstickers/AnimePack*`);

    try {
        await King.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        let packUrl = text.trim();
        if (!packUrl.includes("t.me/addstickers/")) return reply("❌ Invalid Telegram sticker pack link.");

        // extract pack name
        let packName = packUrl.split("/addstickers/")[1];

        // fetch pack info
        let api = `https://api.telegram.org/bot8041800861:AAEpSfx3seoEgnjA66jYPTuqZ9sB0eBPnbQ/getStickerSet?name=${packName}`;
        let { data } = await axios.get(api);

        if (!data.ok) return reply("❌ Failed to fetch Telegram sticker pack.");

        let stickers = data.result.stickers;
        if (!stickers || stickers.length === 0) return reply("❌ No stickers found in this pack.");

        reply(`✅ Found ${stickers.length} stickers. Sending now...`);

        for (let i = 0; i < stickers.length; i++) {
            try {
                // get file path from Telegram
                let filePathRes = await axios.get(
                    `https://api.telegram.org/bot8041800861:AAEpSfx3seoEgnjA66jYPTuqZ9sB0eBPnbQ/getFile?file_id=${stickers[i].file_id}`
                );
                let fileUrl = `https://api.telegram.org/file/bot8041800861:AAEpSfx3seoEgnjA66jYPTuqZ9sB0eBPnbQ/${filePathRes.data.result.file_path}`;

                // check extension
                if (fileUrl.endsWith(".tgs")) {
                    // animated sticker (.tgs → animated webp)
                    const tgsBuffer = await getBuffer(fileUrl);

                    // save temporarily
                    let tgsPath = `./tmp/${Date.now()}.tgs`;
                    fs.writeFileSync(tgsPath, tgsBuffer);

                    // convert TGS to animated WEBP (needs lottie + sharp)
                    const { exec } = require("child_process");
                    let webpPath = `./tmp/${Date.now()}.webp`;

                    await new Promise((resolve, reject) => {
                        exec(
                            `lottie-web-to-webp ${tgsPath} ${webpPath}`,
                            (error) => {
                                if (error) reject(error);
                                else resolve();
                            }
                        );
                    });

                    // send as sticker
                    let buffer = fs.readFileSync(webpPath);
                    await King.sendImageAsSticker(m.chat, buffer, m, {
                        packname: "ᴀᴅᴇᴠᴏꜱ-x ᴛᴇᴄʜ",
                        author: "༆ᶜᵃˡˡ ᵐᵉ᭄𝐀𝐃𝐄𝐕𝐎𝐒"
                    });

                    fs.unlinkSync(tgsPath);
                    fs.unlinkSync(webpPath);
                } else {
                    // static sticker (webp/png)
                    let buffer = await getBuffer(fileUrl);

                    await King.sendImageAsSticker(m.chat, buffer, m, {
                        packname: "ᴀᴅᴇᴠᴏꜱ ᴍɪɴ-ʙᴏᴛ",
                        author: "༆ᶜᵃˡˡ ᵐᵉ᭄𝐀𝐃𝐄𝐕𝐎𝐒"
                    });
                }

                await sleep(1500);
            } catch (err) {
                console.log("Sticker error:", err.message);
            }
        }

        await King.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        reply("❌ Error while fetching TG stickers.");
    }
    
}
break;
case 'stupidcheck': {
    if (!usedWithPrefix(m, command, prefix)) return;
    const percentage = Math.floor(Math.random() * 101);  // Generate random percentage (0-100)
    return reply(`💡 *Stupid Check*:\nYou're ${percentage}% not stupid!`);
}
break;

case 'uncleancheck': {
    if (!usedWithPrefix(m, command, prefix)) return;
    const percentage = Math.floor(Math.random() * 101);  // Generate random percentage (0-100)
    return reply(`🧹 *Unclean Check*:\nYour cleanliness is ${percentage}% questionable.`);
}
break;

case 'hotcheck': {
    if (!usedWithPrefix(m, command, prefix)) return;
    const percentage = Math.floor(Math.random() * 101);  // Generate random percentage (0-100)
    return reply(`🔥 *Hot Check*:\nYou're ${percentage}% hot!`);
}
break;

case 'smartcheck': {
if (!usedWithPrefix(m, command, prefix)) return;
    const percentage = Math.floor(Math.random() * 101);  // Generate random percentage (0-100)
    return reply(`🧠 *Smart Check*:\nYou're ${percentage}% smart!`);
}
break;

case 'greatcheck': {
if (!usedWithPrefix(m, command, prefix)) return;
    const percentage = Math.floor(Math.random() * 101);  // Generate random percentage (0-100)
    return reply(`🌟 *Great Check*:\nYou're ${percentage}% great!`);
}
break;

case 'evilcheck': {
if (!usedWithPrefix(m, command, prefix)) return;
    const percentage = Math.floor(Math.random() * 101);  // Generate random percentage (0-100)
    return reply(`😈 *Evil Check*:\nYou're ${percentage}% evil!`);
}
break;

case 'dogcheck': {
if (!usedWithPrefix(m, command, prefix)) return;
    const percentage = Math.floor(Math.random() * 101);  // Generate random percentage (0-100)
    return reply(`🐶 *Dog Check*:\nYou're ${percentage}% a good dog! Woof!`);
}
break;

case 'coolcheck': {
if (!usedWithPrefix(m, command, prefix)) return;
    const percentage = Math.floor(Math.random() * 101);  // Generate random percentage (0-100)
    return reply(`😎 *Cool Check*:\nYou're ${percentage}% cool!`);
}
break;

case 'gaycheck': {
if (!usedWithPrefix(m, command, prefix)) return;
    const percentage = Math.floor(Math.random() * 101);  // Generate random percentage (0-100)
    return reply(`🌈 *Gay Check*:\nYou're ${percentage}% fabulous! 💅`);
}
break;

case 'waifucheck': {
if (!usedWithPrefix(m, command, prefix)) return;
    const percentage = Math.floor(Math.random() * 101);  // Generate random percentage (0-100)
    return reply(`❤️ *Waifu Check*:\nYou're ${percentage}% waifu material!`);
}
break;

case "savecontact":
case "vcf":
case "scontact":
case "savecontacts": {
if (!usedWithPrefix(m, command, prefix)) return;
    if (!m.isGroup) {
        return King.sendMessage(
            m.chat,
            { text: "This command is for groups only." },
            { quoted: m }
        );
    }

    try {
        let metadata = await King.groupMetadata(m.chat);
        let participants = metadata.participants;
        let vcard = "";
        let index = 1;

        for (let p of participants) {
            let num = p.id.split("@")[0];

            vcard += 
`BEGIN:VCARD
VERSION:3.0
FN:[${index++}] +${num}
TEL;TYPE=CELL:+${num}
X-WAID:${num}
END:VCARD

`;
        }

        // File path
        let filePath = "./contacts.vcf";
        fs.writeFileSync(filePath, vcard.trim());

        // Sending saving message
        await King.sendMessage(
            m.chat,
            { text: `📂 Saving *${participants.length}* contacts as VCF...` },
            { quoted: m }
        );

        await sleep(1500);

        // Send the VCF file
        await King.sendMessage(
            m.chat,
            {
                document: fs.readFileSync(filePath),
                mimetype: "text/vcard",
                fileName: `${metadata.subject}.vcf`,
                caption: `📤 *VCF file uploaded*\n👥 Group: *${metadata.subject}*\n📦 Total contacts: *${participants.length}*\n${footer}`
            },
            { quoted: m }
        );

        fs.unlinkSync(filePath); // delete file

    } catch (err) {
        console.log(err);
        King.sendMessage(
            m.chat,
            { text: "⚠️ Error: " + err.toString() },
            { quoted: m }
        );
    }

}
break;
// take 
case 'toimg':
  {
  if (!usedWithPrefix(m, command, prefix)) return;
    const quoted = m.quoted ? m.quoted : null
    const mime = (quoted?.msg || quoted)?.mimetype || ''
    if (!quoted) return reply('Reply to a sticker/image.')
    if (!/webp/.test(mime)) return reply(`Reply to a sticker with *${prefix}toimg*`)
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
    const media = await King.downloadMediaMessage(quoted)
    const filePath = `./tmp/${Date.now()}.jpg`
    fs.writeFileSync(filePath, media)
    await King.sendMessage(m.chat, { image: fs.readFileSync(filePath) }, { quoted: m })
    fs.unlinkSync(filePath)
  }
  break;
case 'play': {
  try {
  if (!usedWithPrefix(m, command, prefix)) return;
    const axios = require('axios')

    const query = args.join(' ')
    if (!query) return reply('❌ Please provide a song name\nExample: .play faded')

    // loading react
    await King.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    })

    const { data } = await axios.get(
      `https://apis.davidcyril.name.ng/play?query=${encodeURIComponent(query)}`
    )

    if (!data.status || !data.result) {
      await King.sendMessage(from, {
        react: { text: '❌', key: m.key }
      })
      return reply('❌ Song not found')
    }

    const song = data.result

    const caption = `
    
╭─── [ AUDIO DOWNLOADER ]
│
├ *Title:* ${song.title}
├ *Duration:* ${song.duration}
├ *Views:* ${song.views.toLocaleString()}
├ *Author:* ${song.published}
│
╰──────────────────◆\n> 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐝𝐞𝐯𝐨𝐬-𝐗 𝐓𝐞𝐜𝐡
 
`.trim()

    // send thumbnail + info
    await King.sendMessage(from, {
      image: { url: song.thumbnail },
      caption
    }, { quoted: m })

    // send audio
    await King.sendMessage(from, {
      audio: { url: song.download_url },
      mimetype: 'audio/mpeg',
      fileName: `${song.title}.mp3`,
      ptt: false
    }, { quoted: m })

    // success react
    await King.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (err) {
    console.error(err)

    await King.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ Failed to fetch music. Try again later.')
  }
}
break
    
            //case 'bomb':
        case 'ytmp3': {
  if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) {
        return reply(`*Use:* ${prefix}ytmp3 <YouTube link>\n\n*Example:* ${prefix}ytmp3 https://youtu.be/abc123`);
    }

    try {
        let loadMsg = await King.sendMessage(m.chat, { 
            text: "⏳ *Checking YouTube link…*"
        }, { quoted: m });

        const editLoad = async (newText) => {
            await King.sendMessage(m.chat, {
                edit: loadMsg.key,
                text: newText
            });
        };

        if (!text.includes("youtube.com") && !text.includes("youtu.be")) {
            return editLoad("❌ *Invalid YouTube link!*");
        }

        await editLoad("🎶 *Fetching audio info…*");

        // API request
        let apiUrl = `https://apis.davidcyril.name.ng/youtube/mp3?url=${text}`;
        let response = await axios.get(apiUrl);

        if (!response.data.status) {
            return editLoad("❌ *API failed to convert this video.*");
        }

        let result = response.data.result;

        let title = result.title || "YouTube Audio";
        let downloadUrl = result.download_url;
        let thumb = result.thumbnail || "";
        let duration = result.duration || "Unknown";
        let quality = result.quality || "Unknown";

        await editLoad("📥 *Downloading audio…*");

        await editLoad("📤 *Sending audio file…*");

        await King.sendMessage(m.chat, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: `🎵 *${title}*
            
📌 *Details:*
- 🕒 **Duration:** ${duration}
- 📊 **Quality:** ${quality}
- 🔗 **Download URL:** ${downloadUrl}

🎧 Converted using *YTMP3*`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: "YTMP3 Converter",
                    thumbnailUrl: thumb,
                    sourceUrl: text,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await editLoad("✅ *Audio downloaded*");

    } catch (e) {
        console.log(e);
        return reply("❌ *Error occurred while processing YTMP3.*");
    }
}
        break;

case "nanobanana":
case "nano": {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return reply('This command is restricted to owner only');
    
    if (!text) {
        return reply(`
ᴜsᴀɢᴇ: ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴡɪᴛʜ ᴀ ᴘʀᴏᴍᴘᴛ

ᴇxᴀᴍᴘʟᴇ:
${prefix + command} add a Christmas hat`);
    }

    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';

    if (!/image/.test(mime)) {
        return reply('❌ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ!');
    }

    console.log('uploading image..');

    try {
        // Download the image
        const media = await quoted.download();
        
        // Upload using your function
        const uploadImage = require('./library/Data6');
        const imageUrl = await uploadImage(media);
        
        console.log('Uploaded Image URL:', imageUrl);
        
        await King.sendMessage(
            m.chat,
            { text: '🍌 ᴘʀᴏᴄᴇssɪɴɢ ᴡɪᴛʜ ᴀɪ ᴛʜɪs ᴍᴀʏ ᴛᴀᴋᴇ 30-60 sᴇᴄᴏɴᴅs....' },
            { quoted: m }
        );
        // FIXED: Changed "nanobana" to "nanobanana"
        const apiUrl = `https://apis.davidcyril.name.ng/nanobanana?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(text)}`;
        
        console.log('API URL:', apiUrl);

        const response = await axios.get(apiUrl, {
            timeout: 120000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('Aiedit Response:', JSON.stringify(response.data, null, 2));

        if (!response.data || !response.data.success) {
            throw new Error(response.data?.error || `API returned error (Status: ${response.status})`);
        }

        if (!response.data.result || !response.data.result.image) {
            throw new Error('No edited image in API response');
        }

        await King.sendMessage(m.chat, {
            image: { url: response.data.result.image },
            caption: `*🍌 ɴᴀɴᴏʙᴀɴᴀɴᴀ ʀᴇsᴜʟᴛ*

📝 ᴘʀᴏᴍᴘᴛ: ${text}
✅ ᴇᴅɪᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ!`
        }, { quoted: m });

    } catch (err) {
        console.error(' Full Error:', err);
        console.error('Error Response:', err.response?.data);
        console.error('Error Status:', err.response?.status);
        
        reply(`❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴘʀᴏᴄᴇss ɪᴍᴀɢᴇ

ᴇʀʀᴏʀ: ${err.message}
sᴛᴀᴛᴜs: ${err.response?.status || 'N/A'}`);
    }
}
break;
// Video Download Command
case 'video': {
    if (!usedWithPrefix(m, 'video', prefix)) return;
    if (!text) return reply(`*Example:* ${prefix + command} Faded by Alan Walker`);

    try {
        // React to command
        await King.sendMessage(m.chat, {
            react: { text: '📽️', key: m.key }
        });

        // Search YouTube
        const yts = require("yt-search");
        let search = await yts(text);
        let video = search.videos[0];
        if (!video) return reply('*No video found!*');

        // Preview message
        let caption = `
╭─── [ VIDEO DOWNLOADER ]
│
├ *Title:* ${video.title}
├ *Views:* ${video.views}
├ *Duration:* ${video.timestamp}
├ *Uploaded:* ${video.ago}
├ *Author:* ${video.author?.name || "Unknown"}
│
╰──────────────────◆\n> 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐝𝐞𝐯𝐨𝐬-𝐗 𝐓𝐞𝐜𝐡`;

        await King.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption
        }, { quoted: m });

        // Download API
        const apiUrl = `https://apis.davidcyril.name.ng/download/ytmp4`;
        const { data } = await axios.get(apiUrl, {
            params: { url: video.url }
        });

        // Validate API response
        if (!data.success || !data.result?.download_url) {
            return reply('*Failed to fetch video download link!*');
        }

        const result = data.result;

        // Send video
        await King.sendMessage(m.chat, {
            video: { url: result.download_url },
            mimetype: 'video/mp4',
            caption:
                `🎬 *Title:* ${result.title}\n` +
                `📽️ *Quality:* ${result.quality}`
        }, { quoted: m });
        
await King.sendMessage(m.chat, {
            react: { text: '', key: m.key }
        });
        
    } catch (err) {
        console.error('VIDEO ERROR:', err);
        reply('*An error occurred while downloading the video.*');
    }
    break;
}
case 'song': {
  if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return reply(`*Example:* ${prefix + command} Sailor song by Gigi Perez`);

    try {
        const query = text.trim();
        await reply('🔍 Searching for your song request...');

        // 🔹 Search YouTube
        const search = await yts(query);
        const video = search.videos?.[0];
        if (!video) return reply(`❌ No results found for: *${query}*`);

        const {
            url: videoUrl,
            title: videoTitle,
            thumbnail,
            duration,
            author
        } = video;

        // 🔹 Preview message
        const infoMessage =
`*🎧 Adevos X - Song Player*
🎵 *Title:* ${videoTitle}
🎤 *Artist:* ${author?.name || 'Unknown'}
⏱️ *Duration:* ${duration?.timestamp || 'N/A'}
🔗 *Source:* YouTube`;

        await King.sendMessage(
            m.chat,
            { image: { url: thumbnail }, caption: infoMessage },
            { quoted: m }
        );

        // 🔹 AUDIO DOWNLOAD
        const audioApi = `https://apis.prexzyvilla.site/download/play?q=${encodeURIComponent(query)}`;
        const audioRes = await axios.get(audioApi);

        if (
            audioRes.data?.status &&
            audioRes.data?.data?.download?.download_url
        ) {
            const audioUrl = audioRes.data.data.download.download_url;
            const title = audioRes.data.data.metadata?.title || videoTitle;

            await King.sendMessage(
                m.chat,
                {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`
                },
                { quoted: m }
            );
        } else {
            await reply("❌ Failed to fetch audio.");
        }

        await new Promise(r => setTimeout(r, 1500)); // anti-crash delay

        // 🔹 VIDEO DOWNLOAD
        const videoApi = `https://apis.prexzyvilla.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`;
        const videoRes = await axios.get(videoApi);

        if (videoRes.data?.status && videoRes.data?.data?.downloadURL) {
            const { downloadURL, title } = videoRes.data.data;

            await King.sendMessage(
                m.chat,
                {
                    video: { url: downloadURL },
                    mimetype: 'video/mp4',
                    fileName: `${title.replace(/[^\w\s]/gi, '')}.mp4`,
                    caption: `🎬 *Here is your video:*\n${title} - ${author?.name || ''}`
                },
                { quoted: m }
            );
        } else {
            await reply("❌ Failed to fetch video.");
        }

    } catch (err) {
        console.error('Song Command Error:', err);
        reply('❌ An error occurred while processing your request.');
    }
    break;
}
        case 'ytmp4': {
  if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) {
        return reply(`*Example*: ${prefix + command} https://youtube.com/watch?v=60ItHLz5WEA`);
    }

    if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(text)) {
        return reply("❌ Please provide a valid YouTube URL.");
    }

    try {
        reply('🔍 Fetching video, please wait...');

        const apiUrl = `https://apis.prexzyvilla.site/download/ytmp4?url=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 15000 });

        if (response.data && response.data.success) {
            const { title, thumbnail, download_url } = response.data.result;

            await King.sendMessage(m.chat, {
                image: { url: thumbnail },
                caption:
                    `🎬 *Video Found!*\n\n` +
                    `📌 *Title:* ${title}\n` +
                    `🔗 *Link:* ${text}\n\n` +
                    `📥 Preparing your download...`
            }, { quoted: m });

            await King.sendMessage(m.chat, {
                video: { url: download_url },
                mimetype: 'video/mp4',
                caption: `🎬 *Title:* ${title}\n\n${footer}`
            }, { quoted: m });

        } else {
            reply("❌ Couldn't fetch the video. Try again later.");
        }

    } catch (error) {
        console.error("ytmp4 error:", error.message || error);
        reply("❌ An error occurred while fetching the video.");
    }
    break;
}
case 'play2': {
  if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) {
        return reply(`*Use:* ${prefix}play2 [song name ]\n\n*Example:* ${prefix}play2 faded alan walker`);
    }

    try {
        // Send initial loading message
        let loadMsg = await King.sendMessage(m.chat, { 
            text: "⏳ *Searching for the song…*"
        }, { quoted: m });

        // Function to edit loading message
        const editLoad = async (newText) => {
            await King.sendMessage(m.chat, {
                edit: loadMsg.key,
                text: newText
            });
        };

        // 1️⃣ Searching YouTube
        let ytsData = await yts(text);
        let result = ytsData.videos[0];
        if (!result) return editLoad("❌ *No results found!*");

        let urlYt = result.url;
        let title = result.title;

        // Update loading
        await editLoad("🎶 *Fetching download link…*");

        // 2️⃣ Fetch MP3 link
        let apiUrl = `https://apis.davidcyril.name.ng/youtube/mp3?url=${urlYt}`;
        let response = await axios.get(apiUrl);

        if (!response.data.status) {
            return editLoad("❌ *Failed to fetch MP3. API error.*");
        }

        let downloadUrl = response.data.result.download_url;

        // Update loading
        await editLoad("📥 *Downloading audio…*");

        // 3️⃣ Sending audio file
        await editLoad("📤 *Sending audio…*");
      // Final edit
        await editLoad("✅ *Downloaded successfully*");
        await King.sendMessage(m.chat, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: `🎵 *${title}*\nDownloaded via *Play2*`
        }, { quoted: m });

  

    } catch (e) {
        console.log(e);
        return reply("❌ *Error occurred while processing play2.*");
    }
}
break;
     case 'playdoc': {
  if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) {
        return reply(`*Use:* ${prefix}playdoc [ song name ]\n\n*Example:* ${prefix}playdoc faded alan walker`);
    }

    try {
        // Initial loading
        let loadMsg = await King.sendMessage(m.chat, { 
            text: "⏳ *Searching for the song…*"
        }, { quoted: m });

        // Edit loading message function
        const editLoad = async (newText) => {
            await King.sendMessage(m.chat, {
                edit: loadMsg.key,
                text: newText
            });
        };

        // 1️⃣ Search YouTube
        let ytsData = await yts(text);
        let result = ytsData.videos[0];
        if (!result) return editLoad("❌ *No results found!*");

        let urlYt = result.url;
        let title = result.title;

        await editLoad("🎶 *Fetching download link…*");

        // 2️⃣ Get MP3 download link
        let apiUrl = `https://apis.davidcyril.name.ng/youtube/mp3?url=${urlYt}`;
        let response = await axios.get(apiUrl);

        if (!response.data.status) {
            return editLoad("❌ *Failed to fetch MP3. API error.*");
        }

        let downloadUrl = response.data.result.download_url;

        await editLoad("📥 *Downloading audio…*");

        // 3️⃣ Send audio as DOCUMENT
        await editLoad("📤 *Sending audio as document…*");

        await King.sendMessage(m.chat, {
            document: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: `🎵 *${title}*\nSent as a *Document*`
        }, { quoted: m });

        await editLoad("✅ *Downloaded as document!*");

    } catch (err) {
        console.log(err);
        return reply("❌ *Error processing playdoc.*");
    }
}
break;
case 'ibsbmg': {
  if (!q) return m.reply(`Use like: .img robin,3:4`);

  let parts = q.split(',');
  let prompt = parts[0]?.trim();
  let ratio = parts[1]?.trim() || "1:1"; // default ratio if not provided

  try {
    let apiUrl = `https://apis.prexzyvilla.site/ai/imagen?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}`;
    let res = await fetch(apiUrl);
    let data = await res.json();

    if (data.status && data.result) {
      await King.sendMessage(m.chat, {
        image: { url: data.result },
        caption: `✅ Image Generated\n\n📝 Prompt: ${prompt}\n📐 Ratio: ${ratio}`
      }, { quoted: m });
    } else {
      m.reply("❌ Failed to generate image. Try again!");
    }
  } catch (e) {
    console.error(e);
    m.reply("⚠️ Error fetching from API.");
  }
}

break;
case 'kick': {
  if (!usedWithPrefix(m, command, prefix)) return;
 
  if (!isCreator) return reply("Only for my lovely owner 😝");
  if (!m.quoted) return reply("Tag or quote the user to kick!");
  if (!m.isGroup) return reply(msg.only.group);
  if (!isAdmins) return reply("Only group admins can kick");
  let users = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await King.groupParticipantsUpdate(m.chat, [users], 'remove');
  reply("User has been kicked Out of the group");
}
break;

case 'listadmin':
case 'admin': {
  if (!usedWithPrefix(m, command, prefix)) return;
 
  if (!isCreator) return reply("Only for my lovely owner 😝");
  if (!m.isGroup) return reply(msg.only.group);

  const groupAdmins = participants.filter(p => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';

  let text = `* Group Admins:*\n${listAdmin}`;
  King.sendMessage(m.chat, {
    text,
    mentions: [...groupAdmins.map(v => v.id), owner]
  }, { quoted: m });
}
break;

case 'delete':
case 'del': {
   if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("Only for my lovely owner 😝");
  if (!m.quoted) return reply("Reply to a message to delete it");

  King.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.quoted.id,
      participant: m.quoted.sender
    }
  });
}
break;

case 'grouplink': {
   if (!usedWithPrefix(m, command, prefix)) return;
  if (!m.isGroup) return reply(msg.only.group);

  let response = await King.groupInviteCode(m.chat);
  King.sendText(m.chat, `https://chat.whatsapp.com/${response}\n\n*🔗 Group Link:* ${groupMetadata.subject}`, m, { detectLink: true });
}
break;

case 'tag':
case 'totag': {
   if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("Only for my lovely owner 😝");
  if (!m.isGroup) return reply(msg.only.group);
  if (!isAdmins) return reply("Only group admins");
  if (!m.quoted) return reply(`Reply with ${prefix + command} to a message`);

  King.sendMessage(m.chat, {
    forward: m.quoted.fakeObj,
    mentions: participants.map(a => a.id)
  });
}
break;
case 'tagall': {
   if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("Only for my lovely owner 😝");
  if (!m.isGroup) return reply(msg.only.group);

  const textMessage = args.join(" ") || "No context";
  let teks = `\`\`\` Tagging all members:\`\`\`\n> *${textMessage}*\n\n`;

  const groupMetadata = await King.groupMetadata(m.chat);
  const participants = groupMetadata.participants;

  for (let mem of participants) {
    teks += `@${mem.id.split("@")[0]}\n`;
  }

  King.sendMessage(m.chat, {
    text: teks,
    mentions: participants.map((a) => a.id)
  }, { quoted: m });
}
break;

case 'hidetag': {
  if (!usedWithPrefix(m, command, prefix)) return;
 
  if (!isCreator) return reply("Only for my lovely owner 😝");
  const groupMetadata = await King.groupMetadata(m.chat);
  const participants = groupMetadata.participants;
  
  King.sendMessage(m.chat, {
    text: q || '',
    mentions: participants.map(a => a.id)
  }, { quoted: m });
}
break;

case 'promote': {
   if (!usedWithPrefix(m, command, prefix)) return;
  if (!m.isGroup) return reply(msg.only.group);
  if (!isAdmins) return reply("Only group admins can use this!");
 
  let users = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await King.groupParticipantsUpdate(m.chat, [users], 'promote');
  reply("User promoted to admin");
}
break;   
        case 'demote': {
   if (!usedWithPrefix(m, command, prefix)) return;
  if (!m.isGroup) return reply(msg.only.group);
  if (!isAdmins) return reply("Only group admins can use this!");
  let users = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await King.groupParticipantsUpdate(m.chat, [users], 'demote');
  reply("User demoted from admin");
}
break;

case 'mute': {
   if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("Only for my lovely owner 😝");
  if (!m.isGroup) return reply("Group command only");
  if (!isAdmins) return reply("Admins only");

  await King.groupSettingUpdate(m.chat, 'announcement');
  reply("Group muted. Only admins can text!");
}
break;

case 'unmute': {
   if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("Only for my lovely owner 😝");
  if (!m.isGroup) return reply("Group command only");
  if (!isAdmins) return reply("Admins only");

  await King.groupSettingUpdate(m.chat, 'not_announcement');
  reply("Group unmuted. Everyone can text!");
}
break;

case 'left': {
   if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("Only for my lovely owner 😝");
  await King.groupLeave(m.chat);
  reply("byebye");
}
break;

case 'add': {
   if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("Only for my lovely owner 😝");
  if (!m.isGroup) return reply(msg.only.group);

  let users = m.quoted?.sender || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  await King.groupParticipantsUpdate(m.chat, [users], 'add');
  reply("User added to group");
}
break;

case 'setpp': {
  if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply('This command is restricted to owner only');
  if (!quoted || !/image/.test(mime)) return reply(`Reply to an image to set as bot profile picture.`);
  let media = await quoted.download();
  await King.updateProfilePicture(botNumber, media);
  reply('Profile picture updated ✅');
}
break;
case "gpt4": {
    const chatId = m.key.remoteJid;
    // Use args if provided, otherwise use quoted message text (if any)
    let query = args.join(" ").trim();
    try {
        // If no args, check if user replied to a message and use that text
        if (!query && m.message && m.message.extendedTextMessage && m.message.extendedTextMessage.contextInfo && m.message.extendedTextMessage.contextInfo.quotedMessage) {
            // quotedMessage can be different message types; prefer text
            const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
            if (quoted.conversation) query = quoted.conversation;
            else if (quoted.extendedTextMessage && quoted.extendedTextMessage.text) query = quoted.extendedTextMessage.text;
        }

        if (!query) {
            return await King.sendMessage(chatId, { text: "❗ Please provide a prompt. Usage: `.gpt4 <your question>` or reply to a message with `.gpt4`" });
        }

        // Call API
        const res = await fetch(`https://apis.prexzyvilla.site/ai/gpt4?text=${encodeURIComponent(query)}`, { method: "GET" });
        if (!res.ok) {
            return await King.sendMessage(chatId, { text: `⚠️ GPT-4 API returned HTTP ${res.status}` });
        }

        const json = await res.json();

        // The API returns the text in json.data (based on the sample you provided)
        const answer = (json && (typeof json.data === "string" ? json.data : (json.data?.text || json.data?.result || ""))) || "";

        if (!answer) {
            return await King.sendMessage(chatId, { text: "⚠️ No response from GPT-4 API." });
        }

        // Split into safe-sized chunks for WhatsApp (adjust size if needed)
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
            const header = i === 0 ? `🤖 *GPT-4 Response:*\n\n` : "";
            await King.sendMessage(chatId, { text: header + chunks[i] });
        }
    } catch (err) {
        console.error("gpt4 command error:", err);
        await King.sendMessage(chatId, { text: "⚠️ Sorry, I couldn't connect to the GPT-4 API right now." });
    }
}
break;
case 'webcopier': {
if (!usedWithPrefix(m, command, prefix)) return;
    if (!text) return reply(`❗ *Please provide a URL*\n\nExample:\n${prefix}webcopier https://example.com`);

    try {
        // Send initial loading message
        let loadMsg = await King.sendMessage(m.chat, { text: "⏳ *Copying website, please wait...*" }, { quoted: m });

        // Fetch the ZIP file from API
        let response = await fetch(`https://eliteprotech-apis.zone.id/webcopier?url=${encodeURIComponent(text)}`);
        if (!response.ok) throw new Error("Failed to fetch website.");

        let buffer = await response.arrayBuffer();
        let zipFile = Buffer.from(buffer);

        // Send the ZIP file as document
        await King.sendMessage(m.chat, {
            document: zipFile,
            fileName: "website.zip",
            mimetype: "application/zip",
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        reply(`❌ Failed to copy the website.\n\nError: ${err.message}`);
    }
    break;
}
case 'runtivvme': case 'alivccce': { 
         reply(`*Runtime : ${runtime(process.uptime())}*`); 
}
break
case 'mode':{
if (!usedWithPrefix(m, command, prefix)) return;
     reply(`*Current Mode:* ${King.public ? 'Public' : 'Private'}\nUsage *.private* or *.public*`);
     }
     break
 case 'ping': case 'speed': { 
  if (!usedWithPrefix(m, command, prefix)) return;
let timestamp = speed()
let latensi = speed() - timestamp

         reply (`𝐀𝐝𝐞𝐯𝐨𝐬 𝐌𝐢𝐧-𝐁𝐨𝐭 𝐬𝐩𝐞𝐞𝐝: ${latensi.toFixed(4)} Ms`); 
}
break;
   case 'public': {
  if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return m.reply("Command restricted for owner only");
    setSetting("bot", "mode", "public");
    King.public = true;
    m.reply("𝐏𝐮𝐛𝐥𝐢𝐜 𝐦𝐨𝐝𝐞 𝐞𝐧𝐚𝐛𝐥𝐞𝐝.");
}
break;

case 'private':
case 'self': {
  if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return m.reply("Command restricted for owner only");
    setSetting("bot", "mode", "self");
    King.public = false;
    m.reply("𝐏𝐫𝐢𝐯𝐚𝐭𝐞 𝐦𝐨𝐝𝐞 𝐞𝐧𝐚𝐛𝐥𝐞𝐝.");
}
break;


case 'readmore': {
  if (!usedWithPrefix(m, command, prefix)) return;
    const more = String.fromCharCode(8206);
    const readmore = more.repeat(4001);
    
    let [leftText, rightText] = text.split('|');
    if (!leftText) leftText = '';
    if (!rightText) rightText = '';
    
    const fullText = leftText + readmore + rightText;
    
    King.sendMessage(m.chat, {
        text: fullText
    }, { quoted: m });
    break;
}
//== ban function for creator only== //
case "banuser1": case "banuser": {
if (!isCreator) return m.reply("```𝗙𝗢𝗥 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥𝗦 𝗢𝗡𝗟𝗬```.");
if (m.quoted || text) {
let orang = m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '')+'@s.whatsapp.net' : m.quoted ? m.quoted.sender : ''
if (ban.includes(orang)) return m.reply(`*User ${orang.split('@')[0]} is already banned 😌*`)
await ban.push(orang)
await fs.writeFileSync("./database/banned.json", JSON.stringify(ban))
m.reply(`\`\`\`user ${orang.split('@')[0]} banned from using the bot`)
} else {
return m.reply(example("/@tag/234XXX/reply to chat"))
}}
break;

case "unbanuser1": case "unbanuser":  {
if (!isCreator) return m.reply("```𝗙𝗢𝗥 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥𝗦 𝗢𝗡𝗟𝗬```.");
if (m.quoted || text) {
let orang = m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '')+'@s.whatsapp.net' : m.quoted ? m.quoted.sender : ''
if (!ban.includes(orang)) return m.reply(`\`\`\`User ${orang.split('@')[0]} not found in banlist 😌\`\`\``)
let indx = ban.indexOf(orang)
await ban.splice(indx, 1)
await fs.writeFileSync("./database/banned.json", JSON.stringify(ban))
m.reply(`\`\`\`user  ${orang.split('@')[0]} unbanned your free to use the bot\`\`\``)
} else {
return m.reply(example("@tag/234XX/reply to chat"))
}}
break

case "listban": case "listbanuser": {
if (!isCreator) return m.reply("```𝗙𝗢𝗥 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥𝗦 𝗢𝗡𝗟𝗬```.");
if (ban.length < 1) return m.reply("no banned users yet ")
let teksnya = `banned user here\n`
ban.forEach(e => teksnya += `* @${e.split("@")[0]}\n`)
await King.sendMessage(m.chat, {text: teksnya, mentions: [... ban]}, {quoted: m})
}
break;
// ban function for creator only
case 'git': case 'gitclone':
  if (!usedWithPrefix(m, command, prefix)) return;
if (!args[0]) return reply(`Where is the link?\nExample :\n${prefix}${command} https://github.com`)
if (!isUrl(args[0]) && !args[0].includes('github.com')) return replynano(`Link invalid!!`)
let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
    let [, user, repo] = args[0].match(regex1) || []
    repo = repo.replace(/.git$/, '')
    let url = `https://api.github.com/repos/${user}/${repo}/zipball`
    let filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
    King.sendMessage(m.chat, { document: { url: url }, fileName: filename+'.zip', mimetype: 'application/zip' }, { quoted: m }).catch((err) => replynano(mess.error))
break; 
case 'coffee': case 'kopi': {
  if (!usedWithPrefix(m, command, prefix)) return;
King.sendMessage(m.chat, {caption: m.success, image: { url: 'https://coffee.alexflipnote.dev/random' }}, { quoted: m })
            }
            break; 
case 'gxhxhxh': 
case 'styletext': {
  if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return m.reply(example('Enter Query text!'))
  let anu = await styletext(text)
  let teks = `Style Text From ${text}\n\n`
  for (let i = 0; i < anu.length; i++) {
    teks += `${i + 1}. ${anu[i].name} : ${anu[i].result}\n\n`
  }
  await m.reply(teks)
} 
break;     
  case "xvideodl": {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("This command is restricted to owner only"); 
if (!text) return m.reply(example(`xvideo link`))
// Check if link is from xvideo
if (!text.includes("xvideos.com")) return m.reply("Link is not from xvideos.com")
await King.sendMessage(m.chat, {react: {text: '🍑', key: m.key}})
// Fetching video data from API
try {
let res = await fetch(`https://api.agatz.xyz/api/xvideodown?url=${encodeURIComponent(text)}`);
let json = await res.json();

// Bad response from API
if (json.status !== 200 || !json.data) {
throw "Cannot find video for this URL.";
}

// Retrieving video information from API
let videoData = json.data;

// Download videos using URLs obtained from API
const videoUrl = videoData.url;
const videoResponse = await fetch(videoUrl);

// Check if the video was downloaded successfully
if (!videoResponse.ok) {
throw "Failed to download video.";
}

// Send video
await King.sendMessage(m.chat, {
video: {
url: videoUrl,
},
caption: `*Title:* ${videoData.title || 'No title'}\n` +
`*Views:* ${videoData.views || 'No view information'}\n` +
`*Votes:* ${videoData.vote || 'No vote information'}\n` +
`*Likes:* ${videoData.like_count || 'No like information'}\n` +
`*Dislikes:* ${videoData.dislike_count || 'No dislike information'}`,
});
await King.sendMessage(m.chat, {react: {text: '', key: m.key}})
} catch (e) {
console.log(`Error downloading video: ${e}`);
}
}
break;

case 'time': {
  if (!usedWithPrefix(m, command, prefix)) return;
    try {
        let waktu = getCurrentTime(); // Call the function
        await King.sendMessage(m.chat, { 
            text: waktu 
        }, { quoted: m });
    } catch (err) {
        console.log(err);
        reply("❌ Error fetching current time");
    }
}
break;
function getCurrentTime() {
    const moment = require('moment-timezone');

    // Set timezone
    const tz = "Africa/Lagos";
    const now = moment().tz(tz);

    const date = now.format("YYYY-MM-DD");
    const time = now.format("HH:mm:ss");
    const day = now.format("dddd");

    return `
TIME: 🕰️ *Current Bot Time:*

📅 *Date:* ${date}
🕒 *Time:* ${time} (${tz})
📆 *Day:* ${day}
`;
}
  case "xnxxvideodl": {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("This command is restricted to owner only"); 
if (!text) return m.reply(example(`xnxx videolink`))
// Check if link is from xvideo
if (!text.includes("xnxx.com")) return m.reply("Link is not from xnxx.com")
await King.sendMessage(m.chat, {react: {text: '🍑', key: m.key}})
// Fetching video data from API
try {
let res = await fetch(`https://apis.prexzyvilla.site/nsfw/xnxx-dl?url=${encodeURIComponent(text)}`);
let json = await res.json();

// Bad response from API
if (json.status !== 200 || !json.data) {
throw "Cannot find video for this URL.";
}

// Retrieving video information from API
let videoData = json.data;

// Download videos using URLs obtained from API
const videoUrl = videoData.url;
const videoResponse = await fetch(videoUrl);

// Check if the video was downloaded successfully
if (!videoResponse.ok) {
throw "Failed to download video.";
}

// Send video
await King.sendMessage(m.chat, {
video: {
url: videoUrl,
},
caption: `*Title:* ${videoData.title || 'No title'}\n` +
`*Views:* ${videoData.views || 'No view information'}\n` +
`*Votes:* ${videoData.vote || 'No vote information'}\n` +
`*Likes:* ${videoData.like_count || 'No like information'}\n` +
`*Dislikes:* ${videoData.dislike_count || 'No dislike information'}`,
});
await King.sendMessage(m.chat, {react: {text: '', key: m.key}})
} catch (e) {
console.log(`Error downloading video: ${e}`);
}
}
break;

case 'xvideosearch':{
  if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return m.reply(example(`Milf`))
  try {
    // checking data from api
    let res = await fetch(`https://apis.prexzyvilla.site/nsfw/xvideos-search?query=${encodeURIComponent(text)}`);
    let json = await res.json();

    // checking api response status
    if (json.status !== 200 || !json.data || json.data.length === 0) {
      throw 'No videos found for this keyword.';
    }

    // fetching search data from api
    let videos = json.data;
    let message = `🍑\nxvideo search result\n\n *"${text}"*:\n`;

    // Composing messages with video information
    videos.forEach(video => {
      message += `Title: ${video.title || 'no name'}\n` +
                 `  Duration: ${video.duration || 'no duration'}\n` +
                 `  URL: ${video.url || 'no URL'}\n` +
                 `  Thumbnail: ${video.thumb || 'no thumbnail'}\n\n`;
    });

    // Sending messages with video lists
    await King.sendMessage(m.chat, {
      text: message,
    });

  } catch (e) {
    // Handling errors and sending error messages
    await King.sendMessage(m.chat, `can't fetch result from query`);
  }
}
break; 
// ✅ Command switch
case 'xnxxsearch': {
  if (!usedWithPrefix(m, command, prefix)) return;
	if (!text) return reply(`Enter Query`)
	reply(mess.wait)
	const fg = require('api-dylux')
	let res = await fg.xnxxSearch(text)
            let ff = res.result.map((v, i) => `${i + 1}┃ *Title* : ${v.title}\n*Link:* ${v.link}\n`).join('\n') 
              if (res.status) reply(ff)
              }
              break;  
case 'imbd':
if (!text) return reply(`_Name a Series or movie`)
            let fids = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${text}&plot=full`)
            let imdbt = ""
            console.log(fids.data)
            imdbt += "⚍⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚍\n" + " ``` IMDB SEARCH```\n" + "⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎\n"
            imdbt += "🎬Title      : " + fids.data.Title + "\n"
            imdbt += "📅Year       : " + fids.data.Year + "\n"
            imdbt += "⭐Rated      : " + fids.data.Rated + "\n"
            imdbt += "📆Released   : " + fids.data.Released + "\n"
            imdbt += "⏳Runtime    : " + fids.data.Runtime + "\n"
            imdbt += "🌀Genre      : " + fids.data.Genre + "\n"
            imdbt += "👨🏻‍💻Director   : " + fids.data.Director + "\n"
            imdbt += "✍Writer     : " + fids.data.Writer + "\n"
            imdbt += "👨Actors     : " + fids.data.Actors + "\n"
            imdbt += "📃Plot       : " + fids.data.Plot + "\n"
            imdbt += "🌐Language   : " + fids.data.Language + "\n"
            imdbt += "🌍Country    : " + fids.data.Country + "\n"
            imdbt += "🎖️Awards     : " + fids.data.Awards + "\n"
            imdbt += "📦BoxOffice  : " + fids.data.BoxOffice + "\n"
            imdbt += "🏙️Production : " + fids.data.Production + "\n"
            imdbt += "🌟imdbRating : " + fids.data.imdbRating + "\n"
            imdbt += "✅imdbVotes  : " + fids.data.imdbVotes + ""
           King.sendMessage(m.chat, {
image: {
url: fids.data.Poster,
},
caption: imdbt,
            }, {
quoted: m,
            })
            break;
            case 'tiktoksearch': {
              if (!usedWithPrefix(m, command, prefix)) return;
    if (!m.text) return King.sendMessage(m.chat, { text: "Please provide a search term." }, { quoted: m });

    try {
        let query = m.text;
        let url = `https://apis.prexzyvilla.site/search/tiktoksearch?q=${encodeURIComponent(query)}`;

        let response = await fetch(url);
        let json = await response.json();

        if (!json.status || !json.data || json.data.length === 0) {
            return King.sendMessage(m.chat, { text: "No results found." }, { quoted: m });
        }

        // Take first 3 videos
        let videos = json.data.slice(0, 3);

        for (let i = 0; i < videos.length; i++) {
            let vid = videos[i];
            let date = new Date(vid.create_time * 1000);
            let info = `🚀 No : ${i + 1}\n📦 Type : TikTok Video\n❤️ Likes : ${vid.digg_count}\n🧾 Title : ${vid.title}\n👀 Views : ${vid.play_count}\n⏳ Duration : ${vid.duration}s\n📤 Uploaded : ${date.toDateString()}`;

            // Send video with info as caption
            await King.sendMessage(m.chat, { video: { url: vid.play }, caption: info }, { quoted: m });
        }

    } catch (err) {
        console.log(err);
        King.sendMessage(m.chat, { text: "Error fetching TikTok data." }, { quoted: m });
    }
}
break;
// TikTok Search Command

 case'nsbxmdmfw': {
  try {

    const apiUrl = 'https://draculazyx-xyzdrac.hf.space/api/hentai';
    console.log("API URL:", apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const contentType = response.headers.get('Content-Type');
    console.log("Content-Type:", contentType);

    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error("Received non-JSON response:", text);
        throw new Error(`Expected JSON, but received: ${contentType || 'no Content-Type'}.  Raw response: ${text}`);
    }

    const data = await response.json();

    if (data && data.videoUrl) {
      const videoUrl = data.videoUrl;
      const title = data.title;
      const description = data.description;
      const resolution = data.resolution;
      const thumbnailUrl = data.thumbnailUrl;

      const apiText = `
-  *🎥 Video Title:* ${title}\n
-  *📑 Video Description:* ${description}\n
-  *🖼️ Resolution:* _${resolution}_
`;

      await King.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption: apiText,
          footer: 'Hentai is a adult content, you have been warned', // Adiciona aviso sobre o conteúdo
        },
        { quoted: m }
      );
    } else {
      console.warn("premium-hentai: No video URL received from API or data is missing.");
      await King.sendMessage(m.chat, { text: "Could not retrieve premium content. Please try again later." }, { quoted: m });
    }
  } catch (error) {
    console.error("Error during premium hentai retrieval:", error);
    await King.sendMessage(m.chat, { text: `An error occurred while retrieving premium content. Please try again later. Error: ${error.message}` }, { quoted: m });
  }
  }
  break; 
case 'cpuinfo': {
  if (!usedWithPrefix(m, command, prefix)) return;
await King.sendMessage(m.chat, {react: {text: '🧩', key: m.key}})
  reply(`🖥️ *CPU Information*
🧩 Model: DO-Premium-AMD
🧩 Cores: 4
🧩 Base Speed: 0 MHz`)
  }
  break;
case 'diskinfo': {
  if (!usedWithPrefix(m, command, prefix)) return;
await King.sendMessage(m.chat, {react: {text: '💾', key: m.key}})
  reply(`💾 *Disk Usage*
Total: 113G
Used: 15G
Free: 98G
Usage: ${ram}`)
  }
  break;  
case 'commands': {
  if (!usedWithPrefix(m, command, prefix)) return;
await King.sendMessage(m.chat, {react: {text: '💥', key: m.key}})
  reply(`🔴 *Total bot commands:* 400`)
  }
  break;   
case 'channel': {
  if (!usedWithPrefix(m, command, prefix)) return;
  reply(`*📢 Official WhatsApp Channel:*

🔗 https://whatsapp.com/channel/0029Vb6wIVU9Bb5w69FQvt0W

✅ Click the link above to follow 𝐀𝐝𝐞𝐯𝐨𝐬-𝐗 𝐓𝐞𝐜𝐡 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥 for updates, bots, Giveaway's, and more!`)
  }
  break;  
  case 'support': {
  reply(`*☎️ To contact support:*

🔗 https://t.me/adevosX

✅ Click the link above to contact support for the bot`)
  }
  break;  
case 'unlffi':
  case 'unli-panerl': {
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!isCreator) return reply("This command is restricted to owner only");  
await King.sendMessage(m.chat, {react: {text: '🇦🇱', key: m.key}})  
  reply(`*Command Not available 🚫 at the Moment*`)
  }
  break;  
  case 'delpair':
    if (!usedWithPrefix(m, command, prefix)) return;
  if (!q) return reply(`Please enter a valid number to delete the pairing folder
Format: .delpair 234xxxxxxx`);
  const dirPath = './nexstore/pairing/';
  const folderName = fs.readdirSync(dirPath).find((file) => {
    return file.endsWith(`${q}@s.whatsapp.net`);
  });
  if (!folderName) return reply(`Folder not found: ${q}`);
  try {
    fs.rmdirSync(path.join(dirPath, folderName), { recursive: true });
    reply(`*✅ pair number deleted Successfully:* ${folderName}`);
  } catch (err) {
    reply(`Error deleting paired device ${err.message}`);
  }
break;
case 'listpair':
  if (!usedWithPrefix(m, command, prefix)) return;
    if (!isCreator) return m.reply("```𝗙𝗢𝗥 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥𝗦 𝗢𝗡𝗟𝗬```.");
  try {
    const dirPath = './nexstore/pairing/pairing.json';
    const folderNames = fs.readdirSync(dirPath).filter((file) => {
      return fs.statSync(path.join(dirPath, file)).isDirectory();
    });
    reply(`List of paired device: ${folderNames.join(', ')}`);
  } catch (err) {
    reply(`Error listing: ${err.message}`);
  }
break;
case 'pair':
  if (!usedWithPrefix(m, command, prefix)) return;
await King.sendMessage(m.chat, {react: {text: '🔁', key: m.key}})  
  if (!q) return reply(`❗Please enter a valid number to request the pairing code\n 
\`Example: .pair 234xxxxxxx\``);

  target = text.split("|")[0];
  sjid = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : target.replace(/[^0-9]/g,'') + "@s.whatsapp.net";

  var contactInfo = await King.onWhatsApp(sjid);
  if (contactInfo.length === 0) {
    return reply("The number is not registered on WhatsApp");
  }

  const startpairing = require('./pair.js');
  await startpairing(sjid);
  await sleep(4000);

  const cu = fs.readFileSync('./nexstore/pairing/pairing.json', 'utf-8');
  const cuObj = JSON.parse(cu);

  // Send just the code first
  await King.sendMessage(from, { text: `${cuObj.code}` }, { quoted: m });

  // Send the instructions next
  const instructions = `
*[🔗 Pairing Code Generated ✅]*

🆔 Code: ${cuObj.code}

Steps 📑
➔Open WhatsApp
➔ Linked Devices
➔ Link Device
➔ Enter this code`;

  await King.sendMessage(from, { text: instructions }, { quoted: m });
break;
case "gpt5": {
    const chatId = m.key.remoteJid;
    let query = args.join(" ").trim();

    try {
        // If no args, check if user replied to a message and use that text
        if (!query && m.message && m.message.extendedTextMessage && m.message.extendedTextMessage.contextInfo && m.message.extendedTextMessage.contextInfo.quotedMessage) {
            const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
            if (quoted.conversation) query = quoted.conversation;
            else if (quoted.extendedTextMessage && quoted.extendedTextMessage.text) query = quoted.extendedTextMessage.text;
        }

        if (!query) {
            return await King.sendMessage(chatId, { text: "❗ Please provide a prompt. Usage: `.gpt5 <your question>` or reply to a message with `.gpt5`" });
        }

        // Call the API
        const res = await fetch(`https://apis.prexzyvilla.site/ai/gpt5?text=${encodeURIComponent(query)}&systemPrompt=hi`);
        if (!res.ok) {
            return await King.sendMessage(chatId, { text: `⚠️ GPT-5 API returned HTTP ${res.status}` });
        }

        const json = await res.json();

        // Response is in json.result
        const answer = (json && typeof json.result === "string") ? json.result : "";

        if (!answer) {
            return await King.sendMessage(chatId, { text: "⚠️ No response from GPT-5 API." });
        }

        // Split into chunks (WhatsApp limit safe size ~3000 chars)
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
            const header = i === 0 ? `🤖 *GPT-5 Response:*\n\n` : "";
            await King.sendMessage(chatId, { text: header + chunks[i] });
        }
    } catch (err) {
        console.error("gpt5 command error:", err);
        await King.sendMessage(chatId, { text: "⚠️ Sorry, I couldn't connect to the GPT-5 API right now." });
    }
}
break;
case 'stats': {
  if (!usedWithPrefix(m, command, prefix)) return;
      const used = process.memoryUsage().rss;
      const total = os.totalmem();
      const free = os.freemem();
      reply(`*╭───⏱️ [ BOT STATUS ]* ⏱️
│
├ 💠 *Ping:* 🟢 ${latensi.toFixed(4)}Ms
│
├ 📈 *Uptime:*
│  ${formatUptime(process.uptime())}
│
├ 🔹 *Mode:* ${King.public ? 'Public' : 'Private'}
│  
│
├ 🖥️ *Server Info:*
│  🔵 Platform : linux
│  💻 OS       : Linux
│  🧿 Hostname : Adevos
│
├ 📊 *RAM Usage:*
│: ${formatRam(os.totalmem(), os.freemem())}
│
├ 🗓️ *Date:* ${new Date().toLocaleDateString('en-GB')}
├ 🕒 *Time:*  ${formatLagosTime()} (Africa/Lagos)
╰─────────────────────`);
}
      break;
case "lyrics": {
  if (!usedWithPrefix(m, command, prefix)) return;
    const chatId = m.key.remoteJid;
    const query = args.join(" ");
    if (!query) {
        return King.sendMessage(chatId, { text: "❗ Please provide a song title\nFormat : `.lyrics <song title>`" });
    }

    try {
        const res = await fetch(`https://apis.prexzyvilla.site/search/lyrics?title=${encodeURIComponent(query)}`);
        const json = await res.json();

        if (!json.status || !json.data || !json.data.lyrics) {
            return King.sendMessage(chatId, { text: `❌ Lyrics not found for *${query}*.` });
        }

        const { title, artist, album, lyrics } = json.data;

        // split into chunks (WhatsApp limits ~4000 chars per message)
        const chunks = lyrics.match(/[\s\S]{1,3500}/g) || [lyrics];

        for (let i = 0; i < chunks.length; i++) {
            const header = i === 0 
                ? `🎵 *${title}* – *${artist}*\n📀 Album: ${album || "Unknown"}\n\n`
                : "";
            await King.sendMessage(chatId, { text: header + chunks[i] });
        }
    } catch (err) {
        console.error("Lyrics command error:", err);
        await King.sendMessage(chatId, { text: "⚠️ Sorry, I couldn’t fetch the lyrics right now." });
    }

}
break;      
case 'stickerthf': case 'steal': case 'stickerwm': case 'take': case 'wm': {
  if (!usedWithPrefix(m, command, prefix)) return;
  const getRandom = (ext) => {
            return `${Math.floor(Math.random() * 10000)}${ext}`
        }
  let ahuh = args.join(' ').split('|')
  let satu = ahuh[0] !== '' ? ahuh[0] : `${m.pushName}`
  let dua = typeof ahuh[1] !== '' ? ahuh[1] : `${m.pushName}`
  let { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter')
  let media = await King.downloadAndSaveMediaMessage(quoted)
  let jancok = new Sticker(media, {
  pack: satu, // The pack name
  author: dua, // The author name
  type: StickerTypes.FULL, // The sticker type
  categories: ['🤩', '🎉'], // The sticker category
  id: '12345', // The sticker id
  quality: 70, // The quality of the output file
  background: '#FFFFFF00' // The sticker background color (only for full stickers)
  })
  let stok = getRandom(".webp")
  let nono = await jancok.toFile(stok)
  let nah = fs.readFileSync(nono)
  await King.sendMessage(from,{sticker: nah},{quoted: m})
  await fs.unlinkSync(stok)
  await fs.unlinkSync(media)
}
  break;
  case 'rch':
case 'rch2': {
  if (!usedWithPrefix(m, command, prefix)) return;
    // ✅ Owner Onl

    // Usage: .reactall ❤️ https://whatsapp.com/channel/XXXXXXXX/YY
    const args = text.split(" ");
    if (args.length < 2) {
        return King.sendMessage(m.chat, { 
            text: `⚠️ Usage:\n.react-ch <emoji> <channel link> \n\nExample:\n.reactch https://whatsapp.com/channel/0029VaGvAbCdEfGh1234/45` 
        }, { quoted: m });
    }

    const emoji = args[0];
    const link = args[1];

    // Extract Channel ID + Post ID
    const regex = /whatsapp\.com\/channel\/([A-Za-z0-9]+)\/(\d+)/;
    const match = link.match(regex);

    if (!match) {
        return King.sendMessage(m.chat, { text: "❌ Invalid WhatsApp channel link." }, { quoted: m });
    }

    const channelId = match[1];
    const messageId = match[2];
    const channelJid = channelId + "@newsletter";

    // Load paired users
    const pairedUsers = await loadUsers();
    if (!pairedUsers || pairedUsers.length === 0) {
        return King.sendMessage(m.chat, { text: "⚠️ No paired users found." }, { quoted: m });
    }

    let success = 0, failed = 0;

    for (const user of pairedUsers) {
        try {
            const session = getSession(user.id);
            if (session) {
                await session.sendMessage(channelJid, {
                    react: {
                        text: emoji,
                        key: { id: messageId, remoteJid: channelJid }
                    }
                });
                success++;
            } else {
                failed++;
            }
        } catch (e) {
            failed++;
        }
    }

    // Report
    await King.sendMessage(m.chat, {
        text: `✅ Mass React Finished\n\nEmoji: ${emoji}\nChannel: ${channelJid}\nPost: ${messageId}\n\n👥 Users: ${pairedUsers.length}\n✔️ Success: ${success}\n❌ Failed: ${failed}`
    }, { quoted: m });
}
break;
case 'akiyama': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/akiyama' }}, { quoted: m })
}
break;

case 'ana': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/ana' }}, { quoted: m })
}
break;

case 'art': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/art' }}, { quoted: m })
}
break;

case 'asuna': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/asuna' }}, { quoted: m })
}
break;

case 'ayuzawa': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/ayuzawa' }}, { quoted: m })
}
break;

case 'boruto': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/boruto' }}, { quoted: m })
}
break;

case 'bts': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/bts' }}, { quoted: m })
}
break;

case 'cecan': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/cecan' }}, { quoted: m })
}
break;

case 'chiho': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/chiho' }}, { quoted: m })
}
break;

case 'chitoge': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/chitoge' }}, { quoted: m })
}
break;

case 'cogan': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/cogan' }}, { quoted: m })
}
break;

case 'cosplay': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/cosplay' }}, { quoted: m })
}
break;

case 'cosplayloli': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/cosplayloli' }}, { quoted: m })
}
break;

case 'cosplaysagiri': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/cosplaysagiri' }}, { quoted: m })
}
break;

case 'cyber': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/cyber' }}, { quoted: m })
}
break;

case 'deidara': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/deidara' }}, { quoted: m })
}
break;

case 'doraemon': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/doraemon' }}, { quoted: m })
}
break;

case 'elaina': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/elaina' }}, { quoted: m })
}
break;

// ...continues for all 100+ commands ...
case 'emilia': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/emilia' }}, { quoted: m })
}
break;

case 'erza': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/erza' }}, { quoted: m })
}
break;

case 'exo': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/exo' }}, { quoted: m })
}
break;

case 'femdom': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/femdom' }}, { quoted: m })
}
break;

case 'freefire': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/freefire' }}, { quoted: m })
}
break;

case 'gamewallpaper': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/gamewallpaper' }}, { quoted: m })
}
break;

case 'glasses': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/glasses' }}, { quoted: m })
}
break;

case 'gremory': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/gremory' }}, { quoted: m })
}
break;

case 'hacker': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/hacker' }}, { quoted: m })
}
break;

case 'hestia': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/hestia' }}, { quoted: m })
}
break;

case 'husbu': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/husbu' }}, { quoted: m })
}
break;

case 'inori': {
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/inori' }}, { quoted: m })
}
break;

case 'islamic': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/islamic' }}, { quoted: m })
}
break;

case 'isuzu': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/isuzu' }}, { quoted: m })
}
break;

case 'itachi': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/itachi' }}, { quoted: m })
}
break;

case 'itori': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/itori' }}, { quoted: m })
}
break;

case 'jennie': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/jennie' }}, { quoted: m })
}
break;

case 'jiso': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/jiso' }}, { quoted: m })
}
break;

case 'justina': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/justina' }}, { quoted: m })
}
break;

case 'kaga': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/kaga' }}, { quoted: m })
}
break;

case 'kagura': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/kagura' }}, { quoted: m })
}
break;

case 'kakashi': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/kakashi' }}, { quoted: m })
}
break;

case 'kaori': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/kaori' }}, { quoted: m })
}
break;

case 'cartoon': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/cartoon' }}, { quoted: m })
}
break;

case 'shortquote': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/shortquote' }}, { quoted: m })
}
break;

case 'keneki': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/keneki' }}, { quoted: m })
}
break;

case 'kotori': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/kotori' }}, { quoted: m })
}
break;

case 'kpop': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/kpop' }}, { quoted: m })
}
break;

case 'kucing': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/kucing' }}, { quoted: m })
}
break;

case 'kurumi': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/kurumi' }}, { quoted: m })
}
break;

case 'lisa': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/lisa' }}, { quoted: m })
}
break;

case 'loli': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/loli' }}, { quoted: m })
}
break;

case 'madara': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/madara' }}, { quoted: m })
}
break;

case 'megumin': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/megumin' }}, { quoted: m })
}
break;

case 'mikasa': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/mikasa' }}, { quoted: m })
}
break;

case 'mikey': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/mikey' }}, { quoted: m })
}
break;

case 'miku': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/miku' }}, { quoted: m })
}
break;

case 'minato': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/minato' }}, { quoted: m })
}
break;

case 'mobile': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/mobile' }}, { quoted: m })
}
break;

case 'motor': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/motor' }}, { quoted: m })
}
break;

case 'mountain': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/mountain' }}, { quoted: m })
}
break;

case 'naruto': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/naruto' }}, { quoted: m })
}
break;

case 'neko': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/neko' }}, { quoted: m })
}
break;

case 'neko2': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/neko2' }}, { quoted: m })
}
break;

case 'nekonime': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/nekonime' }}, { quoted: m })
}
break;

case 'nezuko': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/nezuko' }}, { quoted: m })
}
break;

case 'onepiece': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/onepiece' }}, { quoted: m })
}
break;

case 'pentol': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/pentol' }}, { quoted: m })
}
break;

case 'pokemon': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/pokemon' }}, { quoted: m })
}
break;

case 'profil': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/profil' }}, { quoted: m })
}
break;

case 'programming': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/programming' }}, { quoted: m })
}
break;

case 'pubg': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/pubg' }}, { quoted: m })
}
break;

case 'randblackpink': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/randblackpink' }}, { quoted: m })
}
break;

case 'randomnime': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/randomnime' }}, { quoted: m })
}
break;

case 'randomnime2': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/randomnime2' }}, { quoted: m })
}
break;

case 'rize': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/rize' }}, { quoted: m })
}
break;

case 'rose': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/rose' }}, { quoted: m })
}
break;

case 'ryujin': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/ryujin' }}, { quoted: m })
}
break;

case 'sagiri': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/sagiri' }}, { quoted: m })
}
break;

case 'sakura': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/sakura' }}, { quoted: m })
}
break;

case 'sasuke': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/sasuke' }}, { quoted: m })
}
break;

case 'satanic': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/satanic' }}, { quoted: m })
}
break;

case 'shina': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/shina' }}, { quoted: m })
}
break;

case 'shinka': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/shinka' }}, { quoted: m })
}
break;

case 'shinomiya': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/shinomiya' }}, { quoted: m })
}
break;

case 'shizuka': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/shizuka' }}, { quoted: m })
}
break;

case 'shota': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/shota' }}, { quoted: m })
}
break;

case 'space': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/space' }}, { quoted: m })
}
break;

case 'technology': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/technology' }}, { quoted: m })
}
break;

case 'tejina': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/tejina' }}, { quoted: m })
}
break;
case 'toukachan': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/toukachan' }}, { quoted: m })
}
break;

case 'tsunade': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/tsunade' }}, { quoted: m })
}
break;

case 'wfbbbu': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/waifu' }}, { quoted: m })
}
break;

case 'wallhp': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/wallhp' }}, { quoted: m })
}
break;

case 'wallml': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/wallml' }}, { quoted: m })
}
break;

case 'wallmlnime': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/wallmlnime' }}, { quoted: m })
}
break;

case 'yotsuba': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/yotsuba' }}, { quoted: m })
}
break;

case 'yuki': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/yuki' }}, { quoted: m })
}
break;

case 'yulibocil': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/yulibocil' }}, { quoted: m })
}
break;

case 'yumeko': {
if (!usedWithPrefix(m, command, prefix)) return;
    King.sendMessage(m.chat, { caption: m.success, image: { url: 'https://apis.prexzyvilla.site/random/anime/yumeko' }}, { quoted: m })
}
break;
//end of random anime
case "nsfw": {
if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://apis.prexzyvilla.site/random/anhnsfw");
        const img = res.data?.message;
        if (!img) return m.reply("❌ Could not fetch a nsfw image.");
        await King.sendMessage(
            m.chat,
            { image: { url: img }, caption: "🍑 Random Nsfw!" },
            { quoted: m }
        );
    } catch (e) {
        console.error("NFSW ERROR:", e);
        m.reply("❌ Failed to fetch a nsfw image.");
    }
}
break;  
case "xvideo": {
if (!usedWithPrefix(m, command, prefix)) return;
    try {
        const res = await axios.get("https://apis.prexzyvilla.site/random/anhvideonsfw");
        const vid = res.data?.message;
        if (!vid) return m.reply("❌ Could not fetch a xvideo.");
        await King.sendMessage(
            m.chat,
            { video: { url: vid }, caption: "🍑👀 Xvideo\nNote: Do not watch if you are not 18+ 🔞!" },
            { quoted: m }
        );
    } catch (e) {
        console.error("XVIDEO ERROR:", e);
        m.reply("❌ Failed to fetch a Xvideo image.");
    }
}
break;
//end of random anime
case 'anal':
case 'ass':
case 'bdsm':
case 'black':
case 'boobs':
case 'bottomless':
case 'collared':
case 'cum':
case 'cumsluts':
case 'dick':
case 'dom':
case 'dp':
case 'easter':
case 'extreme':
case 'feet':
case 'finger':
case 'fuck':
case 'futa':
case 'gay':
case 'group':
case 'hentai':
case 'kiss':
case 'lick':
case 'pegged':
case 'puffies':
case 'pussy':
case 'real':
case 'suck':
case 'tattoo':
case 'tiny':
case 'xmas': {
if (!usedWithPrefix(m, command, prefix)) return;

    if (!isCreator) return reply("❌ This NSFW command is restricted to owner only.");

    const nsfwEndpoints = {
        anal: 'anal',
        ass: 'ass',
        bdsm: 'bdsm',
        black: 'black',
        boobs: 'boobs',
        bottomless: 'bottomless',
        collared: 'collared',
        cum: 'cum',
        cumsluts: 'cumsluts',
        dick: 'dick',
        dom: 'dom',
        dp: 'dp',
        easter: 'easter',
        extreme: 'extreme',
        feet: 'feet',
        finger: 'finger',
        fuck: 'fuck',
        futa: 'futa',
        gay: 'gay',
        group: 'group',
        hentai: 'hentai',
        kiss: 'kiss',
        lick: 'lick',
        pegged: 'pegged',
        puffies: 'puffies',
        pussy: 'pussy',
        real: 'real',
        suck: 'suck',
        tattoo: 'tattoo',
        tiny: 'tiny',
        xmas: 'xmas'
    };

    const cmd = command.toLowerCase();
    const endpoint = nsfwEndpoints[cmd];

    if (!endpoint) {
        return King.sendMessage(m.chat, { text: "❌ Invalid NSFW command." }, { quoted: m });
    }

    const url = `https://apis.prexzyvilla.site/nsfw/${endpoint}`;

    // Send loading message
    const loadingMsg = await King.sendMessage(
        m.chat,
        { text: `🔁 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ʀᴀɴᴅᴏᴍ ${endpoint}..` },
        { quoted: m }
    );

    // Send the NSFW image
    await King.sendMessage(
        m.chat,
        { caption: `*ʀᴀɴᴅᴏᴍ ${endpoint} ɴsғᴡ 🫦ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ*\n\nᴜsᴇ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ ᴀɢᴀɪɴ ғᴏʀ ᴀɴᴏᴛʜᴇʀ ʀᴀɴᴅᴏᴍ ɴsғᴡ`, image: { url } },
        { quoted: m }
    );

    // Delete loading message
    await King.deleteMessage(m.chat, loadingMsg.key);
}
break;

case "gemivbnni": {
    const chatId = m.key.remoteJid;
    // Use args if provided, otherwise use quoted message text (if any)
    let query = args.join(" ").trim();
    try {
        // If no args, check if user replied to a message and use that text
        if (!query && m.message && m.message.extendedTextMessage && m.message.extendedTextMessage.contextInfo && m.message.extendedTextMessage.contextInfo.quotedMessage) {
            // quotedMessage can be different message types; prefer text
            const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
            if (quoted.conversation) query = quoted.conversation;
            else if (quoted.extendedTextMessage && quoted.extendedTextMessage.text) query = quoted.extendedTextMessage.text;
        }

        if (!query) {
            return await King.sendMessage(chatId, { text: "❗ Please provide a prompt. Usage: `.gemini <your question>` or reply to a message with `.gemini`" });
        }

        // Call API
        const res = await fetch(`https://apis.prexzyvilla.site/ai/gemini?text=${encodeURIComponent(query)}`, { method: "GET" });
        if (!res.ok) {
            return await King.sendMessage(chatId, { text: `⚠️ GEMINI API returned HTTP ${res.status}` });
        }

        const json = await res.json();

        // The API returns the text in json.data (based on the sample you provided)
        const answer = (json && (typeof json.data === "string" ? json.data : (json.data?.text || json.data?.result || ""))) || "";

        if (!answer) {
            return await King.sendMessage(chatId, { text: "⚠️ No response from GEMINI API." });
        }

        // Split into safe-sized chunks for WhatsApp (adjust size if needed)
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
            const header = i === 0 ? `🤖 *Gemini Response:*\n\n` : "";
            await King.sendMessage(chatId, { text: header + chunks[i] });
        }
    } catch (err) {
        console.error("gemibi command error:", err);
        await King.sendMessage(chatId, { text: "⚠️ Sorry, I couldn't connect to the GEMINI API right now." });
    }
}
break;
 
case "deepseek": {
if (!usedWithPrefix(m, command, prefix)) return;
    const chatId = m.key.remoteJid;
    let query = args.join(" ").trim();

    // If no args, check if the user replied to a message
    if (!query && m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quoted.conversation) query = quoted.conversation;
        else if (quoted.extendedTextMessage?.text) query = quoted.extendedTextMessage.text;
    }

    // If still no query, prompt user
    if (!query) {
        return await King.sendMessage(chatId, { 
            text: "❗ Please provide a prompt.\n*Example:.deepseek <your question>*"});
    }

    let loadingMessage;
    try {
        // Send loading message
        loadingMessage = await King.sendMessage(chatId, { text: "⏳ Contacting Deepseek, please wait..." });

        // Set up fetch with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds
        const res = await fetch(`https://apis.prexzyvilla.site/ai/deepseek?text=${encodeURIComponent(query)}`, { 
            method: "GET", 
            signal: controller.signal 
        });
        clearTimeout(timeout);

        if (!res.ok) {
            return await King.sendMessage(chatId, { text: `⚠️ GROK-AI API returned HTTP ${res.status}` });
        }

        // Safe JSON parsing
        let json;
        try {
            json = await res.json();
        } catch (err) {
            console.error("Grok API JSON parse error:", err);
            return await King.sendMessage(chatId, { text: "⚠️ GROK-AI returned invalid response." });
        }

        // Extract answer
        const answer = (json && (typeof json.data === "string" ? json.data : (json.data?.text || json.data?.result || ""))) || "";

        if (!answer) {
            console.log("Deepseek returned empty response:", json);
            return await King.sendMessage(chatId, { text: "⚠️ GROK-AI No response from API." });
        }

        // Split into WhatsApp-safe chunks
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
            const header = i === 0 ? `🤖 *Deepseek* Response:*\n\n` : "";
            // Edit the loading message for the first chunk
            if (i === 0 && loadingMessage) {
                await King.sendMessage(chatId, { text: header + chunks[i] });
            } else {
                await King.sendMessage(chatId, { text: header + chunks[i] });
            }
        }

    } catch (err) {
        console.error("Deepseek command error:", err);
        const msg = err.name === "AbortError" 
            ? "⚠️ DeepSeek request timed out." 
            : "⚠️ Sorry, I couldn't connect to the Grok API right now.";
        await King.sendMessage(chatId, { text: msg });
    }
}
break;
// =========================
// TEXTPRO CASES
// =========================

/*case 'angel-wings':
case 'angel-wings2':
case 'annonymoushavker':
case 'anniversary-cake':
case 'birthday-card':
case 'christmas-season':
case 'brokeh-text':
case 'cubic-3d':
case 'dragon-ball-cover':
case 'devil-wings':
case 'free-fire-avater':
case 'flame-letters':
case 'frozen-christmas':
case 'joker-avater':
case 'light-bulb-3d':
case 'matrix':
case 'snow-3d':
case 'write-galaxy':
case 'warning-sign':
case 'sunset-light': {

    await generateTextPro(command, args, m.chat, m, King);
}
break;*/
case "grok": {
if (!usedWithPrefix(m, command, prefix)) return;
    const chatId = m.key.remoteJid;
    let query = args.join(" ").trim();

    // If no args, check if the user replied to a message
    if (!query && m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quoted.conversation) query = quoted.conversation;
        else if (quoted.extendedTextMessage?.text) query = quoted.extendedTextMessage.text;
    }

    // If still no query, prompt user
    if (!query) {
        return await King.sendMessage(chatId, { 
            text: "❗ Please provide a prompt.\n*Example:.grok <your question>*" 
        });
    }

    let loadingMessage;
    try {
        // Send loading message
        loadingMessage = await King.sendMessage(chatId, { text: "⏳ Contacting Grok AI, please wait..." });

        // Set up fetch with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds
        const res = await fetch(`https://api.nexoracle.com/ai/gemini-1.5-flash?apikey=58abc73ae34c34784e&prompt=${encodeURIComponent(query)}`, { 
            method: "GET", 
            signal: controller.signal 
        });
        clearTimeout(timeout);

        if (!res.ok) {
            return await King.sendMessage(chatId, { text: `⚠️ GROK-AI API returned HTTP ${res.status}` });
        }

        // Safe JSON parsing
        let json;
        try {
            json = await res.json();
        } catch (err) {
            console.error("Grok API JSON parse error:", err);
            return await King.sendMessage(chatId, { text: "⚠️ GROK-AI returned invalid response." });
        }

        // Extract answer
        const answer = (json && (typeof json.data === "string" ? json.data : (json.data?.text || json.data?.result || ""))) || "";

        if (!answer) {
            console.log("Grok API returned empty response:", json);
            return await King.sendMessage(chatId, { text: "⚠️ GROK-AI No response from API." });
        }

        // Split into WhatsApp-safe chunks
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
            const header = i === 0 ? `🤖 *Grok-ai Response:*\n\n` : "";
            // Edit the loading message for the first chunk
            if (i === 0 && loadingMessage) {
                await King.sendMessage(chatId, { text: header + chunks[i] });
            } else {
                await King.sendMessage(chatId, { text: header + chunks[i] });
            }
        }

    } catch (err) {
        console.error("Grok-ai command error:", err);
        const msg = err.name === "AbortError" 
            ? "⚠️ GROK-AI request timed out." 
            : "⚠️ Sorry, I couldn't connect to the Grok API right now.";
        await King.sendMessage(chatId, { text: msg });
    }
}
break;


case "metabcn-ai": {
if (!usedWithPrefix(m, command, prefix)) return;
    const chatId = m.key.remoteJid;
    // Use args if provided, otherwise use quoted message text (if any)
    let query = args.join(" ").trim();
    try {
        // If no args, check if user replied to a message and use that text
        if (
            !query &&
            m.message &&
            m.message.extendedTextMessage &&
            m.message.extendedTextMessage.contextInfo &&
            m.message.extendedTextMessage.contextInfo.quotedMessage
        ) {
            // quotedMessage can be different message types; prefer text
            const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
            if (quoted.conversation) query = quoted.conversation;
            else if (quoted.extendedTextMessage && quoted.extendedTextMessage.text)
                query = quoted.extendedTextMessage.text;
        }

        if (!query) {
            return await King.sendMessage(chatId, {
                text: "❗ Please provide a prompt. Usage: `.meta-ai <your question>` or reply to a message with `.meta-ai`",
            });
        }

        // Call API
        const res = await fetch(
            `https://apis.prexzyvilla.site/ai/meta-ai?text=${encodeURIComponent(query)}`,
            { method: "GET" }
        );
        if (!res.ok) {
            return await King.sendMessage(chatId, {
                text: `⚠️ Meta AI API returned HTTP ${res.status}`,
            });
        }

        const json = await res.json();

        // The API returns the text in json.data
        const answer =
            (json &&
                (typeof json.data === "string"
                    ? json.data
                    : json.data?.text || json.data?.result || "")) ||
            "";

        if (!answer) {
            return await King.sendMessage(chatId, {
                text: "⚠️ No response from Meta AI API.",
            });
        }

        // Split into safe-sized chunks for WhatsApp (adjust size if needed)
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
            const header = i === 0 ? `🤖 *Meta AI Response:*\n\n` : "";
            await King.sendMessage(chatId, { text: header + chunks[i] });
        }
    } catch (err) {
        console.error("meta command error:", err);
        await King.sendMessage(chatId, {
            text: "⚠️ Sorry, I couldn't connect to the Meta AI API right now.",
        });
    }
}
break;
case "qwen": {
if (!usedWithPrefix(m, command, prefix)) return;
    const chatId = m.key.remoteJid;

    // Extract query from args or quoted message
    let query = args.join(" ").trim();
    if (!query && m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quoted.conversation) query = quoted.conversation;
        else if (quoted.extendedTextMessage?.text) query = quoted.extendedTextMessage.text;
    }

    if (!query) {
        return await King.sendMessage(chatId, {
            text: "❗ Please provide a prompt.\n*Example:.qwen <your question>*"  });
    }

    try {
        // Send loading message
        const loadingMsg = await King.sendMessage(chatId, { text: "⏳ Contacting Qwen AI..." });

        // Call Qwen API
        const res = await fetch(`https://api.nexoracle.com/ai/gemini-1.5-flash?apikey=58abc73ae34c34784e&prompt=${encodeURIComponent(query)}`, { method: "GET" });
        if (!res.ok) {
            const text = await res.text();
            console.log("Qwen API error response:", text);
            return await King.sendMessage(chatId, { text: `⚠️ Qwen API returned HTTP ${res.status}` });
        }

        const json = await res.json();

        // Extract answer safely
        const answer = json?.data 
            ? (typeof json.data === "string" ? json.data : (json.data.text || json.data.result || "")) 
            : "";

        if (!answer) {
            console.log("Qwen API returned empty response:", json);
            return await King.sendMessage(chatId, { text: "⚠️ No response from Qwen API." });
        }

        // Delete loading message
        await King.sendMessage(chatId, { delete: loadingMsg.key });

        // Split long response into chunks for WhatsApp
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
            const header = i === 0 ? "🤖 *Qwen Response:*\n\n" : "";
            await King.sendMessage(chatId, { text: header + chunks[i] });
        }

    } catch (err) {
        console.error("qwen command error:", err);
        await King.sendMessage(chatId, { text: `⚠️ Sorry, I couldn't connect to the Qwen API right now.\n\nError: ${err.message}` });
    }
}
break;
case 'fb':
case 'fbdl':
case 'facebook':
 case 'fb': {   
if (!usedWithPrefix(m, command, prefix)) return;
        const path = require('path');
                const text = m.message?.conversation || m.message?.extendedTextMessage?.text;
        const url = text?.split(' ')?.slice(1)?.join(' ')?.trim();

        if (!url) {
          return m.reply("Please provide a Facebook video URL.\nExample: .fbdl https://www.facebook.com/...");
        }

        if (!url.includes('facebook.com')) {
          return m.reply("That is not a Facebook link.");
        }

        // Send initial loading reaction
        await King.sendMessage(m.chat, {
          react: { text: '⏳', key: m.key }
        });

        try {
          const response = await axios.get(`https://apis.prexzyvilla.site/download/facebook?url=${encodeURIComponent(url)}`);
          const data = response.data;

          if (!data || data.status !== 200 || !data.facebook || !data.facebook.sdVideo) {
            await King.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Send error reaction
            return reply("Sorry, the API didn't respond correctly. Please try again later!");
          }

          const fbvid = data.facebook.sdVideo;

          if (!fbvid) {
            await King.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Send error reaction
            return m.reply("Wrong Facebook data. Please ensure the video exists.");
          }

          const tmpDir = path.join(process.cwd(), 'tmp');
          if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
          }

          const tempFile = path.join(tmpDir, `fb_${Date.now()}.mp4`);

          const videoResponse = await axios({
            method: 'GET',
            url: fbvid,
            responseType: 'stream',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Range': 'bytes=0-',
              'Connection': 'keep-alive',
              'Referer': 'https://www.facebook.com/'
            }
          });

          const writer = fs.createWriteStream(tempFile);
          videoResponse.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
            King.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Send error reaction
            throw new Error('Failed to download video');
          }

          // Send success reaction before sending video
          await King.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

          await King.sendMessage(m.chat, {
            video: { url: tempFile },
            mimetype: "video/mp4",
            caption: `By Robin Xd ✅`
          }, { quoted: m });

          try {
            fs.unlinkSync(tempFile);
          } catch (err) {
            console.error('Error cleaning up temp file:', err);
          }

        } catch (error) {
          console.error('Error in Facebook command:', error);
          m.reply("An error occurred. API might be down. Error: " + error.message);
        }
    }
    break;
    case 'igdl':
case 'instagram':
case 'ig': {
if (!usedWithPrefix(m, command, prefix)) return;
  if (!text) return reply(
    "Provide a instagram media link\nExample: .igdl <link>"
  );

  try {
    const apiUrl = `https://delirius-apiofc.vercel.app/download/instagram?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) return reply("⚠️ Instagram API not reachable.");

    const json = await res.json();
    if (!json.status || !Array.isArray(json.data) || json.data.length === 0) {
      return reply("❌ Failed to fetch Instagram media.");
    }

    for (const media of json.data) {
      if (media.type === "video") {
        await King.sendMessage(m.chat, {
          video: { url: media.url },
          caption: `Url: ${text}\nInstagram Image Retrieved ✅`
        }, { quoted: m });
      } else if (media.type === "image") {
        await King.sendMessage(m.chat, {
          image: { url: media.url },
          caption: `Url: ${text}\nInstagram Image Retrieved ✅`
        }, { quoted: m });
      }
    }

  } catch (err) {
    console.error("Igdl Error", err);
    reply("Error downloading Instagram video");
  }
}
break;
case 'ghstalk': case 'githubstalk': {
if (!usedWithPrefix(m, command, prefix)) return;
    if (!q) return reply(`*Example ${prefix+command} TigonNz`);
    reply('*⌛ Stalking github repo...*'); 
    aj = await githubstalk.githubstalk(`${q}`);
    King.sendMessage(m.chat, { 
        image: { url: aj.profile_pic }, 
        caption: 
`*📦 GitHub Stalker*

💳 Username : ${aj.username}
🌉 Nickname : ${aj.nickname}
🧬 Bio : ${aj.bio}
🆔 Id : ${aj.id}
㊙️ Nodeid : ${aj.nodeId}
🔗 Url Profile : ${aj.profile_pic}
🖇️ Url Github : ${aj.url}
🔁 Type : ${aj.type}
👑 Admin : ${aj.admin}
💻 Company : ${aj.company}
🎐 Blog : ${aj.blog}
🌏 Location : ${aj.location}
📧 Email : ${aj.email}
⭐ Public Repo : ${aj.public_repo}
💻 Public Gists : ${aj.public_gists}
👥 Followers : ${aj.followers}
🗂️ Following : ${aj.following}
✍️ Created At : ${aj.created_at}
✏️ Updated At : ${aj.updated_at}` 
    }, { quoted: m });
}
break;
 // =============================================
//  TWEET  CASE HANDLER
// =============================================
case 'zuck':
case 'ronaldo':
case 'billgates':
case 'elonmusk':
case 'justinbieber':
case 'donaldtrump':
case 'joebiden':
case 'johnnysins':
case 'miakhalifa':
case 'therock':
case 'rihanna':
case 'taylorswift':
case 'tomcruise':
case 'tomholland':{
if (!usedWithPrefix(m, command, prefix)) return;
    await generateCelebrityTweet(command, args, from, m, King);
    }
    break;
 // =============================================
//  EPHOTO CASE HANDLER
// =============================================
case 'glitchtext':
case 'writetext':
case 'advancedglow':
case 'typographytext':
case 'pixelglitch':
case 'neonglitch':
case 'flagtext':
case 'flag3dtext':
case 'deletingtext':
case 'blackpinkstyle':
case 'glowingtext':
case 'underwatertext':
case 'logomaker':
case 'cartoonstyle':
case 'papercutstyle':
case 'watercolortext':
case 'effectclouds':
case 'blackpinklogo':
case 'gradienttext':
case 'summerbeach':
case 'luxurygold':
case 'multicoloredneon':
case 'sandsummer':
case 'galaxywallpaper':
case 'style1917':
case 'maKingeon':
case 'royaltext':
case 'freecreate':
case 'galaxystyle':
case 'lighteffects':{
if (!usedWithPrefix(m, command, prefix)) return;
    await generateEPPhoto(command, args, from, m, King);
    break;
}
 
default:
if (body.startsWith('<')) {
if (!isCreator) return;
function Return(sul) {
sat = JSON.stringify(sul, null, 2)
bang = util.format(sat)
if (sat == undefined) {
bang = util.format(sul)}
return m.reply(bang)}
try {
m.reply(util.format(eval(`(async () => { return ${body.slice(3)} })()`)))
} catch (e) {
m.reply(String(e))}}
if (body.startsWith('>')) {
if (!isCreator) return;
try {
let evaled = await eval(body.slice(2))
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await m.reply(evaled)
} catch (err) {
await m.reply(String(err))
}
}
if (body.startsWith('®')) {
if (!isCreator) return;
require("child_process").exec(body.slice(2), (err, stdout) => {
if (err) return m.reply(`${err}`)
if (stdout) return m.reply(stdout)
})
}
}
} catch (err) {
console.log(require("util").format(err));
}
}
let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
require('fs').unwatchFile(file)
console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
delete require.cache[file]
require(file)
})     