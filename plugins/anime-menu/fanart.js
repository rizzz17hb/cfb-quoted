import fetch from 'node-fetch';
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'fanart',
    alias: ['fart'],
    category: 'anime',
    isOwner: false,
    exec: async ({ conn, m, command, usedPrefix }) => {
        
        // --- 1. REACT: Mulai Proses ---
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });
        const fakeQuoted = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        try {
            // 2. Ambil URL Fanart dari waifu.pics
            const res = await fetch(`https://api.waifu.pics/sfw/waifu`);
            const data = await res.json();
            
            if (!data.url) throw new Error("Gagal ambil data waifu");

            // 3. Download Buffer & Prepare Media buat Header
            const imageBuffer = await (await fetch(data.url)).buffer();
            const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });

            // 4. Struktur Interactive Message ala Master
            const interactiveMessage = {
                header: {
                    title: "ＡＮＩＭＥ ＦＡＮＡＲＴ ✅",
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                },
                body: { text: "Nih, waifu pilihan Castorice buat nemenin hari ini. Gimana, seleranya bagus kan? ❤️" },
                footer: { text: "Castorice Assistant • Fanart" },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "🔁 ᑕᗩᖇI ᒪᗩGI", 
                            id: `${usedPrefix}${command}` 
                        })
                    }]
                }
            };

            // 5. Kirim via relayMessage (Logic Paten Master)
            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id, quoted: fakeQuoted });
            
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

            // --- 6. REACT: Sukses ---
            await m.react('✅');

        } catch (e) {
            console.error('Fanart Error:', e);
            await m.react('❌');

            // Fallback error pake image global
            await conn.sendMessage(m.chat, {
                image: { url: global.anime },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nAlasan: ❌${e.message}`
            }, { quoted: fail });
        }
    }
};