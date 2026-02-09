import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import Jimp from 'jimp';

// CACHE FONT: Biar gak nge-load ulang terus setiap ada request
let fontWhite, fontBlack;
const loadFonts = async () => {
    if (!fontWhite) fontWhite = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    if (!fontBlack) fontBlack = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
};

export default {
    name: 'smeme',
    alias: ['stickermeme', 'sm'],
    category: 'sticker',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // Pastiin font udah siap (cuma lama di request pertama doang)
        await loadFonts();

        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';

            if (/image\/(jpe?g|png|webp)/.test(mime) && text) {
                // React instan pas command masuk
                await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

                let [atas, bawah] = text.split('|').map(v => v.trim());
                let imgBuffer = await q.download();
                
                const image = await Jimp.read(imgBuffer);
                
                // Resize ke 512px (ukuran stiker) biar proses gambar lebih enteng
                image.scaleToFit(512, 512); 

                const printMeme = (txt, y) => {
                    const config = {
                        text: txt.toUpperCase(),
                        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                    };
                    const w = image.bitmap.width;
                    const h = image.bitmap.height;

                    // Stroke/Outline
                    image.print(fontBlack, 2, y + 2, config, w, h);
                    image.print(fontBlack, -2, y - 2, config, w, h);
                    image.print(fontBlack, 2, y - 2, config, w, h);
                    image.print(fontBlack, -2, y + 2, config, w, h);
                    // Main Text
                    image.print(fontWhite, 0, y, config, w, h);
                };

                if (atas) printMeme(atas, 15);
                if (bawah) printMeme(bawah, image.bitmap.height - 85);

                const memeBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

                let sticker = new Sticker(memeBuffer, {
                    pack: 'Smeme Radja',
                    author: 'Jimp Engine',
                    type: StickerTypes.FULL,
                    quality: 60 // Kurangin quality dikit biar convert ke stiker lebih ngebut
                });

                await conn.sendMessage(m.chat, { sticker: await sticker.toBuffer() }, { quoted: m });
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            } else {
                await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
                await conn.sendMessage(m.chat, {
                    image: { url: global.sticker },
                    caption: `*CARA MENGGUNAKAN SMEME* 🛠️\n\nKirim atau reply gambar dengan caption:\n*${usedPrefix + command} teks atas | teks bawah*`
                });
            }
        } catch (e) {
            console.error('JIMP ERROR:', e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, {
                    image: { url: global.sticker },
                    caption: `ups gagal, server eror❌`
                });
        }
    }
};
