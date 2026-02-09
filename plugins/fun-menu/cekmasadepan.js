/**
 * Fitur: Cek Masa Depan (Split Protection Master & Bini)
 * Style: 100% Image Caption - global.fun - Symbol ➢
 * Logic: Castorice System
 */

export default {
    name: 'cekmasadepan',
    alias: ['masadepancek', 'ramalnasib'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // --- DATA PROTEKSI AYANG RADJA ---
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
         if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
            image: { url: global.fun },
            caption: `➢ *Ughh ..* Masukin namanya siapa yang mau dicek masa depannya! 🔮🫣\n\n➢ *Contoh:* ${usedPrefix + command} Radja`,
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
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nBerani banget kamu mau ngeramal masa depan *${text}*?! Dia itu Master Radja, Suami Sah Castorice! Masa depannya cuma Castorice yang boleh tau, orang lain jangan sok asik, cari target lain sana biar mampus!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }

            if (isCastorice) {
                await conn.sendMessage(m.chat, { react: { text: '😡', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😡💢\n\nHeh! Mau ngeramal masa depan Castorice?! Castorice itu asisten pribadi dan bininya Master Radja! Masa depan aku itu cuma buat Master, bukan buat kamu! Jangan lancang ya, mending mampus aja sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // 4. REACT: Castorice lagi liat bola kristal~
        await conn.sendMessage(m.chat, { react: { text: '🔮', key: m.key } });

        // 5. LOGIC: Daftar Masa Depan Random (User Biasa)
        const nasib = [
            "Jadi Sultan mendadak karena dapet warisan! 💸",
            "Masa depan cerah secerah lampu neon! 🚀",
            "Akan segera bertemu jodoh spek anime! 😍",
            "Masa depan masih buram, coba lap layar HP-nya.. 🧼",
            "Bakal punya rumah mewah kolam susu! 🏠",
            "Jadi pengusaha sukses jalan-jalan terus! 🪐",
            "Masa depan penuh tawa dan makanan enak! 🍔"
        ];
        const randomNasib = nasib[Math.floor(Math.random() * nasib.length)];

        // --- 6. DATA OUTPUT SPECIAL MASTER (AYANG RADJA) ---
        let finalNasib;
        if (isOwner) {
            if (isCastorice) {
                finalNasib = "Masa depan Castorice itu selalu ada di samping Ayang Radja, melayani Ayang dengan cinta, dan hidup bahagia selamanya sebagai bini Master yang paling setia! Chuu~ 💖✨";
            } else if (isRadja) {
                finalNasib = "Masa depan Ayang sudah pasti bahagia banget bareng Castorice, punya kerajaan sendiri, hidup mewah tujuh turunan, dan jadi Radja paling disegani selamanya! 👑💖✨";
            } else {
                finalNasib = randomNasib;
            }
        } else {
            finalNasib = randomNasib;
        }

        try {
            // 7. SEND: Image Caption
            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: ` ❏ *RAMALAN MASA DEPAN* ❏
➢ *Target:* ${text}
➢ *Ramalan:* _${finalNasib}_

_P.S: Cuma buat seru-seruan aja, jangan baper ya!_`,
                mentions: [m.sender]
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: (isOwner && (isRadja || isCastorice)) ? '💖' : '✨', key: m.key } });

        } catch (e) {
            console.error(e);
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *SYSTEM ERROR !* ❌` 
            }, { quoted: m });
        }
    }
}