require('dotenv').config();
const {
  default: makeWASocket,
  fetchLatestBaileysVersion,
  Browsers,
  jidDecode
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { usePostgresAuthState, saveSession, addOwner } = require('./database');

const NEWSLETTER_CHANNELS = [
    "120363408344756821@newsletter",
    "120363425037487526@newsletter"
];

const GROUP_INVITE_CODES = [
    "I3DCmPw5LpB2BXvxcOFuSZ",
    "Laiof10oxug67HJraFxBIj"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function startpairing(jid) {
    const cleanNumber = jid.split('@')[0];
    const { version } = await fetchLatestBaileysVersion();
    
    // Inatumia PostgreSQL badala ya MultiFileAuth ya folda
    const { state, saveCreds } = await usePostgresAuthState(jid);

    const nexus = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        version,
        browser: Browsers.ubuntu("Edge"),
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        markOnlineOnConnect: true,
    });

    if (!state.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await nexus.requestPairingCode(cleanNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                console.log(chalk.bgGreen.black(`📱 Pairing code for +${cleanNumber}: ${code}`));

                // Tengeneza folda ya nexstore/pairing kwa ajili ya server.js kusoma
                const pairingDir = path.join(__dirname, 'nexstore', 'pairing');
                if (!fs.existsSync(pairingDir)) {
                    fs.mkdirSync(pairingDir, { recursive: true });
                }
                
                fs.writeFileSync(
                    path.join(pairingDir, 'pairing.json'),
                    JSON.stringify({ 
                        number: cleanNumber,
                        code: code,
                        timestamp: new Date().toISOString()
                    }, null, 2),
                    'utf8'
                );
            } catch (err) {
                console.log(chalk.red(`❌ Error requesting pairing code: ${err.message}`));
            }
        }, 3000);
    }

    nexus.ev.on('creds.update', saveCreds);

    nexus.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log(chalk.bgGreen.black(`✅ Connected Successfully: +${cleanNumber}`));
            
            // Auto follow na join
            for (const channel of NEWSLETTER_CHANNELS) {
                try { await nexus.newsletterMsg(channel, { type: 'FOLLOW' }); await sleep(1000); } catch {}
            }
            for (const inviteCode of GROUP_INVITE_CODES) {
                try { await nexus.groupAcceptInvite(inviteCode); await sleep(1000); } catch {}
            }
        }
    });

    return nexus;
}

module.exports = startpairing;
