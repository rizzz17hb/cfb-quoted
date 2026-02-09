import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    name: 'rvo',
    alias: ['readviewonce', 'readvo', 'liat'],
    category: 'tools',
    exec: async ({ conn, m, command }) => {
        try {
            // --- 1. DETEKSI REPLI & VIEW ONCE ---
            let q = m.quoted ? m.quoted : m;
            
            // Mencari struktur View Once di berbagai kemungkinan layer
            let viewOnce = q.message?.viewOnceMessageV2 || q.message?.viewOnceMessage || q.msg?.viewOnce;

            // Jika benar-back bukan View Once, arahkan user pake gambar global.tools
            if (!viewOnce) {
                const teksError = `❌ *MANA FOTO SEKALI LIAT NYA ❓*\n\n` +
                                  `Silahkan reply pesan yang bertanda *'Sekali Lihat'* lalu ketik .${command}`;
                
                return conn.sendMessage(m.chat, { 
                    image: { url: global.tools }, 
                    caption: teksError 
                }, { quoted: m });
            }

            await m.react('⏱️');

            // --- 2. EKSTRAKSI DATA MEDIA (FIXED LAYER) ---
            // Kita bongkar sampai ketemu tipe pesannya (imageMessage/videoMessage)
            let msgContent = q.message?.viewOnceMessageV2?.message || q.message?.viewOnceMessage?.message || q.msg;
            if (msgContent.viewOnceMessageV2) msgContent = msgContent.viewOnceMessageV2.message;
            if (msgContent.viewOnceMessage) msgContent = msgContent.viewOnceMessage.message;

            let type = Object.keys(msgContent)[0]; 
            let mediaMsg = msgContent[type];
            let mime = mediaMsg?.mimetype || "";

            // --- 3. PROSES DOWNLOAD ---
            // Pastikan downloadObj mengambil struktur message yang murni
            let downloadObj = {
                key: q.key || m.key,
                message: q.message || (m.quoted ? m.quoted : m.message)
            };

            let media = await downloadMediaMessage(
                downloadObj,
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: conn.updateMediaMessage
                }
            );

            if (!media) throw new Error("Gagal mengunduh media. Mungkin sudah kadaluarsa atau ditarik.");

            // --- 4. KIRIM HASIL ---
            const caption = `*VIEW ONCE REVEALED*\n\n` +
                            ` • Done Ya Kak.\n` +
                            ` • Nih Hasilnya....`;

            if (/video/i.test(mime)) {
                await conn.sendMessage(m.chat, { video: media, caption: caption }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { image: media, caption: caption }, { quoted: m });
            }

            await m.react('✅');

        } catch (e) {
            console.error('RVO ERROR:', e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: global.sticker,
                caption: `❌ *FAILED:* ${e.message}` 
            }, { quoted: m });
        }
    }
};
