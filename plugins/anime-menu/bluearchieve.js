import fetch from 'node-fetch';
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'bluearchive',
    alias: ['ba', 'gachaba'],
    category: 'anime',
    isOwner: false,
    exec: async ({ conn, m, command, usedPrefix }) => {
        
        // --- 1. REACT: Mulai Proses ---
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
            // 2. Ambil Data Gambar
            const apiUrl = 'https://api.siputzx.my.id/api/r/blue-archive';
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("API gagal mengambil data waifu.");

            const resultBuffer = await response.buffer();
            if (resultBuffer.length < 1000) throw new Error("Gambar waifu korup.");

            // 3. Prepare Media buat Header (Sesuai logic TikTok Master)
            const media = await prepareWAMessageMedia({ image: resultBuffer }, { upload: conn.waUploadToServer });

            // 4. Struktur Interactive Message
            const interactiveMessage = {
                header: {
                    title: "ＢＬＵＥ ＡＲＣＨＩＶＥ ✅",
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                },
                body: { text: "Nih waifu pilihan Castorice. Cantik banget kan? ❤️💦" },
                footer: { text: "Castorice Assistant • Blue Archive" },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "🔁 ᑎE᙭T ᗯᗩIᖴᑌ", 
                            id: `${usedPrefix}${command}` 
                        })
                    }]
                }
            };

            // 5. Kirim via relayMessage (Logic Master)
            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id, quoted: fake });
            
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

            // --- 6. REACT: Sukses ---
            await m.react('✅');

        } catch (e) {
            console.error('BlueArchive Error:', e);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                image: { url: global.anime },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nAlasan: ❌${e.message}`
            }, { quoted: fail });
        }
    }
};