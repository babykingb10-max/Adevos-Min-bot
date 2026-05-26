# Adevos Min-Bot V2

WhatsApp & Telegram automation bot with web interface.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Setup web interface
```bash
mkdir -p public
# Copy adevos-v3.html → public/index.html
cp adevos-v3.html public/index.html
```

### 4. Run locally
```bash
# Start web server + API
npm start

# Start Telegram bot (separate terminal)
npm run bot
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/status | Bot status & uptime |
| POST | /api/pair | Generate pairing code |
| DELETE | /api/delpair | Delete a session |
| GET | /api/sessions | List sessions (admin) |
| POST | /api/clean | Clean invalid sessions (admin) |
| POST | /api/autoload | Run autoload (admin) |
| GET | /health | Health check |

### Admin endpoints
Add header: `x-admin-token: your_token`

### Pair example
```bash
curl -X POST https://yourapp.com/api/pair \
  -H "Content-Type: application/json" \
  -d '{"number": "255712345678", "server": 1}'
```

## Deploy to Heroku

```bash
heroku create your-app-name
heroku config:set BOT_TOKEN=your_token
heroku config:set ADMIN_TOKEN=your_password
heroku config:set SESSION_LIMIT=15
git push heroku main
```

## Admin Password
Default: `adevos2025`  
Change via `ADMIN_TOKEN` in `.env`

