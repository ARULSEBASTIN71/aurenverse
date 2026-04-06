# AurenVerse Website

Simple HTML + Express + MongoDB website.

---

## RUN LOCALLY

### Step 1 — Install
```
npm install
```

### Step 2 — Create .env file
Copy .env.example to .env and fill in your values:
```
copy .env.example .env
```

### Step 3 — Start server
```
npm start
```

Open browser → http://localhost:3000

---

## DEPLOY TO RENDER (free hosting — easier than Vercel for Express)

1. Push to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Set Build Command: `npm install`
5. Set Start Command: `node server.js`
6. Add all environment variables from .env
7. Deploy!

---

## ENVIRONMENT VARIABLES NEEDED

| Variable | Where to get |
|----------|-------------|
| MONGODB_URI | https://mongodb.com/atlas (free) |
| SMTP_PASS | Gmail App Password (Google Account → Security → App Passwords) |
| WHATSAPP_APIKEY | https://callmebot.com (free) |

---

## HOW LEADS WORK
1. Someone fills the form on your website
2. Lead saved to MongoDB database
3. You get a WhatsApp message instantly
4. You get an email with full details + WhatsApp reply button
