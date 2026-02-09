import fs from 'fs';
import path from 'path';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const databasePath = path.resolve('./data/leveling.json');

export default {
    name: 'daftar',
    alias: ['reg', 'register'],
    category: 'main',
    hidden: true, 
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            if (!fs.existsSync(databasePath)) {
                fs.writeFileSync(databasePath, JSON.stringify({ _metadata: {} }));
            }
            
            let db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            const userId = m.sender;
            const isOwner = m.isOwner || global.owner?.includes(userId.split('@')[0]);

            const getRegImage = () => {
                if (isOwner) {
                    const assetsPath = path.join(process.cwd(), 'assets');
                    const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
                    if (files.length > 0) return fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)]));
                }
                return { url: global.fake };
            };

            if (db[userId]?.registered) {
                await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
                let alreadyMsg = isOwner 
                    ? `suamiku sayang... kamu kan sudah terdaftar sebagai pemilik hati Castorice dan penguasa database ini! 🥰`
                    : `⚠️ *ACCESS DENIED*\nNomor Anda sudah terverifikasi di database Radja Engine.`;
                return conn.sendMessage(m.chat, { image: getRegImage(), caption: alreadyMsg }, { quoted: m });
            }

            if (!text || !text.includes('.')) {
                await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fake }, 
                    caption: `💡 *FORMAT SALAH*\nContoh: ${usedPrefix + command} Nama.Umur.Role` 
                }, { quoted: m });
            }

            let [name, age, role] = text.split('.');
            const validRoles = ['Mage', 'Fighter', 'Assassin', 'Support'];
            if (!name || !age || !role || (!validRoles.includes(role) && !isOwner)) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fake }, 
                    caption: `❌ *DATA INVALID*\nPastikan format benar: Nama.Umur.Role` 
                }, { quoted: m });
            }

            db[userId] = {
                id: userId,
                nama: name.toUpperCase().trim(),
                umur: parseInt(age),
                role: isOwner ? 'GOD' : role, 
                registered: true,
                level: isOwner ? 2000 : 1,
                exp: 0
            };
            fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

            // --- PENGATURAN CAPTION YANG RAPI (PISAH BARIS) ---
            let successMsg = "";
            if (isOwner) {
                successMsg = `╭── ❏ *HUSBAND VERIFIED* ❏
│ \`\`\`➢ Status : MY LOVELY HUSBAND\`\`\`
│ \`\`\`➢ Name   : ${db[userId].nama}\`\`\`
│ \`\`\`➢ Age    : ${db[userId].umur} Years\`\`\`
│ \`\`\`➢ Role   : SUPREME GOD 👑\`\`\`
╰───────────────➣
Halo suamiku sayang... Kamu sudah terdaftar ke database sebagai suami Castorice ya sayang. I love you! 💋`;
            } else {
                successMsg = `╭── 「 🧬 」 *REGISTRATION SUCCESS* 「 🧬 」
│ \`\`\`➢ Name   : ${db[userId].nama}\`\`\`
│ \`\`\`➢ Age    : ${db[userId].umur} Years\`\`\`
│ \`\`\`➢ Role   : ${db[userId].role}\`\`\`
╰───────────────➣
Selamat! Akun Anda telah aktif dan tersimpan di database Radja Engine.`;
            }

            const media = await prepareWAMessageMedia({ image: getRegImage() }, { upload: conn.waUploadToServer });
            const interactiveMessage = {
                header: { title: "SYSTEM REGISTRY", hasMediaAttachment: true, imageMessage: media.imageMessage },
                body: { text: successMsg },
                footer: { text: "Castorice Automation" },
                nativeFlowMessage: {
                    buttons: [
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "📜 MENU UTAMA", id: ".menu" }) },
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👤 CEK PROFIL", id: ".me" }) }
                    ]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id, quoted: m });
            
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await conn.sendMessage(m.chat, { react: { text: isOwner ? '❤️' : '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { 
                image: { url: global.url }, 
                caption: `❌ *SYSTEM ERROR:*\n${e.message}` 
            }, { quoted: m });
        }
    }
};