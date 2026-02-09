import ytdl from "@distube/ytdl-core";

export default {
    name: 'ytplayaudiov2',
    alias: ['playaudiov2'],
    category: 'download', 
    async exec({ conn, m, text, usedPrefix, command }) {
        // 1. VALIDASI INPUT + REACT ❓
        if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `⚠️ *Mau cari lagu apa ?*\n\nContoh: ${usedPrefix + command} linknya`
            }, { quoted: m });
        }

        // 2. PROSES MULAI
        await m.react('⏱️');

        try {
            if (!ytdl.validateURL(text)) {
                return conn.sendMessage(m.chat, { 
                    image: { url: global.download }, 
                    caption: `❌ *Link YouTube tidak valid Master!*`
                }, { quoted: m });
            }

            const info = await ytdl.getInfo(text);
            const stream = ytdl(text, { quality: 'highestaudio', filter: 'audioonly' });

            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            // 3. KIRIM AUDIO (Tanpa contextInfo)
            await conn.sendMessage(m.chat, { 
                audio: buffer, 
                mimetype: 'audio/mp4',
                fileName: `${info.videoDetails.title}.mp3`
            }, { quoted: m });

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `❌ *Gagal:* ${e.message}`
            }, { quoted: m });
        }
    }
};