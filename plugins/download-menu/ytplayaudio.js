import axios from "axios";

export default {
    name: 'ytplayaudio',
    alias: ['playaudio'],
    category: 'download',
    async exec({ conn, m, text, usedPrefix, command }) {
        if (!text) return; 

        // 1. React pas mulai proses
        await m.react('⏱️');

        try {
            const apiUrl = `https://api-faa.my.id/faa/ytplay?query=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) throw new Error("Audio tidak ditemukan.");

            const res = data.result;
            const audioUrl = res.mp3; 
            const title = res.title || "Audio";

            if (!audioUrl) throw new Error("API tidak memberikan link MP3.");

            // 2. Kirim Audio
            await conn.sendMessage(m.chat, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mp4',
                fileName: `${title}.mp3`
            }, { quoted: m });

            // 3. React pas berhasil
            await m.react('✅');

        } catch (e) {
            console.error(e);
            // 4. React pas gagal
            await m.react('❌');
            
            await conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `❌ *Gagal:* ${e.message}` 
            }, { quoted: m });
        }
    }
};