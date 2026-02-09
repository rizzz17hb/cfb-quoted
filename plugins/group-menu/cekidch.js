import axios from "axios";

export default {
    name: 'cekidch',
    alias: ['cekchannel', 'idch'],
    category: 'grup',
    isOwner: true,
    isGroup: true,
    isBotAdmin: true,
    async exec({ conn, m, text, usedPrefix, command }) {
        // 1. Validasi Input
        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.grup }, 
                caption: `⚠️ Masukkan URL Channel WhatsApp!\nContoh: ${usedPrefix + command} https://whatsapp.com/channel/xxxxx` 
            }, { quoted: m });
        }

        // 2. React Awal (⏱️ & 🔍)
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            const apiUrl = `https://api-faa.my.id/faa/cekidch?url=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) throw new Error("Data channel tidak ditemukan.");

            const res = data.result;

            let caption = `🔍 *INFORMASI CHANNEL WHATSAPP*\n\n`;
            caption += `🆔 *ID:* ${res.id || '-'}\n`;
            caption += `🔗 *Link:* ${text}\n\n`;

            // 3. Kirim Respon (Pake Image Channel jika ada, jika tidak pake global.grup)
            await conn.sendMessage(m.chat, { 
                image: { url: res.image || global.grup }, 
                caption: caption 
            }, { quoted: m });

            // 4. React Sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            // 5. React & Respon Gagal
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: { url: global.grup }, 
                caption: `❌ *Gagal:* ${e.message}` 
            }, { quoted: m });
        }
    }
};
