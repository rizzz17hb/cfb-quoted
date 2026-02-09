import fetch from 'node-fetch'
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

export default {
    name: 'waifu',
    alias: ['waifu'],
    category: 'anime',
    exec: async ({ conn, m, usedPrefix, command }) => {
        
        // 1. REACT: Proses dimulai
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        try {
            // 2. Ambil URL Gambar dari API
            let res = await fetch('https://api.waifu.pics/sfw/waifu')
            if (!res.ok) throw new Error("Server API Waifu sedang sibuk.")
            let json = await res.json()
            let imgUrl = json.url

            // 3. Ambil Buffer Gambar & Persiapkan Media Header
            let imgRes = await fetch(imgUrl)
            let buffer = await imgRes.buffer()
            const media = await prepareWAMessageMedia({ image: buffer }, { upload: conn.waUploadToServer })

            // 4. Struktur Interactive Message (Satu Tombol: NEXT)
            const interactiveMessage = {
                header: {
                    title: "ＷＡＩＦＵ  ＧＡＣＨＡ ✨",
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                },
                body: { text: `Nih waifu pilihan Castorice buat  @${m.sender.split('@')[0]}. Cantik kan? ❤️` },
                footer: { text: global.footer },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ 
                                display_text: "🔁 ᑎE᙭T ᗯᗩIᖴᑌ", 
                                id: `${usedPrefix}${command}` 
                            })
                        }
                    ]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id, quoted: fake });
            
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            
            // 5. REACT: Sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e)
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            // Error Style Master dengan Image
            return conn.sendMessage(m.chat, { 
                image: { url: global.anime },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\n\nAlasan: ${e.message}` 
            }, { quoted: fail });
        }
    }
}