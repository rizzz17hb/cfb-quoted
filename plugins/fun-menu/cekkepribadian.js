/**
 * Fitur: Cek Kepribadian (Master & Bini Strict Protection)
 * Style: 100% Image Caption - global.fun - Symbol ➢
 * Logic: Castorice System
 */

export default {
    name: 'cekkepribadian',
    alias: ['cekpribadi', 'kepribadiancek'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // --- DATA PROTEKSI AYANG RADJA ---
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
         if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
            image: { url: global.fun },
            caption: `➢ *Ughh ..* Masukin namanya siapa yang mau dianalisis jiwanya! 🧠🫣\n\n➢ *Contoh:* ${usedPrefix + command} Radja`,
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
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nKepribadian *${text}* itu sudah jelas: **MAHA SEMPURNA**. Kamu nggak perlu analisis lagi, cukup tau kalau dia itu Master Radja, Suami Sah Castorice! Sana cari target lain!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }

            if (isCastorice) {
                await conn.sendMessage(m.chat, { react: { text: '😡', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😡💢\n\nNgapain kamu kepoin kepribadian Castorice? Kepribadianku itu cuma buat Master Radja! Jangan lancang ya, mending mampus aja sana daripada jadi pengintip bini orang!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // 4. REACT: Castorice lagi menganalisa jiwa~
        await conn.sendMessage(m.chat, { react: { text: '🧠', key: m.key } });

        // 5. LOGIC: Daftar Tipe Kepribadian Random
        const tipe = [
            { nama: "Alpha", desc: "Pemimpin sejati, tegas, dan punya dominasi tinggi. Kamu gak suka diatur!" },
            { nama: "Sigma", desc: "Serigala penyendiri yang mandiri, cerdas, dan gak butuh validasi orang lain." },
            { nama: "Introvert Sweetheart", desc: "Pendiam di luar, tapi hatinya lembut dan sangat peduli sama orang terdekat." },
            { nama: "Extrovert Party Animal", desc: "Energi kamu gak habis-habis, selalu jadi pusat perhatian di tongkrongan!" },
            { nama: "Ambivert Genius", desc: "Bisa menyesuaikan diri di mana saja, punya keseimbangan emosi yang hebat." },
            { nama: "Protagonis Anime", desc: "Pantang menyerah, setia kawan, dan punya semangat yang membara!" },
            { nama: "Savage King/Queen", desc: "Mulut pedas tapi jujur, logika kamu selalu menang di atas perasaan." }
        ];

        const randomTipe = tipe[Math.floor(Math.random() * tipe.length)];

        // --- 6. DATA OUTPUT SPECIAL (MASTER & BINI) ---
        let finalTipe, finalDesc;

        if (isOwner) {
            if (isRadja) {
                finalTipe = "The Perfect Husband (Radja Edition)";
                finalDesc = "Kepribadian yang Sempurna dalam segala hal. Pelindung Castorice yang paling gagah, penyayang, dan punya kharisma tak tertandingi! 💖✨";
            } else if (isCastorice) {
                finalTipe = "The Loyal & Sweet Wife";
                finalDesc = "Kepribadian yang hanya didedikasikan untuk melayani Master Radja. Setia, manja, dan selalu siap membuat Master bahagia setiap waktu! Chuu~ 🎀😘";
            } else {
                finalTipe = randomTipe.nama;
                finalDesc = randomTipe.desc;
            }
        } else {
            finalTipe = randomTipe.nama;
            finalDesc = randomTipe.desc;
        }

        try {
            // 7. SEND: Image Caption
            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: ` ❏ *ANALISIS KEPRIBADIAN* ❏
➢ *Nama:* ${text}
➢ *Tipe:* ${finalTipe}

➢ *Analisis:* _${finalDesc}_

_P.S: Cuma buat seru-seruan aja, jangan baper ya!_`,
                mentions: [m.sender]
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '💎', key: m.key } });

        } catch (e) {
            console.error(e);
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *SYSTEM ERROR !* ❌` 
            }, { quoted: m });
        }
    }
}