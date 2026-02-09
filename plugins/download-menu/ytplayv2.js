import yts from "yt-search";
import ytdl from "@distube/ytdl-core";
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'ytplayv2',
    alias: ['playv2'],
    category: 'download',
    async exec({ conn, m, text, usedPrefix, command }) {
        if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `⚠️ *Mau cari lagu apa ?*\n\nContoh: ${usedPrefix + command} Mahalini Sial`
            }, { quoted: m });
        }

        await m.react('⏱️');

        try {
            // 1. Cari video pake yt-search
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) throw new Error("Video tidak ditemukan.");

            // 2. Ambil Info & Format Video (Agar dapet link direct)
            // Ini jauh lebih aman daripada stream mentah untuk Baileys
            const info = await ytdl.getInfo(video.url);
            
            // Pilih format yang ada audio + video (biasanya 360p ke bawah biar cepet)
            const format = ytdl.chooseFormat(info.formats, { quality: '18' }) || 
                           ytdl.chooseFormat(info.formats, { quality: 'lowest', filter: 'videoandaudio' });

            if (!format || !format.url) throw new Error("Gagal mendapatkan link download dari YouTube.");

             

            // 3. Siapkan media pake URL Direct (Biar Baileys yang urusan download ke server WA)
            const media = await prepareWAMessageMedia({ 
                video: { url: format.url } 
            }, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                header: {
                    title: "YouTube Pure ✅",
                    hasMediaAttachment: true,
                    videoMessage: media.videoMessage
                },
                body: { 
                    text: `🎬 *YOUTUBE SEARCH*\n\n` +
                          `📝 *Judul:* ${video.title}\n` +
                          `⏱️ *Durasi:* ${video.timestamp}\n` +
                          `🔗 *Link:* ${video.url}\n\n` +
                          `_Bot memproses video kualitas 360p secara mandiri._`
                },
                footer: { text: "Castorie Assistant • Pure Mode" },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "🎵 ᑭᒪᗩY ᗰᑌᔕIᑕ", 
                            id: `.ytplayaudiov2 ${video.url}` 
                        })
                    }]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            
            // Kasih tau user kalau kemungkinan IP server kena limit (Error 403)
            let errMsg = e.message.includes('403') ? "IP Server kena blokir/limit YouTube (403). Coba lagi nanti!" : e.message;
            
            await conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `❌ *Gagal:* ${errMsg}` 
            }, { quoted: m });
        }
    }
};