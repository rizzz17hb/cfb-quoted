import axios from 'axios';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    name: 'brat',
    alias: ['sbrat'],
    category: 'sticker',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            // 1. Validasi Input (Tanpa m.reply)
            if (!text) {
                await m.react('❌');
                return await conn.sendMessage(m.chat, {
                    image: { url: global.sticker },
                    caption: `*BRAT STICKER* 🎨\n\nSilakan masukkan teks:\n*${usedPrefix + command}* Radja Engine`
                });
            }

            await m.react('⏱️');

            // 2. Fetch API Brat
            const url = `https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`;
            const res = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000
            });

            if (!res.data) throw new Error("Server API tidak merespon.");

            // 3. Proses Formatter (Biar jadi stiker valid & bisa disave)
            const sticker = new Sticker(res.data, {
                pack: 'Radja Engine', 
                author: 'V1', 
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: m.key.id,
                quality: 100
            });

            const buf = await sticker.toBuffer();

            // 4. Kirim Native
            await conn.sendMessage(m.chat, { 
                sticker: buf 
            }, { quoted: m });

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            // Error handling gaya native lo
            await conn.sendMessage(m.chat, {
                image: { url: global.sticker },
                caption: `❌ *BRAT ERROR*\n${e?.message || 'Terjadi kesalahan sistem.'}`
            });
        }
    }
}
