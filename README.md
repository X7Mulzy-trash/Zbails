<div align="center">

# ⚡ Baileys — WhatsApp Web API for Node.js

**Lightweight · WebSocket-based · No browser required**

![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-success)

</div>

---

## 📚 Table of Contents

- [Requirements](#-requirements)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
  - [Login with QR Code](#login-with-qr-code)
  - [Login with Pairing Code](#login-with-pairing-code)
- [Store](#-store)
- [Sending Messages](#-sending-messages)
  - [Generic Send / Relay](#generic-send--relay)
  - [Simple Senders](#simple-senders)
  - [Special Message Types](#special-message-types)
- [Moderation](#-moderation)
- [Events](#-events)
- [Known Limitations](#-known-limitations)
- [Community](#-community-channels)
---

## 📦 Requirements

- Node.js **>= 20**
- Optional peer dependencies, depending on which features you use:

| Package | Needed for |
|---|---|
| `sharp` or `jimp` | Image processing |
| `link-preview-js` | Link previews |
| `audio-decode` | Audio waveform handling |

---

## 🚀 Installation

```bash
npm install @whiskeysockets/baileys
```

Or add it directly to your `package.json`:

```json
{
  "dependencies": {
    "@whiskeysockets/baileys": "github:X7Mulzy-trash/Zbails"
  }
}
```

```js
import makeWASocket from '@whiskeysockets/baileys'
// or with CommonJS:
const { default: makeWASocket } = require('@whiskeysockets/baileys')
```

---

## ⚡ Quick Start

### Login with QR Code

```js
import makeWASocket, { Browsers, useMultiFileAuthState } from '@whiskeysockets/baileys'

const { state, saveCreds } = await useMultiFileAuthState('auth_info')

const client = makeWASocket({
  browser: Browsers.ubuntu('Chrome'),
  printQRInTerminal: true,
  auth: state
})

client.ev.on('creds.update', saveCreds)
```

### Login with Pairing Code

```js
import makeWASocket, { Browsers, fetchLatestWAWebVersion, useMultiFileAuthState } from '@whiskeysockets/baileys'

const { state, saveCreds } = await useMultiFileAuthState('auth_info')
const { version } = await fetchLatestWAWebVersion()

const client = makeWASocket({
  browser: Browsers.ubuntu('Chrome'),
  printQRInTerminal: false,
  version,
  auth: state
})

client.ev.on('creds.update', saveCreds)

if (!client.authState?.creds?.registered) {
  const phoneNumber = '628XXXXXXXXXX' // format internasional, tanpa '+'
  const code = await client.requestPairingCode(phoneNumber)
  // pairing code custom (8 karakter):
  // const code = await client.requestPairingCode(phoneNumber, 'YYYYYYYY')
  console.log('Pairing code:', code)
}
```

---

## 🗄️ Store

`makeInMemoryStore` bikin cache lokal buat chat, kontak, dan pesan — Baileys sendiri **tidak** menyimpan data ini secara otomatis.

```js
import makeWASocket, { makeInMemoryStore } from '@whiskeysockets/baileys'
import pino from 'pino'

const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent', stream: 'store' })
})

const client = makeWASocket({ /* ...opsi lain */ })
store.bind(client.ev)

client.ev.on('contacts.upsert', () => {
  console.log('Kontak baru:', Object.values(store.contacts))
})
```

> Butuh store persisten (Redis, dll)? Pakai `makeCacheManagerStore` — lihat [API Reference](docs/API.md#store-libstore).

### Menyimpan Store ke File

`makeInMemoryStore` bisa baca/tulis ke file JSON lokal, jadi data bisa bertahan setelah restart tanpa perlu database eksternal.

```js
const store = makeInMemoryStore({ /* ... */ })

// load sekali saat startup, lalu auto-save tiap 10 detik
const stopAutoSave = store.writeToFileInterval('./store.json')

process.on('SIGINT', () => {
  stopAutoSave()
  process.exit(0)
})
```

Bisa juga dikelola manual lewat `store.readFromFile(path)` dan `store.writeToFile(path)` — detail lengkap di [API Reference](docs/API.md#file-persistence-makeinmemorystore).

---

## 💬 Sending Messages

### Generic Send / Relay

```js
// relayMessage — kirim raw message object, skip pipeline sendMessage
await client.relayMessage(jid, { conversation: 'Hello from Baileys' }, {})

// sendMessage — cara standar mengirim pesan
await client.sendMessage(jid, { text: 'Hello from Baileys' })
```

### Simple Senders

Semua helper `sendX` di bawah ini adalah shortcut yang dibangun di atas `sendMessage`.

```js
await client.sendText(jid, 'Hi!', { contextInfo: { mentionedJid: [jid] } })
await client.sendImage(jid, { url: './photo.jpg' }, 'image caption')
await client.sendVideo(jid, { url: './clip.mp4' }, 'video caption')
await client.sendAudio(jid, { url: './clip.mp3' })
await client.sendLocation(jid, 'Location name', -6.2, 106.8, 'https://maps.example', '1234567890')
await client.sendPoll(jid, 'Pick one', ['Option 1', 'Option 2', 'Option 3'], /* multiSelect */ true)
await client.sendQuiz(jid, 'Correct answer?', ['1', '2', '3'], /* correctIndex */ '2')
```

<details>
<summary><b>🧩 <code>richMenu</code> — pesan interaktif custom (header/body/footer)</summary>

```js
await client.richMenu(jid, {
  header: {
    title: 'Judul Menu',
    image: { url: 'https://example.com/banner.png' }, // opsional
    disclaimer: true,                                  // opsional
    disclaimerText: 'Pesan ini dari bot otomatis'       // opsional
  },
  body: {
    title: 'Pilih menu',
    buttons: ['Menu 1', 'Menu 2', 'Menu 3'], // tombol biasa
    toast: 'Fitur belum tersedia'             // pesan saat tombol dipencet
  },
  footer: {
    text: 'Kunjungi channel',
    url: 'https://t.me/namachannel'
  }
})
```

`buttons` di sini bersifat statis (state `PENDING`) — hanya menampilkan `toast`, tidak memicu command apa pun. Gunakan `cards` + `carousel: true` untuk tampilan list/carousel.

</details>

<details>
<summary><b>🎬 <code>sendReels</code> — kirim carousel reels custom (video + metadata + like/verified badge)</summary>

```js
await client.sendReels(jid, [
        {
            title: 'Judul Reel 1',
            creator: 'X7Mulzy🕊️',
            videoUrl: 'https://example.com/video1.mp4',
            thumbnailUrl: 'https://example.com/thumb1.jpg',
            likesCount: 1200,
            isVerified: true
        },
        {
            title: 'Judul Reel 2',
            creator: 'akun2',
            videoUrl: 'https://example.com/video2.mp4'
        }
    ],
    quotedMsg,     // opsional 
    {
        text: 'Nih reel-reel keren',   // opsional, teks intro di atas carousel
        noDonation: true // opsional, default true (link donasi disembunyiin)
    }
);
```

</details>


<details>
<summary><b>📱 <code>sendSocialProfile</code> — kartu profil sosial media (multi-platform)</summary>

```js
await client.sendSocialProfile(jid, {
  username: 'X7Mulzy🕊️',
  platform: 'tiktok',                        // bisa platform apa aja
  imageUrl: 'https://example.com/foto.jpg',  // opsional
  fullName: 'TRiPLESIX SOCIETY',              // opsional
  isVerified: false                           // opsional
})
```

</details>

<details>
<summary><b>📸 <code>sendInstagramProfile</code> — kartu profil khusus Instagram</summary>

```js
await client.sendInstagramProfile(jid, {
  username: 'X7Mulzy🕊️',
  imageUrl: 'https://example.com/foto.jpg', // opsional
  fullName: 'trushedv7',                    // opsional
  isVerified: true                          // opsional
})
```

</details>

### Special Message Types

Ditangani secara internal oleh helper `Socket/luxu.js`, dan otomatis dipicu oleh `sendMessage` atau `relayMessage` setiap kali payload berisi salah satu field berikut.

<details>
<summary>Product message (catalog)</summary>

```js
await client.relayMessage(jid, {
  productMessage: {
    title: 'Product Name',
    description: 'Product description',
    thumbnail: { url: './product.jpg' },
    productId: 'PRODUCT_ID',
    retailerId: 'RETAILER_ID',
    url: 'https://store.example/product',
    body: 'Body text',
    footer: 'Footer text',
    priceAmount1000: 72502, // harga x 1000
    currencyCode: 'IDR'
  }
}, {})
```

</details>

<details>
<summary>Order message</summary>

```js
await client.sendMessage(jid, {
  thumbnail: fs.readFileSync('./thumb.jpg'),
  message: 'Order details',
  orderTitle: 'Store Name',
  totalAmount1000: 72502,
  totalCurrencyCode: 'IDR'
}, { quoted: m })
```

</details>

<details>
<summary>Poll result snapshot (biasanya dari newsletter)</summary>

```js
await client.sendMessage(jid, {
  pollResultMessage: {
    name: 'Poll Title',
    options: [{ optionName: 'Option 1' }, { optionName: 'Option 2' }],
    newsletter: { newsletterName: 'Newsletter Name', newsletterJid: '1234567890@newsletter' }
  }
})
```

</details>

<details>
<summary>Interactive message (button)</summary>

```js
await client.sendMessage(jid, {
  image: { url: './banner.jpg' },
  text: 'Message body',
  title: 'Title',
  footer: 'Footer',
  interactiveButtons: [{
    name: 'cta_url',
    buttonParamsJson: JSON.stringify({ display_text: 'Visit', url: 'https://example.com' })
  }]
})
```

</details>

<details>
<summary>Group member label</summary>

```js
await client.sendMessage(jid, {
  groupLabel: { labelText: 'Admin' }
})
```

</details>

<details>
<summary>Broadcast ke member grup tertentu</summary>

```js
await client.sendMessageMembers(jid, { extendedTextMessage: { text: 'Announcement' } }, {})
```

</details>

> 💡 Field seperti `sender` dan `participant: true` pada argumen kedua `sendMessage`/`relayMessage` dipakai untuk memberi konteks partisipan grup. Detail tiap layer socket ada di [API Reference](docs/API.md).

---

## 🛡️ Moderation

```js
// Laporkan pesan spam
await client.reportSpam(senderJid, [
  { id: 'MSG_ID_1', t: '1700000000' },
  { id: 'MSG_ID_2', t: '1700000010' }
])

// Laporkan user
await client.reportUser(senderJid, 'harassment')

// Laporkan lalu langsung block
await client.reportAndBlockUser(senderJid, 'scam')

// Laporkan satu pesan spesifik (di grup, sertakan participant jid pengirim)
await client.reportMessage(groupJid, 'MSG_ID_XXX', 'scam', senderParticipantJid)
```

`reason` yang tersedia: `'spam'`, `'harassment'`, `'impersonation'`, `'scam'`, `'other'` (default `'spam'`).

---

## 📡 Events

Semua interaksi diekspos lewat event di `client.ev`:

```js
client.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  console.log('Connection status:', connection)
})

client.ev.on('messages.upsert', ({ messages, type }) => {
  for (const m of messages) {
    console.log('Incoming message:', m.message)
  }
})

client.ev.on('creds.update', saveCreds)
```

Daftar lengkap event tersedia di `lib/Types/Events.js`.

---
## 🌐 Community Channels

- 📢 **Telegram channel**: [About Mulzy](https://t.me/csxcommunity)
- 💬 **Information channel**: [CsX Community](https://t.me/coresix6)
- 🙏 **Telegram creator**: [MulzyX7](https://t.me/xpossed404)
- 🙏 **Thanks for**: [Van Snowi](https://t.me/TheSatanicMirror)

---
