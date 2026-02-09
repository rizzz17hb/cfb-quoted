import axios from 'axios';
import { Sticker, createSticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    name: 'bratvid',
    alias: ['bratvideo', 'bvid'],
    category: 'sticker',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            // 1. Cek Input
            if (!text) {
                await m.react('❌');
                return await conn.sendMessage(m.chat, {
                    image: { url: global.sticker },
                    caption: `*BRAT VIDEO GENERATOR* 🎥\n\nSilakan masukkan teks:\n*${usedPrefix + command}* Castorice System`
                });
            }

            await m.react('⏱️');

            // --- FETCH API SIPUTZX ---
            let apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isAnimated=true&delay=500`;
            let res = await axios.get(apiUrl, { responseType: "arraybuffer" });

            if (!res.data) throw new Error("Gagal ambil data dari API.");

            // --- PROSES FORMATTER (BIAR BISA DIDOWNLOAD/JADI STIKER) ---
            const sticker = new Sticker(res.data, {
                pack: global.packname || 'Radja Engine', 
                author: global.author || 'V1',
                type: StickerTypes.FULL,
                categories: ['🤩', '✨'],
                quality: 50 // Turunin dikit biar gak kegedean sizenya
            });

            const stickerBuffer = await sticker.toBuffer();

            // --- KIRIM NATIVE ---
            await conn.sendMessage(m.chat, {
                sticker: stickerBuffer
            }, { quoted: m });

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                image: { url: global.sticker },
                caption: `❌ *BRATVID ERROR*\n${e.message}`
            });
        }
    }
};
