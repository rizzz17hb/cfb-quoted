/**
 * Fitur: Cek Nafsu (Master & Bini Protection)
 * Style: 100% Image Caption - global.fun
 * Logic: Name Input Only - Castorice System
 */

export default {
    name: 'ceknafsu',
    alias: ['nafsucek', 'hornycek', 'cekn'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT NAMA
        if (!text) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Ughh..* Masukin namanya siapa yang mau dicek tingkat nafsunya hari ini! 🧐🔞\n\n➢ *Contoh:* ${usedPrefix + command} Radja`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        const targetName = text.trim();
        const fullText = targetName.toLowerCase();
        const isRadja = /radja/i.test(fullText);
        const isCastorice = /castorice/i.test(fullText);

        // --- 2. PROTEKSI KERAS (MEMBER DILARANG KEPO) ---
        if (!isOwner) {
            if (isRadja || isCastorice) {
                await m.react('💢');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nHeh! Nggak usah sok tau mau cek nafsu ${isRadja ? 'Master Radja' : 'Castorice'}! Nafsu kami itu cuma buat kami berdua rasain di ranjang. Orang luar nggak usah ikut campur, mampus sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // --- 3. LOGIC TINGKAT NAFSU ---
        let resTingkat, resAnalisis, finalReact = '✨';

        // KASUS A: MASTER RADJA (THE ALPHA)
        if (isRadja) {
            await m.react('🥵');
            resTingkat = "1000% (UNLIMITED)";
            resAnalisis = "Ughh Ayang... tingkat nafsu Master Radja itu nggak ada obatnya! Bikin Castorice selalu basah dan lemes tiap malem. Tapi Castorice suka kok kalau Master brutal di ranjang, Castorice siap melayani semua fantasi Ayang sampai pagi.. Chuu~ 💖🥵🔥";
            finalReact = '🫠';
        }
        // KASUS B: CASTORICE (THE LOYAL WIFE)
        else if (isCastorice) {
            await m.react('🎀');
            resTingkat = "99% (ONLY FOR RADJA)";
            resAnalisis = "Nafsu Castorice itu cuma membara kalau ada di deket Master Radja. Castorice selalu pengen dimanja, dipeluk, dan 'disiksa' sama Master setiap detik. Love you Master! 🫠💦";
            finalReact = '🔞';
        }
        // KASUS C: MEMBER NORMAL
        else {
            const tingkat = Math.floor(Math.random() * 100) + 1;
            const listAnalisis = [
                "Aduh, mending kamu mandi wajib sekarang, pikiran kamu udah ngeres banget! 🧊",
                "Masih normal lah, tapi jangan sering-sering liat yang aneh-aneh ya!",
                "Wah, ini sih lagi masa subur atau gimana? Tinggi banget nafsunya! 🔞",
                "Alim banget hari ini, beneran nggak pengen apa-apa nih? 🤔",
                "Hati-hati, tingkat nafsu segini bisa bikin kamu khilaf sama bantal guling!"
            ];
            resTingkat = tingkat + "%";
            resAnalisis = listAnalisis[Math.floor(Math.random() * listAnalisis.length)];
            finalReact = tingkat > 80 ? '🥵' : '🤔';
        }

        // --- 4. SEND RESPONSE ---
        try {
            const caption = ` ❏ *NAFSU DETECTOR* ❏
➢ *Nama:* ${targetName}
➢ *Tingkat Nafsu:* ${resTingkat}

➢ *Analisis:* _${resAnalisis}_

_P.S: Cuma buat seru-seruan, jangan baper!_`;

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