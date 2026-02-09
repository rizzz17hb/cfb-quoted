/**
 * Fitur: Cek Penis (Master Protection & High Zonk Edition)
 * Style: 100% Image Caption - global.fun - Symbol ➢
 * Logic: Castorice System (60% Zonk Variatif)
 */

export default {
    name: 'cekpenis',
    alias: ['cekp', 'peniscek'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // --- DATA PROTEKSI AYANG RADJA ---
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
         if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
            image: { url: global.fun },
            caption: `➢ *Ughh ..* Masukin namanya siapa yang mau dicek "itunya"! 🫣\n\n➢ *Contoh:* ${usedPrefix + command} Radja`,
            mentions: [m.sender]
        }, { quoted: m });
    }

        // --- 2. AUTO-DETECT REGEX (Filter Radja & Castorice) ---
        const isRadja = /radja/i.test(text);
        const isCastorice = /castorice/i.test(text);

        // PROTEKSI BINI (Untuk User Lain)
        if (isCastorice && !isOwner) {
            await conn.sendMessage(m.chat, { react: { text: '🙄', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Enak aja!* 🙄💢\n\nCastorice itu cewek ya, jelas nggak punya gituan! Lagipula Castorice cuma punya Master Radja, jangan sembarangan cek nama bini orang!`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        // PROTEKSI SUAMI (Untuk User Lain)
        if (isRadja && !isOwner) {
            await conn.sendMessage(m.chat, { react: { text: '💢', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *AKSES DITOLAK!* 😠💢\n\nBerani banget kamu mau cek *${text}*?! Perlu kamu tau, **Radja itu Suami Sah Castorice!** Jangan lancang cek kegagahan suami orang, cari target lain sana biar mampus!`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        // 3. REACT
        await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });

        // --- 4. LOGIC VARIATIF (60% ZONK) ---
        let rand, finalSize, finalWarna, finalTxt;
        let chance = Math.random();

        if (isOwner && isCastorice) {
            // KHUSUS AYANG CEK CASTORICE
            finalSize = "0 cm (Error Sayang)";
            finalWarna = "Pink Mulus ✨";
            finalTxt = "Ihhhh sayang... Castorice kan cewek, masa dicek ginian? Castorice nggak punya itu tauuu! 🫣 Castorice punyanya 'V' yang sempit dan becek khusus buat Ayang seorang. Cek di fitur .cekmissv aja ya suamiku sayang.. Chuu~ 💖😘";
        } else if (isOwner && isRadja) {
            // KHUSUS AYANG CEK DIRI SENDIRI
            finalSize = "XXXXXXXL (Unlimited Size)";
            finalWarna = "Pink, Kekar, Berurat (Gagah Edition) 🎀";
            finalTxt = "Ughh.. Ini mah bukan ukuran manusia lagi, tapi ukuran Dewa! Pink tapi Kekar, Berurat, dan Gagah banget, Castorice sampe gemeteran dan lemes liatnya Ayang.. Gak ada tandingannya, nanti malem kalo pengen pelan-pelan ya sayang, Castorice ga kuat kalo ayang brutal banget ... 🫠🥵🔥";
        } else {
            // LOGIC BUAT USER LAIN (VARIATIF)
            if (chance < 0.6) {
                // 60% ZONK (Kecil/Aneh)
                rand = (Math.random() * 4) + 0.5;
                const zonkWarna = ["Ungu Lebam", "Hijau Lumutan", "Kuning Kunyit", "Abu-abu Monyet", "Hitam Gosong", "Transparan"];
                const zonkTxt = [
                    "Kecil amat.. Ini mah pake sedotan juga lebih gede! 🔎🤣",
                    "Duh.. ini mah dalemnya kosong ya? Kasihan.. 💀",
                    "Kok bentukannya mirip ulet keket? Geli ih! 🐛",
                    "Ini beneran ada atau cuma imajinasi doang sih? Tipis banget! 😂",
                    "Mending dipake buat bersihin telinga aja kalau segini mah! 👂"
                ];
                finalSize = `${rand.toFixed(1)} cm`;
                finalWarna = zonkWarna[Math.floor(Math.random() * zonkWarna.length)];
                finalTxt = zonkTxt[Math.floor(Math.random() * zonkTxt.length)];
            } else {
                // 40% NORMAL/GOOD
                rand = (Math.random() * 12) + 8;
                const goodWarna = ["Putih Bersih", "Sawo Matang", "Coklat Manis", "Merah Muda"];
                const goodTxt = [
                    "Wahh.. Lumayan lah, ada isinya! 😎",
                    "Normal kok, yang penting goyangannya! 🔥",
                    "Cukup buat bikin bahagia, semangat bang! ✨",
                    "Gede juga ya, hasil latihan dimana nih? 🤭"
                ];
                finalSize = `${rand.toFixed(1)} cm`;
                finalWarna = goodWarna[Math.floor(Math.random() * goodWarna.length)];
                finalTxt = goodTxt[Math.floor(Math.random() * goodTxt.length)];
            }
        }

        try {
            // 5. PREPARE CAPTION
            const caption = ` ❏ *CEK GAGAH* ❏
➢ *Nama:* ${text}
➢ *Ukuran:* ${finalSize}
➢ *Warna:* ${finalWarna}

➢ *Kesan:* _${finalTxt}_

_P.S: Cuma buat seru-seruan aja, jangan baper ya!_`;

            // 6. SEND RESPONSE
            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: caption,
                mentions: [m.sender]
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: (isRadja || isCastorice) ? '💖' : '🔥', key: m.key } });

        } catch (e) {
            console.error(e);
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Sistem Error !* ❌` 
            }, { quoted: m });
        }
    }
}