# 🤖 Adevos Min-Bot

WhatsApp + Telegram automation bot powered by MongoDB Atlas + Render.

---

## 📁 Project Structure

```
adevos-min-bot/          ← Bot repo (this repo)
├── db.js                ← MongoDB connection, schemas, models, cleanup
├── sessionStore.js      ← Session storage (replaces disk files)
├── pair.js              ← WhatsApp pairing manager
├── autoload.js          ← Auto-load sessions on startup
├── bot.js               ← Telegram bot (main entry point)
├── case.js              ← WhatsApp commands (unchanged)
├── index.js             ← WhatsApp entry point (if used separately)
├── setting/config.js    ← Global bot config
├── allfunc/             ← Helper functions
├── .env.example         ← Environment variables template
├── .gitignore           ← Files excluded from GitHub
└── render.yaml          ← Render deployment config

adevosminbot/            ← Website repo (separate)
├── server.js            ← Website backend API
├── index.html           ← Public website with live stats
├── admin.html           ← Admin panel
└── package.json         ← Website dependencies
```

---

## 🚀 Setup Guide

### Step 1 — MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free account
2. Create a new **Project** → name it `adevosminbot`
3. Create a **Cluster** → choose free **M0 tier** (512MB)
4. Go to **Database Access** → Add new user → set username + password
5. Go to **Network Access** → Add IP Address → enter `0.0.0.0/0` (allows Render)
6. Go to **Connect** → **Drivers** → copy the URI

Your URI looks like:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/adevosminbot
```

MongoDB will automatically create these collections:
- `sessions` — WhatsApp session data
- `pairings` — Temporary pairing codes
- `requests` — Pairing requests
- `users` — User records
- `blocked` — Blocked numbers
- `serverstats` — Server health data

---

### Step 2 — Telegram Bot Token

1. Open Telegram → search `@BotFather`
2. Send `/newbot` → follow the prompts
3. Copy the token (looks like `1234567890:ABCdefGHI...`)
4. Get your Telegram user ID from `@userinfobot`

---

### Step 3 — GitHub Repo

```bash
# Create a new repo on GitHub, then:
git init
git add .
git commit -m "Initial commit — Adevos Min-Bot v2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/adevos-min-bot.git
git push -u origin main
```

> ⚠️ Make sure `.env` is listed in `.gitignore` before pushing.

---

### Step 4 — Render Deployment (Bot)

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your bot GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node bot.js`
5. Go to **Environment** tab → Add these variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | your Atlas URI |
| `BOT_TOKEN` | your Telegram bot token |
| `ADMIN_IDS` | your Telegram user ID |
| `SERVER_NAME` | `Main Server` |
| `MAX_CONNECTIONS` | `100` |
| `ADMIN_USERNAME` | `Adevos` |
| `ADMIN_PASSWORD` | strong password |
| `JWT_SECRET` | random 32+ char string |

6. Click **Create Web Service**

---

### Step 5 — Render Deployment (Website)

1. Create another Web Service on Render
2. Connect the website GitHub repo (`adevosminbot`)
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add these env variables (same MongoDB URI):

| Key | Value |
|-----|-------|
| `MONGODB_URI` | same as bot |
| `ADMIN_USERNAME` | same as bot |
| `ADMIN_PASSWORD` | same as bot |
| `JWT_SECRET` | same as bot |
| `SERVER_NAME` | `Main Server` |
| `MAX_CONNECTIONS` | `100` |
| `TG_BOT_URL` | `https://t.me/your_bot` |

---

## 🗄️ How Session Storage Works

```
Old system (disk):                 New system (MongoDB):
─────────────────                  ──────────────────────────────────
nexstore/pairing/                  sessions collection
  255712345678@s.whatsapp.net/     {
    creds.json              →        sessionId: "255...@s.whatsapp.net",
    app-state-sync-key-*.json        creds: { ... },
    sender-key-*.json                keys: { ... },
    pre-key-*.json                   isActive: true,
    ...                              isRegistered: true,
  }                                  lastSeen: Date,
                                     expiresAt: Date  ← auto-deleted by TTL
                                   }
```

**Key benefit:** Sessions survive Render restarts. The bot reconnects automatically from MongoDB on startup without any user needing to re-pair.

---

## 🧹 Automatic Session Cleanup

MongoDB TTL indexes handle cleanup automatically in the background:

| Collection | Auto-deleted after |
|-----------|-------------------|
| `sessions` (inactive) | 30 days of no activity |
| `pairings` (codes) | 1 hour |
| `requests` | 7 days |

Manual cleanup:
```
/clean              ← Telegram command (admin only) - deletes dead sessions
/listpair confirm   ← List all registered sessions
/delpair 255xxx     ← Delete one specific session
```

Or via admin panel: **Sessions tab** → **Clean Dead** button.

---

## ⚡ Render Free Tier Notes

- Free services spin down after 15 minutes of inactivity
- Sessions are **not lost** on spin-down (they live in MongoDB)
- Bot reconnects all sessions automatically on wake-up via `autoload.js`
- To prevent spin-down: use [UptimeRobot](https://uptimerobot.com) to ping `/health` every 14 minutes (free)
- `MAX_CONNECTIONS=100` is safe for free tier (512MB RAM)

---

## 🔧 Adding New Commands

**WhatsApp commands** → edit `case.js` only:
```javascript
case 'mycommand': {
    if (!usedWithPrefix(m, command, prefix)) return;
    reply('Hello from new command!');
    break;
}
```

**Telegram commands** → edit `bot.js` only:
```javascript
bot.onText(/\/mycommand/, requireMembership(async (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello from Telegram!');
}));
```

Neither `db.js`, `sessionStore.js`, `pair.js` nor `autoload.js` need changes.

---

## 🆘 Troubleshooting

**Sessions not loading after restart?**
- Check `MONGODB_URI` is correct in Render env vars
- Run `/autoload confirm` in your Telegram bot

**"Server is full" error?**
- Run `/clean` in Telegram bot to remove dead sessions
- Or increase `MAX_CONNECTIONS` in env vars

**MongoDB connection refused?**
- Make sure `0.0.0.0/0` is added to MongoDB Atlas Network Access
- Double-check username and password in the URI (special chars need URL encoding)

**Pairing code not received?**
- Check Render logs for errors
- Try `/delpair <number>` then `/pair <number>` again

---

## 📊 Admin Panel Features

| Tab | What you can do |
|-----|----------------|
| Dashboard | View total users, active sessions, today's pairings, capacity bar |
| Server Overview | Server health, paired counts by source (website/telegram/active) |
| Sessions | List all WhatsApp sessions, delete individual sessions, clean dead ones |
| Users | Search users, block, delete |
| Blocked Numbers | Add/remove blocked numbers |
| Analytics | 7-day pairing chart |


