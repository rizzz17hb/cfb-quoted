import axios from 'axios';

export default {
    name: 'solo',
    alias: ['masturbasi', 'masturbation'],
    category: 'nsfw',
    isPremium: true,
    exec: async ({ conn, m }) => {
        try {
            // 1. React Awal (Gaya Pixiv yang pasti jalan)
            await m.react('⏱️');

            // 2. Ambil data cadangan (15) biar anti 404
            const { data } = await axios.get(`https://api.lolicon.app/setu/v2?num=15&r18=1&tag=masturbation&size=regular`);
            
            let valid = [];
            // 3. Validasi & Download ke Buffer (Fix Invalid Media Type)
            for (let x of data.data) {
                if (valid.length >= 5) break;
                try {
                    const res = await axios.get(x.urls.regular, { 
                        responseType: 'arraybuffer', 
                        timeout: 5000 
                    });
                    if (res.status === 200) {
                        valid.push({ ...x, buffer: Buffer.from(res.data) });
                    }
                } catch { continue; }
            }

            if (valid.length === 0) throw "Semua stok Solo sedang gangguan (404).";

            // 4. Metadata Sultan dengan Jeda \n\n
            const titles = valid.map((v, i) => `${i + 1}. ${v.title}`).join('\n');
            const authors = valid.map((v, i) => `${i + 1}. ${v.author}`).join('\n');
            const links = valid.map((v, i) => `${i + 1}. https://pixiv.net/artworks/${v.pid}`).join('\n');

            const caption = `✨ *SOLO PREMIUM ALBUM* ✨\n` +
                            `──────────────────────────\n\n` +
                            `💦 *Type:* Solo / Masturbation\n` +
                            `📦 *Total:* 5 Ultra HD Slides\n` +
                            `🔒 *Access:* High-Level Member\n\n` +
                            `📑 *TITLES COLLECTION*\n${titles}\n\n` +
                            `👤 *AUTHORS LIST*\n${authors}\n\n` +
                            `🔗 *ORIGINAL LINKS*\n${links}\n\n` +
                            `──────────────────────────\n` +
                            `_Sedang mengirimkan file album..._`;

            // 5. Kirim Header Banner
            await conn.sendMessage(m.chat, { 
                image: { url: global.nsfw }, 
                caption: caption 
            }, { quoted: m });

            // 6. Kirim Gambar dengan Mimetype (Fix Baileys)
            for (let img of valid) {
                await conn.sendMessage(m.chat, { 
                    image: img.buffer,
                    mimetype: 'image/jpeg' 
                });
                await new Promise(r => setTimeout(r, 1000));
            }
            
            // 7. React Sukses
            await m.react('✅');

        } catch (e) {
            // 8. React Gagal
            await m.react('❌');
            await conn.sendMessage(m.chat, { 
                caption: `❌ *SYSTEM ERROR*\n\n${e.message || e}` 
            }, { quoted: m });
        }
    }
};
