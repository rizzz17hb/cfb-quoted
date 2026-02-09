import { ig } from "../../lib/scraper/index.js";
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'instagram',
    alias: ['ig', 'igdl', 'reels', 'insta'],
    category: 'download',
    limit: true,
    async exec({ conn, m, args, text, command }) {
        let input = text || (m.quoted ? m.quoted.text : args[0]);
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        if (!input || !/instagram\.com/i.test(input)) {
            // --- 1. REACT PAS LINK KOSONG / SALAH ---
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });

            // --- 2. KIRIM PESAN PERINGATAN ---
            return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "Mana link Instagramnya?\nPastikan link yang kamu masukkan benar ya!" 
            }, { quoted: fail });
        }

        // Bersihkan URL dari parameter sampah (?igsh=... dsb) biar API & Button aman
        const url = input.split(/\?| /)[0];

        await m.react('⏱️');

        try {
            // --- MENGGUNAKAN SCRAPER LOKAL ---
            const data = await ig(url);
            if (!data || !data.urls || data.urls.length === 0) throw new Error("Gagal ambil data");

            const urls = data.urls;
            
            // Format Caption Metadata
            const captionInfo = `╭─── ❏ Ｉ Ｎ Ｓ Ｔ Ａ Ｇ Ｒ Ａ Ｍ ❏\n` +
                                `│ \`\`\`➣ Username : ${data.username}\`\`\`\n` +
                                `│ \`\`\`➣ Likes    : ${data.like}\`\`\`\n` +
                                `│ \`\`\`➣ Comments : ${data.comment}\`\`\`\n` +
                                `╰─ ❏\n` +
                                `➣ 𝙲 𝙰 𝙿 𝚃 𝙸 𝙾 𝙽: ${data.caption}\n` +
                                ` ${data.caption}`;

            if (urls.length > 1) {
                await m.react('📸');
                for (let i = 0; i < urls.length; i++) {
                    const mediaUrl = urls[i];
                    const isVideo = /.mp4/i.test(mediaUrl);
                    
                    const captionContent = i === 0 ? captionInfo : "";
                    
                    if (isVideo) {
                        await conn.sendMessage(m.chat, { 
                            video: { url: mediaUrl }, 
                            caption: captionContent 
                        });
                    } else {
                        await conn.sendMessage(m.chat, { 
                            image: { url: mediaUrl }, 
                            caption: captionContent 
                        });
                    }
                    // Jeda 1.2 detik agar tidak kena rate limit/spam
                    await new Promise(r => setTimeout(r, 1200)); 
                }
                return await m.react('✅');
            }

            // 2. HANDLE SINGLE MEDIA DENGAN INTERACTIVE BUTTON
            const singleLink = urls[0];
            const isVideo = singleLink.includes(".mp4");

            // Persiapkan Media Header
            let mediaType = isVideo ? { video: { url: singleLink } } : { image: { url: singleLink } };
            const media = await prepareWAMessageMedia(mediaType, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                header: {
                    hasMediaAttachment: true,
                    ...(isVideo ? { videoMessage: media.videoMessage } : { imageMessage: media.imageMessage })
                },
                body: { 
                    text: captionInfo
                },
                footer: { text: global.footer },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "🎵 ᗩᗰᗷIᒪ ᗩᑌᗪIO", 
                            id: `.igaudio ${url}` // Mengirim kembali link bersih ke plugin audio
                        })
                    }]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { 
                    message: { interactiveMessage } 
                } 
            }, { userJid: conn.user.id, quoted: fake });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            // Jika scraper gagal, kasih pesan error
            await conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "❏ K E S A L A H A N  S Y S T E M ❏\n Alasan: Gagal memproses media. Pastikan link publik atau coba lagi nanti." 
            }, { quoted: fail });
        }
    }
};