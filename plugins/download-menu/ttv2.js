import { ttv2 } from "../../lib/scraper/index.js";
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'tiktokv2',
    alias: ['ttv2', 'tikv2', 'tokv2', 'ttdlv2'],
    category: 'download',
    limit: true,
    
    async exec({ conn, m, args, text }) {
        let url = text || (m.quoted ? m.quoted.text : args[0]);

        if (!url) return conn.sendMessage(m.chat, { text: "⚠️ Tolong masukkan link TikTok!\nContoh: .tiktok https://vm.tiktok.com/..." }, { quoted: m });

        await m.react('⏱️');

        try {
            const res = await ttv2(url);
            if (!res) throw new Error("Gagal mengambil data dari API.");

            // --- 1. LOGIC SLIDE FOTO (IMAGE) ---
            if (res.type === "image" && res.images.length > 0) {
                let cards = [];
                let slides = res.images.slice(0, 10); // Limit 10 agar tidak berat

                for (let i = 0; i < slides.length; i++) {
                    const media = await prepareWAMessageMedia(
                        { image: { url: slides[i] } }, 
                        { upload: conn.waUploadToServer }
                    );
                    cards.push({
                        header: {
                            title: `✦ P H O T O  -  ${i + 1}`,
                            hasMediaAttachment: true,
                            imageMessage: media.imageMessage
                        },
                        body: { text: "✦ Ｃ Ａ Ｓ Ｔ Ｏ Ｒ Ｉ Ｃ Ｅ   Ｓ Ｌ Ｉ Ｄ Ｅ" },
                        nativeFlowMessage: { buttons: [] }
                    });
                }

                const msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: {
                                body: { 
                                    text: `╭── ❑ Ｔ Ｉ Ｋ Ｔ Ｏ Ｋ   Ｓ Ｌ Ｉ Ｄ Ｅ ❑ 
│ ✦ Name  : ${res.author}
│ ✦ Total : ${res.images.length} Images
│ ✦ Link   : ${url.substring(0, 30)}...
╰── ❑

✦ Deskripsi : ${res.title || '-'}
✦ Ｇｅｓｅｒ   ｋｅ   ｓａｍｐｉｎ g   ➡️` 
                                },
                                footer: { text: "Castorice Assistant" },
                                carouselMessage: { cards }
                            }
                        }
                    }
                }, { userJid: conn.user.id });

                await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                return await m.react('✅');
            }

            // --- 2. LOGIC VIDEO ---
            if (res.type === "video" && res.video) {
                const media = await prepareWAMessageMedia(
                    { video: { url: res.video } }, 
                    { upload: conn.waUploadToServer }
                );

                const interactiveMessage = {
                    header: {
                        title: "TIKTOK DOWNLOADER", 
                        hasMediaAttachment: true,
                        videoMessage: media.videoMessage
                    },
                    body: {
                        text: `╭── ❑ Ｄ Ｏ Ｗ Ｎ Ｌ Ｏ Ａ Ｄ ❑ 
│ ✦ Name  : ${res.author}
│ ✦ Type   : Video
╰── ❑
✦ Link   : ${url.substring(0, 30)}...
✦ Deskripsi : ${res.title || '-'}`
                    },
                    footer: {
                        text: "Castorice Assistant"
                    },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "🎵 AMBIL MUSIK",
                                id: `.ttaudiov2 ${url}`
                            })
                        }]
                    }
                };

                const msg = generateWAMessageFromContent(m.chat, { viewOnceMessage: { message: { interactiveMessage } } }, {});
                await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                return await m.react('✅');
            }

            throw new Error("Tipe konten tidak dikenali.");

        } catch (e) {
            console.error("Error TikTok:", e);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                image: { url: global.download },
                caption: `Gagal download tiktok, coba lagi nanti ya..!`
            }, { quoted: m });
        }
    }
};