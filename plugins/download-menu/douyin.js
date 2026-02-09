import axios from "axios";
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'douyin',
    alias: ['dy', 'douyindl'],
    category: 'download',
    async exec({ conn, m, text, args, usedPrefix, command }) {
        let url = text || (m.quoted ? m.quoted.text : args[0]);
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };
        
        if (!url) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `⚠️ Masukkan link Douyin!\nContoh: ${usedPrefix + command} https://v.douyin.com/xxx/` 
            }, { quoted: fail });
        }

        // --- React Awal ---
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            const apiUrl = `https://api-faa.my.id/faa/douyin-down?url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) throw new Error("Gagal mengambil data dari Douyin.");

            const res = data.result;
            const medias = res.medias || [];

            // 1. Filter Foto (Images)
            const images = medias.filter(v => v.type === 'image');
            if (images.length > 1) { 
                for (let img of images) {
                    await conn.sendMessage(m.chat, { image: { url: img.url } });
                    await new Promise(r => setTimeout(r, 700)); 
                }
                return await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            }

            // 2. Ambil Link Video
            const videoData = medias.find(v => v.type === 'video');
            if (!videoData) throw new Error("Video tidak ditemukan.");

            // 3. Download ke Buffer
            const videoBuffer = await axios.get(videoData.url, { responseType: 'arraybuffer' })
                .then(res => Buffer.from(res.data));

            const media = await prepareWAMessageMedia({ 
                video: videoBuffer 
            }, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                header: {
                    hasMediaAttachment: true,
                    videoMessage: media.videoMessage
                },
                body: { 
                    text: `🎬 *DOUYIN DOWNLOADER*\n\n` +
                          `📝 *Judul:* ${res.title || 'No Title'}\n` +
                          `📌 *Platform:* ${res.platform || 'Douyin'}`
                },
                footer: { text: "Castorie Assistant • Douyin" },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "🎵 ᗩᗰᗷIᒪ ᗩᑌᗪIO", 
                            id: `.ttaudio ${url}` // Sesuai request lu
                        })
                    }]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id, quoted: fake });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nAlasan: ${e.message}` 
            }, { quoted: fail });
        }
    }
};
