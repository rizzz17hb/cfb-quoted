import { ttv3 } from "../../lib/scraper/index.js";

export default {
    name: 'ttaudiov2',
    alias: ['ttmp3v2', 'ttav2'],
    category: 'download',
    async exec({ conn, m, text, args }) {
        let input = text || (m.quoted ? m.quoted.text : args[0]);
        if (!input) return; 

        const url = input.trim();
        if (!/(tiktok\.com|vt\.tiktok\.com|douyin\.com|v\.douyin\.com)/i.test(url)) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "❌ *Link TikTok tidak valid!*" 
            }, { quoted: m });
        }

        await m.react('⏱️');

        try {
            const res = await ttv3(url);

            if (!res || !res.audio) throw new Error("Audio tidak ditemukan.");

            // Kirim audio
            await conn.sendMessage(m.chat, {
                audio: { url: res.audio },
                mimetype: 'audio/mpeg',
                ptt: false 
            });

            await m.react('✅');

        } catch (e) {
            console.error("ttaudiov2 error:", e.message);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                image: { url: global.download },
                caption: `Gagal download audio v2 (TTSave), coba lagi nanti ya..!`
            }, { quoted: m });
        }
    }
};