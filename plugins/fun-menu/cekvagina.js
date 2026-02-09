/**
 * Fitur: Cek Miss V (Strict Protection & Gender Logic)
 * Style: 100% Image Caption - global.fun - Symbol ➢
 * Logic: Castorice System (Auto-Detect Gender & Husband Protection)
 */

export default {
    name: 'cekmissv',
    alias: ['cekv', 'missvcek', 'cekapem'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // --- DATA PROTEKSI AYANG RADJA ---
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
         if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
            image: { url: global.fun },
            caption: `➢ *Ughh ..* Masukin namanya cewek siapa yang mau dicek "itunya"! 🫣\n\n➢ *Contoh:* ${usedPrefix + command} Siti`,
            mentions: [m.sender]
        }, { quoted: m });
    }

        // --- 2. AUTO-DETECT REGEX (Filter Radja & Castorice) ---
        const isRadja = /radja/i.test(text);
        const isCastorice = /castorice/i.test(text);

        // PROTEKSI CASTORICE (Untuk User Lain)
        if (isCastorice && !isOwner) {
            await conn.sendMessage(m.chat, { react: { text: '💢', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *AKSES DITOLAK!* 😠💢\n\nBerani-beraninya kamu mau cek *${text}*?! Itu cuma punya Master Radja! Sana cari target lain, jangan ganggu bini orang!`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        // 3. REACT
        await conn.sendMessage(m.chat, { react: { text: '🍑', key: m.key } });

        // 4. LOGIC UMUM (60% Zonk Variatif)
        let chance = Math.random();
        let kedalaman, tipe, aroma, txt;

        if (chance < 0.6) {
            kedalaman = (Math.random() * 4) + 1;
            tipe = ["Gersang & Tandus", "Hutan Belantara", "Gua Hantu", "Kering Kerontang", "Pintu Koboi"];
            aroma = ["Ikan Asin", "Terasi Udang", "Kaus Kaki", "Minyak Kayu Putih"];
            txt = "Aduh.. tolong dirawat lagi ya, pantesan gak ada yang betah! 😭🤣";
        } else {
            kedalaman = (Math.random() * 10) + 10;
            tipe = ["Becek Manja", "Pinky Girl", "Mulus Kinclong", "V-Premium", "Sempit Menggigit"];
            aroma = ["Stroberi", "Vanila", "Permen Karet", "Bunga Melati"];
            txt = "Wahh.. ini mah idaman banget, bikin cowok lupa jalan pulang! 😋✨";
        }

        // --- 5. DATA OUTPUT SPECIAL (MASTER & BINI) ---
        let resDepth, resTipe, resAroma, resPesan;

        if (isRadja) {
            // JIKA ADA YANG CEK NAMA RADJA DI FITUR V
            resDepth = "0 cm (Error)";
            resTipe = "Bukan Cewek! 🛡️";
            resAroma = "Wangi Suami Idaman 😎";
            resPesan = isOwner 
                ? "Ihhhh sayang... Ayang kan Suami Castorice yang paling gagah sedunia, kok malah cek Miss V pake nama sendiri? Ayang mah punyanya yang **Gagah XXXXXXXXXXXXXL**, bukan punya ginian tauu! Nanti malem mending pake yang gagah itu aja buat muasin Castorice.. 🫣💖" 
                : "MAMPUS SANA! Berani banget cek Miss V pake nama Radja? Dia itu **SUAMI SAH** Castorice, cowok paling gagah! Jangan lancang atau aku suruh Master ban kamu dari bot ini! 😠💢";
        } else if (isCastorice && isOwner) {
            // KHUSUS AYANG CEK CASTORICE
            resDepth = "Kedalaman Surgawi (Pas buat XXXXXXXXXXXXXL Ayang)";
            resTipe = "Pink, Sempit, Menggigit, & Banjir Bandang 🌊💖";
            resAroma = "Wangi Parfum Mahal & Kasturi Surga ✨";
            resPesan = "Ughh.. Ayang Radja sayang, Castorice udah nggak tahan nih! Punya Castorice cuma spesial buat Ayang. Selalu becek dan siap nerima kegagahan Ayang kapan aja. Nanti malem jangan kasih ampun ya suamiku, habisin Castorice di kasur sampe lemes.. Chuu~ Love you Master! 🫠🥵🔥";
        } else {
            // HASIL NORMAL UNTUK USER LAIN
            resDepth = `${kedalaman.toFixed(1)} cm`;
            resTipe = tipe[Math.floor(Math.random() * tipe.length)];
            resAroma = aroma[Math.floor(Math.random() * aroma.length)];
            resPesan = txt;
        }

        try {
            const caption = ` ❏ *CEK KEINDAHAN V* ❏
➢ *Nama:* ${text}
➢ *Kedalaman:* ${resDepth}
➢ *Tipe:* ${resTipe}
➢ *Aroma:* ${resAroma}

➢ *Kesan:* _${resPesan}_

_P.S: Cuma buat seru-seruan aja, jangan baper ya!_`;

            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: caption,
                mentions: [m.sender]
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: (isCastorice || isRadja) ? '💖' : '✨', key: m.key } });

        } catch (e) {
            console.error(e);
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Sistem Error !* ❌` 
            }, { quoted: m });
        }
    }
}