import axios from "axios";
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'ytplay',
    alias: ['play', 'ytplayvid'],
    category: 'download',
    async exec({ conn, m, text, usedPrefix, command }) {
        // 1. VALIDASI INPUT + REACT ❓
        if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `⚠️ *Mau cari lagu apa Master?*\n\nContoh: ${usedPrefix + command} Mahalini Sial` 
            }, { quoted: m });
        }

        await m.react('⏱️');

        try {
            // 2. FETCH DATA DARI API
            const apiUrl = `https://api-faa.my.id/faa/ytplayvid?q=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data.status || !data.result) throw new Error("Video tidak ditemukan.");

            const res = data.result;
            const videoUrl = res.download_url; 
            const videoTitle = res.searched_title;
            const originalUrl = res.searched_url;

             

            // 3. PREPARE MEDIA VIDEO
            const media = await prepareWAMessageMedia({ 
                video: { url: videoUrl } 
            }, { upload: conn.waUploadToServer });

            // 4. KONSTRUKSI INTERACTIVE MESSAGE (No ContextInfo/Forwarded)
            const interactiveMessage = {
                header: {
                    title: "YouTube Play ✅",
                    hasMediaAttachment: true,
                    videoMessage: media.videoMessage
                },
                body: { 
                    text: `🎬 *YOUTUBE DOWNLOADER*\n\n` +
                          `📝 *Judul:* ${videoTitle}\n` +
                          `📦 *Format:* ${res.format}\n` +
                          `🔗 *Source:* ${originalUrl}`
                },
                footer: { text: "Castorie Assistant" },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "🎵 ᑭᒪᗩY ᗰᑌᔕIᑕ", 
                            id: `.ytplayaudio ${videoTitle.slice(0, 50)}` 
                        })
                    }]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { 
                    message: { interactiveMessage } 
                } 
            }, { userJid: conn.user.id });

            // 5. KIRIM RELAY (Tanpa Quoted di Relay agar Clean, atau Quoted tetap di eksekusi)
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `❌ *Kandas Master:* ${e.message}` 
            }, { quoted: m });
        }
    }
};