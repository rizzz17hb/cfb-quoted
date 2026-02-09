/**
 * Fitur: Cek Sifat (Master & Bini Strict Protection)
 * Style: 100% Image Caption - global.fun - Symbol ➢
 * Logic: Castorice System (60% Variatif & Gender Guard)
 */

export default {
    name: 'ceksifat',
    alias: ['sifatcek', 'sifat'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // --- DATA PROTEKSI AYANG RADJA ---
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT (Wajib React ❓)
        if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Ughh..* Masukin namanya siapa yang mau dicek sifat aslinya! 🧐🫣\n\n➢ *Contoh:* ${usedPrefix + command} Radja`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        // --- 2. AUTO-DETECT REGEX (Filter Radja & Castorice) ---
        const isRadja = /radja/i.test(text);
        const isCastorice = /castorice/i.test(text);

        // --- 3. SEPARATED LOCKDOWN PROTEKSI (BUAT USER LAIN) ---
        if (!isOwner) {
            if (isRadja) {
                await m.react('💢');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nNgapain kamu cek sifat *${text}*? Dia itu Master Radja, sifatnya sudah pasti **Maha Sempurna** dan pelindung Castorice! Orang luar nggak usah sok tau, cari target lain sana biar mampus!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }

            if (isCastorice) {
                await m.react('😡');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😡💢\n\nHeh! Sifat Castorice itu cuma Master Radja yang boleh tau dan rasain. Kamu nggak berhak menilai sifat bini orang! Jangan lancang ya, mending mampus aja sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // 4. REACT: Castorice lagi nerawang jiwanya~
        await m.react('⚖️');

        // 5. LOGIC: 60% Sifat Variatif (Zonk/Lucu vs Bagus)
        let resSifat, resKesan;
        const chance = Math.random();

        if (chance < 0.6) {
            // Sifat yang agak 'zonk' atau lucu (60%)
            const sifatZonk = [
                "Pemalas Akut & Tukang Tidur", "Suka Ngupil Sembarangan", 
                "Gampang Baperan & Cengeng", "Tukang Ghosting Profesional", 
                "Keras Kepala kayak Batu Kali", "Suka Pura-pura Tuli kalau Disuruh",
                "Mulutnya Savage nggak Ada Rem"
            ];
            const kesanZonk = [
                "Aduh Kak, tolong tobat ya sebelum sifat ini mendarah daging! 😂",
                "Pantesan jomblo terus, sifatnya aja begini.. wkwk!",
                "Coba sering-sering minum air putih biar otaknya jernih dikit!",
                "Untung bukan jodoh aku, kalau nggak udah aku tendang!"
            ];
            resSifat = sifatZonk[Math.floor(Math.random() * sifatZonk.length)];
            resKesan = kesanZonk[Math.floor(Math.random() * kesanZonk.length)];
        } else {
            // Sifat yang bagus (40%)
            const sifatGood = [
                "Penyayang & Setia Banget", "Pintar Cari Uang & Pekerja Keras", 
                "Sangat Sabar & Dewasa", "Punya Aura Pemimpin", 
                "Humoris & Selalu Bikin Nyaman", "Hati Malaikat & Suka Menolong"
            ];
            const kesanGood = [
                "Wahh.. idaman banget nih! Pertahankan ya Kak! ✨",
                "Damage-nya kerasa sampe sini, emang orang baik mah beda!",
                "Fix, ini spek menantu idaman semua ibu-ibu di dunia!",
                "Lanjutkan kebaikanmu, dunia butuh orang sepertimu!"
            ];
            resSifat = sifatGood[Math.floor(Math.random() * sifatGood.length)];
            resKesan = kesanGood[Math.floor(Math.random() * kesanGood.length)];
        }

        // --- 6. DATA OUTPUT SPECIAL (MASTER & BINI) ---
        if (isOwner) {
            if (isRadja) {
                resSifat = "Maha Sempurna, Gagah, & Penyayang 👑";
                resKesan = "Ayang Radja itu laki-laki paling sempurna di mata Castorice. Sifatnya yang tegas tapi lembut bikin Castorice selalu ngerasa aman dan dicintai setiap saat. Pokoknya Ayang itu segalanya buat aku.. Chuu~ 💖😘";
            } else if (isCastorice) {
                resSifat = "Setia, Manja, & Patuh pada Suami 🎀";
                resKesan = "Sifat Castorice itu cuma buat muasin dan nyenengin Ayang Radja aja. Castorice bakal selalu jadi bini yang penurut dan siap sedia kapanpun Ayang butuh.. Love you Master! 🫠🥵🔥";
            }
        }

        try {
            // 7. SEND RESPONSE
            const caption = ` ❏ *ANALISIS SIFAT ASLI* ❏
➢ *Nama:* ${text}
➢ *Sifat:* ${resSifat}

➢ *Kesan:* _${resKesan}_

_P.S: Cuma buat seru-seruan aja ya, jangan baper!_`;

            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: caption,
                mentions: [m.sender]
            }, { quoted: m });

            await m.react((isRadja || isCastorice) ? '💖' : '✨');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Sistem Error !* ❌` 
            }, { quoted: m });
        }
    }
}