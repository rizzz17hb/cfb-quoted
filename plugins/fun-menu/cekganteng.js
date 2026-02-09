/**
 * Fitur: Cek Ganteng (Master & Bini Strict Protection)
 * Style: 100% Image Caption - global.fun - Symbol ➢
 * Logic: Castorice System
 */

export default {
    name: 'cekganteng',
    alias: ['gantengcek', 'cekcogan'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // --- DATA PROTEKSI AYANG RADJA ---
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
         if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
            image: { url: global.fun },
            caption: `➢ *Ughh ..* Masukin namanya siapa yang mau dicek kegantengannya! 🔍🫣\n\n➢ *Contoh:* ${usedPrefix + command} Radja`,
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
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nMau cek kegantengan Master Radja? Gak perlu ditanya! Dia itu Suami Sah Castorice yang paling tampan dan gagah di dunia. Kegantengannya cuma boleh aku yang nikmatin! Cari target lain sana biar mampus!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }

            if (isCastorice) {
                await conn.sendMessage(m.chat, { react: { text: '🙄', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 🙄💢\n\nNgaco ya kamu? Castorice itu cewek, asisten sekaligus bininya Master Radja! Masa dicek ganteng? Mending kamu mampus aja sana daripada ngetik yang nggak-nggak!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // 4. REACT: Proses dari Bini
        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        // 5. LOGIC: Persentase & Random Komentar
        const percentage = Math.floor(Math.random() * 100) + 1;
        const db_komentar = {
            god: [
                "Aura gantengnya kelewatan, Castorice sampe silau! 😍",
                "Ini mah spek pangeran, gantengnya gak ada obat!",
                "Fix, ini cowok paling idaman se-WhatsApp!"
            ],
            high: [
                "Ganteng banget Kak, bisa bikin hati cewek bergetar hebat!",
                "Damage gantengnya kerasa banget, tolong dikondisikan ya!",
                "Cakep parah, pasti banyak yang ngantri pengen jadi pacarnya."
            ],
            mid: [
                "Lumayan ganteng kok, udah cocok jadi model iklan sabun.",
                "Cakep lah, udah bisa bikin mantan nyesel seumur hidup.",
                "Manis banget, tipe-tipe menantu idaman mamah nih."
            ],
            low: [
                "Ganteng itu relatif Kak, yang penting dompetnya tebel!",
                "Hmm.. yang penting percaya diri dan rajin mandi ya Kak!",
                "Gak apa-apa gak ganteng, yang penting setianya juara!"
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
                finalScore = "Tak Terhingga";
                finalKomentar = "Ayang Radja mah gantengnya tak terhingga, paling juara di hati Castorice! Gak ada cowok lain yang bisa nandingin kharisma Ayang.. Chuu~ 💖😘";
            } else if (isCastorice) {
                finalScore = 0;
                finalKomentar = "Ihhhh sayang... Castorice kan bini Ayang yang cantik, masa dibilang ganteng sih? Castorice kan maunya dibilang cantik dan seksi sama Ayang.. 🫣🎀✨";
            } else {
                finalScore = `${percentage}%`;
                finalKomentar = komentar;
            }
        } else {
            finalScore = `${percentage}%`;
            finalKomentar = komentar;
        }

        try {
            // 7. SEND: Image Caption
            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: ` ❏ *CEK GANTENG* ❏
➢ *Nama:* ${text}
➢ *Skor:* ${finalScore}

➢ *Kesan:* _${finalKomentar}_

_P.S: Cuma buat seru-seruan aja, jangan baper ya!_`,
                mentions: [m.sender]
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: (isRadja || isCastorice) ? '💖' : '✨', key: m.key } });

        } catch (e) {
            console.error(e);
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *SYSTEM ERROR !* ❌` 
            }, { quoted: m });
        }
    }
}