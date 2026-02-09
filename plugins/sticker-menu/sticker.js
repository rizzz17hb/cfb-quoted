import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    name: 'sticker',
    alias: ['s', 'stiker'],
    category: 'sticker',
    exec: async ({ conn, m, usedPrefix, command }) => {
        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';

            // --- KONDISI 1: BERHASIL (ADA MEDIA) ---
            if (/image|video|webp/.test(mime)) {
                await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });
                
                let img = await q.download();
                let sticker = new Sticker(img, {
                    pack: 'Castorice Pack', 
                    author: 'Radja Engine',      
                    type: StickerTypes.FULL,
                    quality: 80,
                });

                const buffer = await sticker.toBuffer();
                await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            } else {

                await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
                await conn.sendMessage(m.chat, {
                    image: { url: global.sticker },
                    caption: `*Cara Penggunaan:* 💡\n\nSilahkan *Reply* gambar/video yang sudah ada, atau kirim gambar baru dengan caption: *${usedPrefix + command}*`
                }, { quoted: m });
            }
        } catch (e) {
            console.error('STICKER ERROR:', e);
            await conn.sendMessage(m.chat, { 
                image: global.sticker,
                caption: `Terjadi kesalahan teknis saat memproses stiker.` 
            }, { quoted: m });
        }
    }
};
