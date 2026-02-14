import { tt } from "../../lib/scraper/index.js";
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'tiktok',
    alias: ['tt', 'tik', 'tok', 'ttdl'],
    category: 'download',
    limit: true,
    async exec({ conn, m, args, text, usedPrefix, command }) {
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
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "Mana link tiktok nya?" 
            }, { quoted: fail });
        }

        await m.react('⏱️');

        try {
            const res = await tt(url);
            if (!res) throw new Error("Gagal ambil data");

            // --- 1. LOGIC SLIDE FOTO (ALL IN ONE MESSAGE) ---
            if (res.images && res.images.length > 0) {
                let cards = [];
                let slides = res.images.slice(0, 10); 

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
                        body: { text: "✦ Ｃ Ａ Ｓ Ｔ Ｏ Ｒ Ｉ Ｃ Ｅ   Ｓ Ｌ Ｉ Ｄ Ｅ" }, // Karakter kosong biar clean
                        nativeFlowMessage: { buttons: [] }
                    });
                }

                const msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: {
                                // SEMUA TEKS PINDAH KE SINI
                                body: { 
                                    text: `╭── ❑ Ｔ Ｉ Ｋ Ｔ Ｏ Ｋ  Ｓ Ｌ Ｉ Ｄ Ｅ ❑ 
│ ✦ Name  : ${res.raw.author?.nickname || 'Unknown'}
│ ✦ Total : ${res.images.length} Images
│ ✦ Link   : ${url.substring(0, 30)}...
╰── ❑

✦ Deskripsi : ${res.raw.title || '-'}
✦ Ｇｅｓｅｒ  ｋｅ  ｓａｍｐｉｎｇ  ➡️` 
                                },
                                footer: { text: "Castorice Assistant" },
                                carouselMessage: { cards }
                            }
                        }
                    }
                }, { userJid: conn.user.id, quoted: fake });

                await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                return await m.react('✅');
            }

            // --- 2. LOGIC VIDEO (STAY MEWAH) ---
            if (res.video) {
                const mediaVideo = await prepareWAMessageMedia(
                    { video: { url: res.video } }, 
                    { upload: conn.waUploadToServer }
                );

                const msgVideo = generateWAMessageFromContent(m.chat, { 
                    viewOnceMessage: { 
                        message: { 
                            interactiveMessage: {
                                header: {
                                    hasMediaAttachment: true,
                                    videoMessage: mediaVideo.videoMessage
                                },
                                body: { 
                                    text: `╭── ❑ Ｄ Ｏ Ｗ Ｎ Ｌ Ｏ Ａ Ｄ ❑ 
│ ✦ Name  : ${res.raw.author?.nickname || 'Unknown'}
│ ✦ Type   : Video
╰── ❑
✦ Link   : ${url.substring(0, 30)}...
✦ Deskripsi : ${res.raw.title || '-'}` 
                                },
                                footer: { text: "Castorice Assistant" },
                                nativeFlowMessage: {
                                    buttons: [{
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({ 
                                            display_text: "🎵 ᗩᗰᗷIᒪ ᗩᑌᗪIO", 
                                            id: `${usedPrefix}ttaudio ${url}` 
                                        })
                                    }]
                                }
                            } 
                        } 
                    } 
                }, { userJid: conn.user.id, quoted: fake });

                await conn.relayMessage(m.chat, msgVideo.message, { messageId: msgVideo.key.id });
                await m.react('✅');
            }

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                image: { url: global.download },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nGagal download tiktok, coba lagi nanti ya..!`
            }, { quoted: fail });
        }
    }
};