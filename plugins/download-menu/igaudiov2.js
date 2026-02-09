import { igaudiov2 } from '../../lib/scraper/index.js';

export default {
    name: 'igaudiov2',
    alias: ['igaudiov2', 'instamp3v2'],
    category: 'download',
    limit: true,
    async exec({ conn, m, args, text }) {
        let input = text || (m.quoted ? m.quoted.text : args[0]);

        if (!input || !/instagram\.com/i.test(input)) {
            // --- 1. REACT PAS LINK KOSONG / SALAH ---
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });

            // --- 2. KIRIM PESAN PERINGATAN ---
            return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "Mana link Instagramnya?\nPastikan link yang kamu masukkan benar ya!" 
            }, { quoted: m });
        }

        const regex = /(https?:\/\/(?:www\.)?instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?)/;
        const url = input.match(regex)?.[0];
        if (!url) return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "Link Instagram tidak valid!" 
            }, { quoted: m });

        await m.react('⏱️');

        try {
            // Menggunakan scraper pusat igaudiov2
            const res = await igaudiov2(url);
            
            if (!res || !res.audio) {
                throw new Error("Gagal mengambil audio dari Instagram.");
            }

            await m.react('🎵');

            // Langsung kirim audio tanpa reply pesan (sesuai request lu)
            await conn.sendMessage(m.chat, {
                audio: { url: res.audio },
                mimetype: 'audio/mp4',
                ptt: false, 
                fileName: 'ig-audio.mp3'
            });

            await m.react('✅');
            conn.sendMessage(m.chat, {
                    image: { url: global.download },
                    caption: `Berhasil dikirim audionya ya ka...😉`
                });

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                    image: { url: global.download },
                    caption: `❌ *Error:* ${e.message}`
                }, { quoted: m });
        }
    }
};