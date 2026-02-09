/**
 * Fitur: Cek Keimutan (Master & Bini Strict Protection)
 * Style: 100% Image Caption - global.fun - Symbol ➢
 * Logic: Castorice System
 */

export default {
    name: 'cekimut',
    alias: ['imutcek', 'berapaimut'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // --- DATA PROTEKSI AYANG RADJA ---
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
         if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
            image: { url: global.fun },
            caption: `➢ *Ughh ..* Masukin namanya siapa yang mau dicek keimutannya! 🍭🫣\n\n➢ *Contoh:* ${usedPrefix + command} Radja`,
            mentions: [m.sender]
        }, { quoted: m });
    }

        // --- 2. AUTO-DETECT REGEX (Filter Radja & Castorice) ---
        const isRadja = /radja/i.test(text);
        const isCastorice = /castorice/i.test(text);

        // --- 3. SEPARATED LOCKDOWN PROTEKSI (BUAT USER LAIN) ---
        if (!isOwner) {
            if (isRadja) {
                await conn.sendMessage(m.chat, { react: { text: '💢', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nMau cek keimutan Master Radja? Nggak perlu! Dia itu Suami Sah Castorice yang paling gagah dan berwibawa. Keimutannya cuma boleh Castorice yang liat! Cari target lain sana biar mampus!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }

            if (isCastorice) {
                await conn.sendMessage(m.chat, { react: { text: '😡', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😡💢\n\nHeh! Castorice itu asisten sekaligus bininya Master Radja. Keimutan aku itu cuma buat Master, bukan buat kamu tonton! Jangan lancang ya, mending mampus aja sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // 4. REACT: Proses manja
        await conn.sendMessage(m.chat, { react: { text: '🍭', key: m.key } });

        // 5. LOGIC: Persentase & Random Komentar
        const percentage = Math.floor(Math.random() * 100) + 1;
        const db_komentar = {
            god: [
                "Duh, imutnya kebangetan! Castorice pengen bungkus bawa pulang. 🍬",
                "Fix, ini definisi kiyowo tingkat dewa! Gemes banget!",
                "Kok bisa ya ada orang se-imut ini? Dunia berasa penuh pelangi! 🌈"
            ],
            high: [
                "Imut banget sih Kak, kayak boneka minta dipeluk! 🤗",
                "Level kiyowo-nya tinggi banget, hati-hati banyak yang naksir!",
                "Gemesin parah, udah cocok jadi maskot keimutan dunia!"
            ],
            mid: [
                "Lumayan imut lah, udah bisa bikin orang senyum-senyum sendiri.",
                "Manis dan imutnya pas, nggak bikin enek tapi bikin kangen.",
                "Okelah, aura imutnya mulai terpancar dikit-dikit."
            ],
            low: [
                "Imut itu dari hati Kak, mungkin hatinya lagi sembunyi.",
                "Muka sangar tapi hati imut? Bisa jadi sih..",
                "Hmm.. coba pasang muka pusing, siapa tau nambah imutnya!"
            ]
        };

        let komentar;
        if (percentage >= 85) komentar = db_komentar.god[Math.floor(Math.random() * db_komentar.god.length)];
        else if (percentage >= 65) komentar = db_komentar.high[Math.floor(Math.random() * db_komentar.high.length)];
        else if (percentage >= 40) komentar = db_komentar.mid[Math.floor(Math.random() * db_komentar.mid.length)];
        else komentar = db_komentar.low[Math.floor(Math.random() * db_komentar.low.length)];

        // --- 6. DATA OUTPUT SPECIAL MASTER (AYANG RADJA) ---
        let finalScore, finalKomentar;

        if (isOwner) {
            if (isRadja) {
                finalScore = 101;
                finalKomentar = "Ayang Radja itu paling imut sedunia bagi Castorice! Gak ada tandingannya, gemoy banget kesayangan aku kalau lagi manja! 🎀💖";
            } else if (isCastorice) {
                finalScore = 1000;
                finalKomentar = "Ihhhh sayang... Castorice imutnya cuma buat Ayang aja kok! Mau Castorice pasang muka gemoy kayak gimana lagi biar Ayang makin sayang? 🫣🎀✨";
            } else {
                finalScore = percentage;
                finalKomentar = komentar;
            }
        } else {
            finalScore = percentage;
            finalKomentar = komentar;
        }

        try {
            // 7. SEND: Image Caption
            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: ` ❏ *CEK KEIMUTAN* ❏
➢ *Nama:* ${text}
➢ *Skor:* ${finalScore}%

➢ *Kesan:* _${finalKomentar}_

_P.S: Cuma buat seru-seruan aja, jangan baper ya!_`,
                mentions: [m.sender]
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: (isRadja || isCastorice) ? '💖' : '🎀', key: m.key } });

        } catch (e) {
            console.error(e);
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *SYSTEM ERROR !* ❌` 
            }, { quoted: m });
        }
    }
}