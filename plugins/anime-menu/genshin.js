import fetch from 'node-fetch';
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

// Database Pity sederhana (disimpan di memori)
let gachaPity = {};

export default {
    name: 'gachagenshin',
    alias: ['genshin', 'pullgi', 'gi'],
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
            // 1. Ambil Database dari Repo Backup kamu
            const dbUrl = 'https://raw.githubusercontent.com/cgnbajoel-cyber/backup/main/database_gacha_genshin.json';
            const res = await fetch(dbUrl);
            if (!res.ok) throw new Error("Gagal akses database repo.");
            const database = await res.json();

            // 2. Sistem Pity (10 Pull Guarantee)
            if (!gachaPity[m.sender]) gachaPity[m.sender] = 0;
            gachaPity[m.sender]++;

            let isRateUp = false;
            if (gachaPity[m.sender] >= 10) {
                isRateUp = true; // Jaminan Bintang 5
                gachaPity[m.sender] = 0; // Reset Pity
            } else {
                isRateUp = Math.random() < 0.1; // Peluang normal 10%
                if (isRateUp) gachaPity[m.sender] = 0; // Reset kalau hoki sebelum 10 pull
            }

            // 3. Filter Pool Berdasarkan Rarity
            let pool = database.filter(v => isRateUp ? v.rarity >= 5 : v.rarity < 5);
            if (pool.length === 0) pool = database; // Fallback jika pool kosong
            
            const char = pool[Math.floor(Math.random() * pool.length)];

            // 4. Fetch Gambar (Direct R2 Link dari JSON)
            const imgRes = await fetch(char.image);
            const imageBuffer = await imgRes.buffer();

            // 5. Auto Translate Deskripsi
            let deskripsiIndo = char.description;
            try {
                const trUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(char.description)}`;
                const trRes = await fetch(trUrl);
                const trJson = await trRes.json();
                deskripsiIndo = trJson[0].map(item => item[0]).join('');
            } catch (e) {}

            // 6. Prepare Media
            const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });

            // 7. Rangkai Teks
            const bodyText = `ＧＥＮＳＨＩＮ ＧＡＣＨＡ ✅
${isRateUp ? '🌟 *LUCKY! JAMINAN BINTANG 5* 🌟' : `🎫 Pull Ke: ${gachaPity[m.sender]}/10`}

 \`\`\`➢ Nama      : ${char.name}\`\`\`
 \`\`\`➢ Title     : ${char.title || '-'}\`\`\`
 \`\`\`➢ Rarity    : ${char.rarity}★\`\`\`
 \`\`\`➢ Element   : ${char.element}\`\`\`
 \`\`\`➢ Weapon    : ${char.weapon}\`\`\`
 \`\`\`➢ Nation    : ${char.nation}\`\`\`

📖 *STORY:*
\`\`\`${deskripsiIndo}\`\`\`

⚔️ *SKILLS:*
${char.skills.length > 0 ? char.skills.map(s => `• ${s}`).join('\n') : '-'}

✨ *CONSTELLATIONS:*
${char.constellations.length > 0 ? char.constellations.slice(0, 3).map(c => `• ${c}`).join('\n') : '-'}`.trim();

            // 8. Interactive Message
            const interactiveMessage = {
                header: { 
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                },
                body: { text: bodyText },
                footer: { text: `Castorice Assistant • Genshin` },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ 
                                display_text: "🔁 Gᗩᑕᕼᗩ ᒪᗩGI", 
                                id: `${usedPrefix}${command}` 
                            })
                        },
                        {
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({
                                display_text: "🖼️ ᐯIEᗯ ᔕᑭᒪᗩᔕᕼ ᗩᖇT",
                                url: char.banner
                            })
                        }
                    ]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { quoted: fake });
            
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react(char.rarity >= 5 ? '🌟' : '✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            return conn.sendMessage(m.chat, { 
                image: { url: global.anime },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nAlasan: ❌${e.message}` 
            }, { quoted: fail });
        }
    }
};