import fetch from 'node-fetch';
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'gachawuwa',
    alias: ['wuwa', 'pull', 'pullwuwa'],
    category: 'anime',
    exec: async ({ conn, m, command, usedPrefix }) => {
        
        await m.react('⏱️');
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        try {
            // 1. Fetch Database
            const rawJsonUrl = 'https://raw.githubusercontent.com/cgnbajoel-cyber/backup/main/database_gacha.json'; 
            const response = await fetch(rawJsonUrl);
            if (!response.ok) throw new Error(`Gagal akses database (Status: ${response.status})`);
            const characters = await response.json();

            // 2. Logika Gacha
            let rand = Math.random() * 100;
            let rarity = rand <= 2 ? 5 : 4; 
            let pool = characters.filter(c => c.rarity === rarity);
            if (pool.length === 0) pool = characters;
            const char = pool[Math.floor(Math.random() * pool.length)];

            // 3. FILTER DESKRIPSI (Bersihkan Enter)
            const cleanDescription = char.description
                .replace(/\n+/g, ' ') 
                .replace(/\s\s+/g, ' ')
                .trim();

            // 4. AUTO TRANSLATE (English to Indonesian)
            let indoDesc = cleanDescription;
            try {
                const trUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(cleanDescription)}`;
                const trRes = await fetch(trUrl);
                const trJson = await trRes.json();
                indoDesc = trJson[0].map(item => item[0]).join('');
            } catch (trErr) {
                console.error('Translate Error:', trErr);
                // Kalau gagal translate, bakal tetep pake bahasa inggris (fallback)
            }

            // 5. Fetch Gambar
            const imageUrl = `https://raw.githubusercontent.com/cgnbajoel-cyber/backup/main/${char.image}`;
            const imgRes = await fetch(imageUrl);
            if (!imgRes.ok) throw new Error("Gambar karakter tidak ditemukan.");
            const imageBuffer = await imgRes.buffer();

            // 6. Prepare Media
            const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });

            // 7. Rangkai Body Text (Model List Bot Suamiku)
            const bodyText = `ＷＵＴＨＥＲＩＮＧ ＷＡＶＥＳ ✅

 \`\`\`➢ Nama     : ${char.name}\`\`\`
 \`\`\`➢ Rarity   : ${char.rarity}★\`\`\`
 \`\`\`➢ Elemen   : ${char.element}\`\`\`
 \`\`\`➢ Senjata  : ${char.weapon}\`\`\`

📖 ➢ *Deskripsi (ID):*
\`\`\`${indoDesc}\`\`\`

✨ ➢ *Skills:*
\`\`\`${char.skills.length > 0 ? char.skills.join(', ') : '-'}\`\`\``.trim();

            // 8. Struktur Interactive Message
            const interactiveMessage = {
                header: {
                    title: `Ｃ Ａ Ｓ Ｔ Ｏ Ｒ Ｉ Ｃ Ｅ`,
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                },
                body: { text: bodyText },
                footer: { text: global.footer },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "🔁 Gᗩᑕᕼᗩ ᒪᗩGI", 
                            id: `${usedPrefix}${command}` 
                        })
                    }]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id, quoted: fake });
            
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react(char.rarity === 5 ? '🌟' : '✅');

        } catch (e) {
            console.error('WuWa Error:', e);
            await m.react('❌');
            return conn.sendMessage(m.chat, { 
                image: { url: global.anime },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nAlasan: ${e.message}` 
            }, { quoted: fail });
        }
    }
};