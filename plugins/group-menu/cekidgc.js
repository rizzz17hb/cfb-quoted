import axios from "axios";

export default {
    name: 'cekidgc',
    alias: ['cekgrup', 'idgc'],
    category: 'grup',
    isOwner: true,
    isGroup: true,
    isBotAdmin: true,
    async exec({ conn, m, text, usedPrefix, command }) {
        // 1. Validasi Input URL
        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.grup }, 
                caption: `⚠️ Masukkan URL Undangan Grup WhatsApp!\nContoh: ${usedPrefix + command} https://chat.whatsapp.com/xxxxx` 
            }, { quoted: m });
        }

        // 2. React Awal (⏱️ & 🔍)
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            // 3. Request ke API FAA Cek ID GC
            const apiUrl = `https://api-faa.my.id/faa/cekidgc?url=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) throw new Error("Gagal mengambil data grup. Pastikan link undangan valid!");

            const res = data.result;

            // 4. Susun Informasi Grup
            let caption = `👥 *INFORMASI GRUP WHATSAPP*\n\n`;
            caption += `📝 *Nama:* ${res.subject || '-'}\n`;
            caption += `🆔 *ID:* ${res.id || '-'}\n`;
            caption += `🔗 *Link:* ${text}\n\n`;

            // 5. Kirim Respon (Pake foto grup jika ada, kalau tidak balik ke global.grup)
            await conn.sendMessage(m.chat, { 
                image: { url: res.thumb || global.grup }, 
                caption: caption 
            }, { quoted: m });

            // 6. React Sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            // 7. React & Respon Gagal
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: { url: global.grup }, 
                caption: `❌ *Error:* ${e.message}` 
            }, { quoted: m });
        }
    }
};
