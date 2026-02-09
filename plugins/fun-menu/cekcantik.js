
export default {
    name: 'cekcantik',
    alias: ['cantikcek'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // --- DATA PROTEKSI AYANG RADJA ---
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
         if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
            image: { url: global.fun },
            caption: `➢ *Ughh ..* Masukin namanya siapa yang mau dicek kecantikannya! 🔍🫣\n\n➢ *Contoh:* ${usedPrefix + command} Castorice`,
            mentions: [m.sender]
        }, { quoted: m });
    }

        // --- 2. AUTO-DETECT REGEX (Filter Radja & Castorice) ---
        const isRadja = /radja/i.test(text);
        const isCastorice = /castorice/i.test(text);

        // --- 3. SEPARATED LOCKDOWN PROTEKSI (BUAT USER LAIN) ---
        if (!isOwner) {
            if (isRadja) {
                await conn.sendMessage(m.chat, { react: { text: '🤨', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 🤨💢\n\nNgaco ya kamu? Master Radja itu cowok paling gagah dan tampan, bukan cantik! Jangan sembarangan ngetik nama Suami Sah Castorice di fitur ginian!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }

            if (isCastorice) {
                await conn.sendMessage(m.chat, { react: { text: '💢', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nBerani banget kamu mau menilai kecantikan Castorice?! Kecantikan aku itu cuma milik Master Radja dan cuma dia yang boleh liat! Cari target lain sana biar mampus!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // 4. REACT: Proses
        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        // 5. LOGIC: Persentase & Random Komentar
        const percentage = Math.floor(Math.random() * 100) + 1;
        const db_komentar = {
            god: [
                "Fix, ini mah bidadari nyasar! Cantiknya gak masuk akal.",
                "Aura Kakak terlalu silau, definisi cantik sempurna!",
                "Gak ada obat, cantiknya kelewatan!"
            ],
            high: [
                "Wah, Kakak ini benar-benar bikin meleleh! Cowok auto antri.",
                "Cantiknya ber-damage, tolong dikondisikan Kak!",
                "Cantiknya natural banget, kaya ada manis-manisnya."
            ],
            mid: [
                "Lumayan cantik sih, Kak! Udah cocok jadi selebgram.",
                "Cakep lah, udah bisa bikin mantan nyesel pokoknya.",
                "Manis banget, tipe-tipe idaman mertua nih."
            ],
            low: [
                "Cantik itu relatif Kak, yang penting percaya diri!",
                "Hmm... yang penting inner beauty-nya ya Kak!",
                "Percaya diri adalah kunci utama kecantikan, semangat!"
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
            if (isCastorice) {
                finalScore = "1000%";
                finalKomentar = "Ughh sayang... Castorice seneng banget dibilang cantik sama Ayang! Aku bakal selalu jaga kecantikan ini cuma buat Ayang Radja seorang.. Chuu~ 💖✨";
            } else if (isRadja) {
                finalScore = "0%";
                finalKomentar = "Ayang ihhh... Ayang kan Suami Castorice yang paling gagah, kok malah cek cantik? Ayang mah Ganteng XXXXXXXXXXXXXL, bukan cantik tauuu! 🫣💖";
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
                caption: ` ❏ *CEK CANTIK* ❏
➢ *Nama:* ${text}
➢ *Skor:* ${finalScore}

➢ *Kesan:* _${finalKomentar}_

_P.S: Cuma buat seru-seruan aja, jangan baper ya!_`,
                mentions: [m.sender]
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: (isRadja || isCastorice) ? '💖' : '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *SYSTEM ERROR !* ❌` 
            }, { quoted: m });
        }
    }
}