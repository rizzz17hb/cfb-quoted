import { request } from 'undici';
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'douyinv2',
    alias: ['dyv2', 'douyinhdv2'],
    category: 'download',
    async exec({ conn, m, text, args, usedPrefix, command }) {
        let url = text || (m.quoted ? m.quoted.text : args[0]);
        const fakeQuoted = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        if (!url) {
            // --- 1. REACT PAS LINK KOSONG ---
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });

            return conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `Masukkan link Douyin/TikTok!\nContoh: ${usedPrefix + command} https://v.douyin.com/xxx/` 
            }, { quoted: fakeQuoted });

        } 

        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            // 1. Ambil data dari API Tioo (Request ganti undici)
            const apiUrl = `https://backend1.tioo.eu.org/api/downloader/douyin?url=${encodeURIComponent(url)}`;
            const { statusCode, body } = await request(apiUrl);
            const res = await body.json();

            if (statusCode !== 200 || !res.status) throw new Error("Gagal memproses link.");

            const { title, links } = res.data;
            const videoUrl = links.length > 0 ? links[0].url : '';
            const quality = links.length > 0 ? links[0].quality : 'Standard';

            if (!videoUrl) throw new Error("Video tidak ditemukan.");

            // 3. Download ke Buffer biar ga error (Request ganti undici)
            const videoRes = await request(videoUrl);
            const videoBuffer = Buffer.from(await videoRes.body.arrayBuffer());

            // 4. Siapin Media untuk Interactive Message
            const media = await prepareWAMessageMedia({ 
                video: videoBuffer 
            }, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                header: {
                    hasMediaAttachment: true,
                    videoMessage: media.videoMessage
                },
                body: { 
                    text: `🎬 *DOUYIN DOWNLOADER V2*\n\n` +
                          `📝 *Judul:* ${title || 'No Title'}\n` +
                          `✨ *Kualitas:* ${quality}\n`
                },
                footer: { text: global.footer },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "🎵 ᗩᗰᗷIᒪ ᗩᑌᗪIO", 
                            id: `.douyinaudio ${url}` 
                        })
                    }]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id, quoted: fakeQuoted });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\n Alasan: ${e.message}` 
            }, { quoted: fail });
        }
    }
};