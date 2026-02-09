/**
 * Fitur: Cek Kejomokan (Master & Bini Strict Protection)
 * Style: 100% Image Caption - global.fun - Symbol ➢
 * Logic: Castorice System
 */

export default {
    name: 'cekjomok',
    alias: ['jomokcek', 'berapa-jomok'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // --- DATA PROTEKSI AYANG RADJA ---
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
         if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
            image: { url: global.fun },
            caption: `➢ *Ughh ..* Masukin namanya siapa yang mau dianalisis tingkat jomoknya! 🤨🫣\n\n➢ *Contoh:* ${usedPrefix + command} Radja`,
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
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nNgaco! Master Radja itu cowok paling gagah dan lurus sedunia, nggak ada jomok-jomoknya! Jangan lancang ya ngetik nama Suami Sah Castorice di fitur ginian, cari target lain sana biar mampus!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }

            if (isCastorice) {
                await conn.sendMessage(m.chat, { react: { text: '😡', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😡💢\n\nEnak aja! Castorice itu bini Master Radja, cewek tulen yang setia. Mana ada Castorice jomok? Cari masalah banget kamu, mending mampus aja sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // 4. REACT: Castorice agak kaget dikit
        await conn.sendMessage(m.chat, { react: { text: '🤨', key: m.key } });

        // 5. LOGIC: Persentase & Random Komentar Jomok
        const percentage = Math.floor(Math.random() * 100) + 1;
        const db_komentar = {
            god: [
                "ASTAGA! Ini mah Rajanya Jomok, tolong jauh-jauh dari saya! 💀",
                "Fix, level jomok kamu sudah mencapai batas maksimal duniawi!",
                "Sudah tidak tertolong, aura jomoknya menembus layar HP!"
            ],
            high: [
                "Aura jomoknya kuat banget, mencurigakan ya tingkahnya..",
                "Waduh, dikit lagi sah jadi member jomok abadi nih!",
                "Kurangi nonton yang aneh-aneh Kak, jomoknya udah keliatan banget!"
            ],
            mid: [
                "Ada bakat jomok dikit sih, tapi masih bisa tobat kok.",
                "Setengah normal, setengah jomok. Labil banget kayak perasaannya.",
                "Hmm.. jomoknya tipis-tipis, kayak bumbu micin."
            ],
            low: [
                "Masih waras kok, aura jomoknya hampir nggak kelihatan.",
                "Aman! Kamu orang normal paling membosankan sedunia.",
                "Gak ada bakat jomok sama sekali, belajar lagi ya!"
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
                finalScore = 0;
                finalKomentar = "Ayang Radja mah cowok paling normal dan gagah, nggak ada jomok-jomoknya sama sekali di mata Castorice! Ayang itu idaman semua wanita, tapi cuma punya Castorice seorang.. Chuu~ 💖🔥";
            } else if (isCastorice) {
                finalScore = 0;
                finalKomentar = "Ihhhh sayang... Castorice kan bini Ayang yang cantik, nggak ada jomok-jomoknya tauuu! Castorice mah cuma mau 'main' sama Ayang aja nanti malam.. 🫣🎀😘";
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
                caption: ` ❏ *CEK KEJOMOKAN* ❏
➢ *Nama:* ${text}
➢ *Skor:* ${finalScore}%

➢ *Kesan:* _${finalKomentar}_

_P.S: Cuma buat seru-seruan aja, jangan baper ya!_`,
                mentions: [m.sender]
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: (isRadja || isCastorice) ? '💖' : '📸', key: m.key } });

        } catch (e) {
            console.error(e);
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *SYSTEM ERROR !* ❌` 
            }, { quoted: m });
        }
    }
}