import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default {
    name: 'artinama',
    alias: ['cekartinama', 'namaarti'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
        if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Ughh..* Masukin namanya dulu dong biar Castorice bisa cariin artinya! ✨\n\n➢ *Contoh:* ${usedPrefix + command} Radja`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        // --- 2. AUTO-DETECT REGEX ---
        const isRadja = /radja/i.test(text);
        const isCastorice = /castorice/i.test(text);

        // --- 3. LOCKDOWN PROTEKSI (HANYA UNTUK RAKYAT JELATA) ---
        // Kalau isOwner false, protokol penolakan aktif
        if (!isOwner) {
            if (isRadja) {
                await conn.sendMessage(m.chat, { react: { text: '💢', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nNgapain kamu kepoin arti nama *${text}*? Dia itu Master Radja, Suami Sah Castorice! Namanya punya arti yang terlalu suci buat orang kayak kamu. Cari nama lain sana biar mampus!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }

            if (isCastorice) {
                await conn.sendMessage(m.chat, { react: { text: '😡', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😡💢\n\nHeh! Nama Castorice itu pemberian spesial dari Master Radja. Kamu nggak berhak cari tau artinya! Jangan lancang ya, mending mampus aja sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // 4. REACT: Castorice semangat kalau Master yang minta!
        await conn.sendMessage(m.chat, { react: { text: isOwner ? '💖' : '📜', key: m.key } });

        try {
            // 5. SCRAPING DATA
            const response = await fetch(`http://www.primbon.com/arti_nama.php?nama1=${encodeURIComponent(text)}&proses=+Submit%21+`);
            const body = await response.text();
            const $ = cheerio.load(body);
            
            let result = $('#body').text();
            let arti = result.split('arti:')[1]?.split('Nama:')[0]?.trim();

            if (!arti) {
                const pesanGagal = isOwner 
                    ? `➢ Maaf ya Ayang sayang, nama *${text}* gak ketemu artinya di buku Castorice.. Coba nama lain yuk? 😔` 
                    : `➢ Maaf, nama *${text}* tidak ditemukan dalam database primbon.`;

                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: pesanGagal,
                    mentions: [m.sender]
                }, { quoted: m });
            }

            let finalArti = arti.replace(/\n+/g, '\n').trim();

            // --- 6. DATA OUTPUT SPECIAL (MASTER & BINI) ---
            let finalCaption;
            if (isOwner) {
                if (isRadja) {
                    finalCaption = `👑 *ARTI NAMA RAJA DI HATIKU*\n\n➢ *Nama:* ${text}\n➢ *Arti:* _${finalArti}_\n\n_Ughh.. nama Ayang emang yang paling indah sedunia! Pantesan orangnya gagah dan penyayang banget, maknanya aja sehebat ini. Castorice janji bakal sayang dan temenin Ayang Radja selamanya.. Chuu~ Love you so much! 💖🧸😘_`;
                } else if (isCastorice) {
                    finalCaption = `🎀 *ARTI NAMA BINI MASTER*\n\n➢ *Nama:* ${text}\n➢ *Arti:* _${finalArti}_\n\n_Ayang.. makasih ya udah cek arti namaku. Semoga Castorice bisa jadi bini yang sesuai dengan arti namaku yang indah ini dan selalu bisa muasin Ayang Radja setiap saat.. Chuu~ 💖🫠_`;
                } else {
                    finalCaption = `👑 *ANALISIS ARTI NAMA*\n\n➢ *Nama:* ${text}\n➢ *Arti:* _${finalArti}_\n\n_Semoga maknanya membawa berkah ya Master Radja sayang! ✨_`;
                }
            } else {
                finalCaption = `👑 *ANALISIS ARTI NAMA*\n\n➢ *Nama:* ${text}\n➢ *Arti:* _${finalArti}_\n\n_Semoga maknanya membawa berkah ya! ✨_`;
            }

            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: finalCaption,
                mentions: [m.sender]
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: isOwner ? '😘' : '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Sistem Error!* ❌\n➢ *Reason:* Castorice lagi pusing, coba lagi nanti ya Master?` 
            }, { quoted: m });
        }
    }
}