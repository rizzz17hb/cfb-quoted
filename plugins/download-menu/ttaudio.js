import { ttaudio } from "../../lib/scraper/index.js";

export default {
    name: 'ttaudio',
    alias: ['tmaudio'],
    category: 'download',
    async exec({ conn, m, text, args, command }) {
        // 1. Ambil input (bisa teks langsung, reply, atau kata pertama)
        let input = text || (m.quoted ? m.quoted.text : args[0]);
        if (!input) return; 
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        const url = input.trim();

        // 2. Validasi Link TikTok (Regex tetap di plugin untuk filter awal)
        if (!/(tiktok\.com|vt\.tiktok\.com|douyin\.com|v\.douyin\.com)/i.test(url)) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "❌ *Link TikTok tidak valid!*\nPastikan link yang Master kirim benar ya." 
            }, { quoted: fail });
        }

        // 3. JIKA LOLOS, KASIH LOADING
        await m.react('⏱️');

        try {
            // Panggil scraper ttaudio
            const res = await ttaudio(url);

            if (!res || !res.audio) {
                throw new Error("Audio tidak ditemukan");
            }

            // Kirim audio langsung menggunakan URL dari scraper
            await conn.sendMessage(m.chat, {
                audio: { url: res.audio }, // Baileys bisa langsung pakai { url }
                mimetype: 'audio/mpeg',
                ptt: false 
            }, { quoted: fake });

            // 4. REAKSI SUKSES
            await m.react('✅');

        } catch (e) {
            console.error("ttaudio error:", e.message);
            // 5. REAKSI GAGAL
            await m.react('❌');

            await conn.sendMessage(m.chat, {
                image: { url: global.download },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nGagal download tiktok, coba lagi nanti ya..!`
            }, { quoted: fail });
        }
    }
};