import axios from 'axios';
import * as cheerio from 'cheerio';

export default {
    name: 'douyinaudio',
    alias: ['dyaudio', 'dymp3'],
    category: 'download',
    async exec({ conn, m, text, args, usedPrefix, command }) {
        let url = text || (m.quoted ? m.quoted.text : args[0]);
        const fakeQuoted = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        if (!url) {
            
            // --- 1. REACT PAS LINK KOSONG ---
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });

            return conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `Masukkan link Douyin/TikTok!\nContoh: ${usedPrefix + command} https://v.douyin.com/xxx/` 
            }, { quoted: fakeQuoted });

        } 

        // 2. React Awal (Sesuai standar lu)
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            // 3. Request ke Savetik.co
            const { data } = await axios.post('https://savetik.co/api/ajaxSearch', 
                new URLSearchParams({ q: url, lang: 'en' }), 
                {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'referer': 'https://savetik.co/en'
                    }
                }
            );

            if (data.status !== 'ok') throw new Error("Gagal memproses link di Savetik.");

            const $ = cheerio.load(data.data);
            let audioUrl = '';

            $('a.tik-button-dl').each((i, el) => {
                const href = $(el).attr('href');
                const textBtn = $(el).text().toLowerCase();
                
                if (href && (href.includes('mp3') || textBtn.includes('mp3'))) {
                    audioUrl = href;
                }
            });

            if (!audioUrl) throw new Error("Audio tidak ditemukan dalam respon web.");

            // 5. Download ke Buffer agar WhatsApp bisa ngirim filenya
            const response = await axios.get(audioUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
                }
            });
            const audioBuffer = Buffer.from(response.data);

            // 6. Kirim Pure Audio (Tanpa Ad Reply)
            await conn.sendMessage(m.chat, { 
                audio: audioBuffer, 
                mimetype: 'audio/mpeg'
            }, { quoted: fakeQuoted });

            // 7. React Sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            // React & Kirim Error pake foto global
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\n Alasan: ${e.message}` 
            }, { quoted: fail });
        }
    }
};