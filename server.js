require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const cors = require('cors')
const path = require('path')
const fetch = require('node-fetch')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// ── MongoDB Lead Schema ───────────────────────────────────────────
const leadSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  businessName: { type: String, default: '' },
  phone:        { type: String, required: true },
  service:      { type: String, default: 'Website Development' },
  message:      { type: String, default: '' },
  createdAt:    { type: Date, default: Date.now }
})
const Lead = mongoose.model('Lead', leadSchema)

// ── Connect MongoDB ───────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err.message))

// ── Send Email ────────────────────────────────────────────────────
async function sendEmail(data) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  })

  await transporter.sendMail({
    from: `"AurenVerse Leads" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    subject: `🔥 New Lead: ${data.name} — ${data.service}`,
    html: `
      <div style="font-family:sans-serif;max-width:580px;margin:0 auto;border:1px solid #222;background:#0a0a0a;color:#fff">
        <div style="background:#e01c1c;padding:20px 28px">
          <h2 style="margin:0;font-size:20px;letter-spacing:2px">🔥 NEW LEAD — AURENVERSE</h2>
        </div>
        <div style="padding:28px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#888;width:130px">Name</td><td style="padding:10px 0;border-bottom:1px solid #222;font-weight:600">${data.name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#888">Business</td><td style="padding:10px 0;border-bottom:1px solid #222">${data.businessName || '—'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#888">Phone</td><td style="padding:10px 0;border-bottom:1px solid #222"><a href="tel:${data.phone}" style="color:#e01c1c">${data.phone}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#888">Service</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#e01c1c;font-weight:700">${data.service}</td></tr>
            <tr><td style="padding:10px 0;color:#888;vertical-align:top">Message</td><td style="padding:10px 0">${data.message || '—'}</td></tr>
          </table>
          <div style="margin-top:20px;background:#161616;padding:14px;border-left:3px solid #e01c1c">
            <p style="margin:0;font-size:12px;color:#888">Received: ${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST</p>
          </div>
          <a href="https://wa.me/${data.phone}" style="display:inline-block;margin-top:18px;background:#25D366;color:#fff;padding:11px 22px;text-decoration:none;font-weight:700;border-radius:4px">💬 Reply on WhatsApp</a>
        </div>
      </div>
    `
  })
}
// ── Send Telegram ─────────────────────────────────────────────────────────────
async function sendTelegram(data) {
  const text = `🔥 *NEW LEAD - AurenVerse*\n\n👤 *Name:* ${data.name}\n🏢 *Business:* ${data.businessName || '—'}\n📱 *Phone:* ${data.phone}\n🎯 *Service:* ${data.service}\n💬 *Message:* ${data.message || '—'}\n\n⏰ ${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST`
  const url = `https://api.telegram.org/bot8228727506:AAE30MTYmVkgsE5r8DpLRRNZJPgx7meB3yo/sendMessage?chat_id=1225237591&text=${encodeURIComponent(text)}&parse_mode=Markdown`
  await fetch(url)
}

// ── Send WhatsApp ─────────────────────────────────────────────────
async function sendWhatsApp(data) {
  const text = `🔥 *NEW LEAD - AurenVerse*\n\n👤 *Name:* ${data.name}\n🏢 *Business:* ${data.businessName || '—'}\n📱 *Phone:* ${data.phone}\n🎯 *Service:* ${data.service}\n💬 *Message:* ${data.message || '—'}\n\n⏰ ${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST`
  const url = `https://api.callmebot.com/whatsapp.php?phone=${process.env.WHATSAPP_PHONE}&text=${encodeURIComponent(text)}&apikey=${process.env.WHATSAPP_APIKEY}`
  await fetch(url)
}

// ── Contact Form API ──────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { name, businessName, phone, service, message } = req.body
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' })

    // 1. Save to MongoDB
    await Lead.create({ name, businessName, phone, service, message })

    // 2. Send Email
    try { await sendEmail({ name, businessName, phone, service, message }) }
    catch(e) { console.log('Email failed:', e.message) }

    // 3. Send Telegram
    try { await sendTelegram({ name, businessName, phone, service, message }) }
    catch(e) { console.log('Telegram failed:', e.message) }

    // 3. Send WhatsApp
    try { await sendWhatsApp({ name, businessName, phone, service, message }) }
    catch(e) { console.log('WhatsApp failed:', e.message) }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Serve HTML for all routes ─────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 AurenVerse running at http://localhost:${PORT}`))
// Keep server awake
const http = require('http')
setInterval(() => {
  http.get('http://localhost:3000', () => {
    console.log('Server kept awake')
  }).on('error', () => {})
}, 14 * 60 * 1000)