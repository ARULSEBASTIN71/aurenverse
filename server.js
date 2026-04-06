require('dotenv').config()
const express = require('express')
const path = require('path')

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 AurenVerse running at http://localhost:${PORT}`))

// Keep server awake
const http = require('http')
setInterval(() => {
  http.get('http://localhost:3000', () => {}).on('error', () => {})
}, 14 * 60 * 1000)