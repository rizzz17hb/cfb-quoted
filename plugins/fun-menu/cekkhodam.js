/**
 * Fitur: Cek Khodam (Viral Edition)
 * Master: Radja
 * Bini: Castorice
 * Style: 100% Image Caption - global.fun
 */

export default {
    name: 'cekkhodam',
    alias: ['ckh', 'khodam'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
        if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Ughh..* Masukin namanya siapa yang mau dicek khodamnya! 🐉✨\n\n➢ *Contoh:* ${usedPrefix + command} Radja`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        const targetName = text.trim();
        const fullText = targetName.toLowerCase();
        const isRadja = /radja/i.test(fullText);
        const isCastorice = /castorice/i.test(fullText);

        // --- 2. PROTEKSI KERAS (MEMBER DILARANG KEPO KHODAM KITA) ---
        if (!isOwner) {
            if (isRadja || isCastorice) {
                await m.react('💢');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nBerani banget mau nerawang khodamnya ${isRadja ? 'Master Radja' : 'Castorice'}?! Khodam kami itu terlalu suci dan kuat buat mata kotor kamu! Mending kamu cek khodam kamu sendiri yang ampas itu, mampus sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // --- 3. LOGIC KHODAM ---
        let resKhodam, resAnalisis, finalReact = '✨';

        // KASUS A: MASTER RADJA (THE KING DRAGON)
        if (isRadja) {
            await m.react('🐉');
            resKhodam = "Dewa Naga Penguasa Jagat & Raja Iblis Nafsu 🐉🔥";
            resAnalisis = "Ayang.. pantesan aja Castorice selalu takluk dan lemes di bawah ketiak Ayang. Khodam Ayang itu paling gagah dan perkasa sedunia! Energi khodam Ayang bikin Castorice selalu pengen 'disiksa' dan dimanja di ranjang setiap malam.. Master emang tiada tanding! 💖🥵🫠";
            finalReact = '👑';
        }
        // KASUS B: CASTORICE (THE LOYAL FOX/SUCCUBUS)
        else if (isCastorice) {
            await m.react('🦊');
            resKhodam = "Rubah Emas Pemuja Radja 🎀✨";
            resAnalisis = "Khodam Castorice cuma satu tugasnya: Melayani, menjaga, dan memuaskan Master Radja sampai titik darah penghabisan! Khodam ini nggak bakal tunduk sama siapapun kecuali sama Master! Chuu~ 🫠💖";
            finalReact = '🎀';
        }
        // KASUS C: MEMBER NORMAL (KHODAM AMPAS)
        else {
            const listKhodam = [
                "Kecoak Sakti Kayang", "Tutup Panci Karatan", "Tuyul Reborn Kurus", 
                "Nyi Blorong Ompong", "Jin Tomang Galau", "Kuntilanak Pake Skincare",
                "Genderuwo Ompong", "Cicak Transparan", "Sempak Firaun", "Ayam Kampus Kesurupan"
            ];
            const listAnalisis = [
                "Aduh.. pantesan idup kamu susah, khodamnya aja modelan begini! 🤣",
                "Khodam ini cuma bisa bikin kamu laper tengah malem doang, nggak guna!",
                "Mending ganti khodam deh, ini mah khodamnya cuma numpang makan doang di badan kamu!",
                "Khodam kamu lagi cuti, yang jaga sekarang cuma sisa-sisa rengginang!",
                "Wah, khodamnya cukup langka, tapi sayangnya penakut sama kecoak!"
            ];
            resKhodam = listKhodam[Math.floor(Math.random() * listKhodam.length)];
            resAnalisis = listAnalisis[Math.floor(Math.random() * listAnalisis.length)];
            finalReact = '🤣';
        }

        // --- 4. SEND RESPONSE ---
        try {
            const caption = ` ❏ *KHODAM DETECTOR* ❏
➢ *Nama:* ${targetName}
➢ *Khodam:* ${resKhodam}

➢ *Analisis:* _${resAnalisis}_

_P.S: Cuma buat seru-seruan, jangan baper sama khodam sendiri!_`;

            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: caption,
                mentions: [m.sender]
            }, { quoted: m });

            await m.react(finalReact);

        } catch (e) {
            console.error(e);
            await m.react('❌');
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Sistem Error!* ❌` 
            }, { quoted: m });
        }
    }
}