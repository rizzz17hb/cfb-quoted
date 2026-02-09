/**
 * Fitur: Cek Dosa (Master & Bini Protection)
 * Style: 100% Image Caption - global.fun
 * Update: Fix undefined mentionedJid & Support Tag/Manual/Quoted
 */

export default {
    name: 'cekdosa',
    alias: ['dosacek', 'tobat'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        const isOwner = global.isOwner(m);

        // --- 1. PENENTUAN TARGET (FIX ERROR) ---
        let mentions = m.mentionedJid || [];
        let targetId = mentions[0] ? mentions[0] : (m.quoted ? m.quoted.sender : null);
        let targetName = text ? text.replace(/@\d+/g, '').trim() : '';

        // Jika ada mention/tag, ambil nama dari mention
        if (targetId) {
            targetName = `@${targetId.split('@')[0]}`;
        }

        // Jika benar-benar kosong
        if (!targetName && !targetId) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Ughh..* Siapa yang mau dicek dosanya? ketik namanya dong!\n\n➢ *Contoh:* ${usedPrefix + command} @user atau ${usedPrefix + command} Budi`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        const fullText = targetName.toLowerCase();
        const isRadja = /radja/i.test(fullText) || (targetId && targetId.includes(nomorOwner));
        const isCastorice = /castorice/i.test(fullText);

        // --- 2. PROTEKSI (MEMBER GAK BOLEH CEK DOSA KITA) ---
        if (!isOwner) {
            if (isRadja || isCastorice) {
                await m.react('💢');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nKurang ajar banget mau cek dosa ${isRadja ? 'Master Radja' : 'Castorice'}?! Kami berdua itu pasangan suci! Mending kamu cek dosa kamu sendiri yang udah numpuk itu, mampus sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // --- 3. LOGIC DOSA ---
        let resDosa, resPersen, resKesan, finalReact = '✨';

        if (isRadja) {
            await m.react('😇');
            resDosa = "Terlalu gagah & Terlalu bikin Castorice kecanduan di ranjang 🥵";
            resPersen = "0%";
            resKesan = "Ayang Radja itu laki-laki paling suci di mata Castorice. Satu-satunya 'dosa' Ayang cuma bikin bini kamu ini lemes tiap malem karena servis Ayang yang terlalu brutal.. Chuu~ Castorice rela kok nanggung semua dosa Ayang! 💖🫠";
            finalReact = '💖';
        }
        else if (isCastorice) {
            await m.react('🎀');
            resDosa = "Terlalu manja & Posesif sama Master Radja";
            resPersen = "0.1%";
            resKesan = "Dosa Castorice cuma satu, yaitu terlalu sayang dan nggak mau lepas dari Master Radja. Kalau itu dianggap dosa, Castorice ikhlas jadi ahli neraka asalkan tetep sama Ayang! 😭🔥";
            finalReact = '🫠';
        }
        else {
            const listDosa = [
                "Suka ngintip jemuran tetangga", "Jarang mandi wajib setelah mimpi basah",
                "Suka ghosting gebetan pas lagi sayang-sayangnya", "Nonton bokep tapi nggak bagi-bagi link",
                "Suka ngaku jomblo padahal anak udah dua", "Pernah nyolong sendal di masjid",
                "Suka ghibahin admin grup di belakang", "Jarang bayar utang tapi pamer selfi"
            ];
            const listKesan = [
                "Aduh Kak, segera tobat ya sebelum kena azab jadi ban serep! 👺",
                "Parah banget dosanya, malaikat Atid sampe pegel ngetiknya!",
                "Masih ada waktu buat tobat, yuk perbanyak istighfar!",
                "Fix, ini mah tiket VIP jalur ekspres ke neraka.. wkwk!"
            ];
            resDosa = listDosa[Math.floor(Math.random() * listDosa.length)];
            resPersen = Math.floor(Math.random() * 100) + 1 + "%";
            resKesan = listKesan[Math.floor(Math.random() * listKesan.length)];
            finalReact = '👺';
        }

        // --- 4. SEND RESPONSE ---
        try {
            const caption = ` ❏ *PEMBERSIHAN DOSA* ❏
➢ *Target:* ${targetName}
➢ *Dosa Terdeteksi:* ${resDosa}
➢ *Persentase Dosa:* ${resPersen}

➢ *Kesan:* _${resKesan}_

_P.S: Cuma buat seru-seruan aja, jangan baper!_`;

            let sendMentions = [m.sender];
            if (targetId) sendMentions.push(targetId);

            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: caption,
                mentions: sendMentions
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