import axios from 'axios'
import * as cheerio from 'cheerio' // Perbaikan import di sini Master
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

async function animequote() {
  try {
    const page = Math.floor(Math.random() * 184)
    const { data } = await axios.get('https://otakotaku.com/quote/feed/' + page)
    const $ = cheerio.load(data)
    const links = $('div.kotodama-list').map((i, el) => $(el).find('a.kuroi').attr('href')).get()
    const url = links[Math.floor(Math.random() * links.length)]

    const { data: quotePage } = await axios.get(url)
    const $q = cheerio.load(quotePage)

    return {
      char: $q('.char-info .tebal a[href*="/character/"]').text().trim(),
      anime: $q('.char-info a[href*="/anime/"]').text().trim(),
      episode: $q('.char-info span.meta').text().trim().replace('- ', ''),
      quote: $q('.post-content blockquote p').text().trim(),
      image: $q('.post-content img').attr('src')
    }
  } catch (e) {
    return null
  }
}

export default {
    name: 'animequote',
    alias: ['quoteanime', 'kataanime'],
    category: 'anime',
    exec: async ({ conn, m, usedPrefix, command }) => {
        await conn.sendMessage(m.chat, { react: { text: '📜', key: m.key } });
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        try {
            const res = await animequote()
            if (!res) throw new Error("Gagal memuat data dari pusat.")

            const media = await prepareWAMessageMedia({ image: { url: res.image || global.anime } }, { upload: conn.waUploadToServer })

            // --- Luxury Typography Layout ---
            const txt = `*“ ${res.quote} ”*\n\n` +
                        `〢 *Character:* _${res.char}_\n` +
                        `〢 *Source:* _${res.anime}_\n` +
                        `〢 *Archive:* _${res.episode}_`

            const interactiveMessage = {
                header: {
                    title: "ＡＮＩＭＥ  ＱＵＯＴＥＳ", 
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                },
                body: { text: txt },
                footer: { text: global.footer },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "ᗩᑎOTᕼEᖇ ᑫᑌOTE", 
                            id: `${usedPrefix}${command}` 
                        })
                    }]
                }
            }

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id, quoted: fake })
            
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error(e)
            return conn.sendMessage(m.chat, { 
                image: { url: global.anime },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nAlasan: ${e.message}` 
            }, { quoted: fail })
        }
    }
}