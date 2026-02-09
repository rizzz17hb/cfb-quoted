import { igv2 } from "../../lib/scraper/index.js";
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'instagramv2',
    alias: ['igv2', 'igdlv2'],
    category: 'download',
    limit: true,
    async exec({ conn, m, args, text }) {
        let input = text || (m.quoted ? m.quoted.text : args[0]);

        if (!input || !/instagram\.com/i.test(input)) {
            // --- 1. REACT PAS LINK KOSONG / SALAH ---
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });

            // --- 2. KIRIM PESAN PERINGATAN ---
            return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "Mana link Instagramnya?\nPastikan link yang kamu masukkan benar ya Master!" 
            }, { quoted: m });
        }

        const regex = /(https?:\/\/(?:www\.)?instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?)/;
        const url = input.match(regex)?.[0];
        if (!url) return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "Link Instagram tidak valid!" 
            }, { quoted: m });

        await m.react('⏱️');

        try {
            // --- MENGGUNAKAN SCRAPER DARI INDEX.JS ---
            const res = await igv2(url);
            if (!res || !res.info || res.info.length === 0) throw new Error("Gagal mengambil konten dari Instagram.");

            const result = res.info;

            // 1. HANDLE CAROUSEL (Kalau lebih dari 1 media)
            if (result.length > 1) {
                for (let i = 0; i < result.length - 1; i++) {
                    const mediaUrl = result[i].url;
                    const isVideo = result[i].type === 'video' || mediaUrl.includes(".mp4");
                    
                    await conn.sendMessage(m.chat, { 
                        [isVideo ? 'video' : 'image']: { url: mediaUrl }, 
                        caption: `Slide ${i + 1}` 
                    });
                    await new Promise(r => setTimeout(r, 1200)); 
                }
            }

            // 2. HANDLE INTERACTIVE BUTTON (Media Terakhir)
            const lastMedia = result[result.length - 1];
            const lastUrl = lastMedia.url;
            const isVideoLast = lastMedia.type === 'video' || lastUrl.includes(".mp4");
            
            let mediaOption = isVideoLast ? { video: { url: lastUrl } } : { image: { url: lastUrl } };
            const mediaHeader = await prepareWAMessageMedia(mediaOption, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                header: {
                    title: "✅ *Instagram Success*",
                    hasMediaAttachment: true,
                    ...(isVideoLast ? { videoMessage: mediaHeader.videoMessage } : { imageMessage: mediaHeader.imageMessage })
                },
                body: { 
                    text: `✨ *Ｉ Ｎ Ｓ Ｔ Ａ Ｇ Ｒ Ａ Ｍ*\n\nBerhasil mengunduh *${result.length}* media.\n` 
                },
                footer: { text: "Castorie Assistant • Radja Iblis" },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "🎵 ᗩᗰᗷIᒪ ᗩᑌᗪIO", 
                            id: `.igaudiov2 ${url}` 
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
            await conn.sendMessage(m.chat, {
                    image: { url: global.download },
                    caption: `❌ *Error:* ${e.message}`
                }, { quoted: m });
        }
    }
};