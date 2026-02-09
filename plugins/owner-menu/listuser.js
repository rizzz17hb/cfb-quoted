import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'
import path from 'path'
import fs from 'fs'

export default {
    name: 'listuser',
    alias: ['userlist', 'daftaruser'],
    category: 'owner',
    isOwner: true,
    exec: async ({ conn, m, usedPrefix, command }) => {
        await conn.sendMessage(m.chat, { react: { text: '📂', key: m.key } });

        // --- LOGIC SUPER WIPE (BERSIHKAN SEMUA) ---
        if (m.text.includes('--wipe-confirm')) {
            try {
                const ownerNumber = global.owner[0].split('@')[0];
                const ownerJid = `${ownerNumber}@s.whatsapp.net`;
                
                // 1. Simpan data Master dari kedua lokasi database
                const ownerDataMain = global.db.users[ownerJid];
                const ownerDataNested = global.db.data?.users?.[ownerJid];
                
                // 2. Bersihkan Users & Logs (Penyebab file bengkak)
                global.db.users = {}; 
                global.db.logs = []; // Sikat semua log error yang bikin berat
                global.db.chats = {}; // Reset data chat grup/pribadi
                
                // 3. Bersihkan data nested jika ada
                if (global.db.data) {
                    global.db.data.users = {};
                    global.db.data.audioCache = {}; // Bersihkan cache audio biar enteng
                }

                // 4. Kembalikan data Master
                if (ownerDataMain) global.db.users[ownerJid] = ownerDataMain;
                if (global.db.data && ownerDataNested) {
                    global.db.data.users[ownerJid] = ownerDataNested;
                }

                await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
                return m.reply(`*SUPER WIPE SUCCESS*\n\n➢ Users & Data: _Cleared_\n➢ Logs History: _Deleted_\n➢ Chats Info: _Reset_\n\nDatabase kini bersih total, Master. ❤️`);
            } catch (e) {
                return m.reply(`Gagal membersihkan database: ${e.message}`);
            }
        }

        try {
            const users = global.db.users;
            const jids = Object.keys(users);

            let premiumUsers = [];
            let regularUsers = [];

            jids.forEach(jid => {
                const user = users[jid];
                const formattedName = `   ◦ @${jid.split('@')[0]}`;
                if (user.premium) premiumUsers.push(formattedName);
                else regularUsers.push(formattedName);
            });

            let txt = `ＤＡＴＡＢＡＳＥ  ＵＳＥＲＳ\n\n` +
                      `➢ *Total Terdaftar:* _${jids.length} Members_\n` +
                      `➢ *Status Sultan:* _${premiumUsers.length}_\n` +
                      `➢ *Logs Stack:* _${global.db.logs?.length || 0} entries_\n\n` +
                      `💎 *ＬＩＳＴ  ＰＲＥＭＩＵＭ*\n` +
                      `${premiumUsers.length > 0 ? premiumUsers.join('\n') : '   ◦ _(Kosong)_'}`;

            const getOwnerImage = () => {
                const assetsPath = path.join(process.cwd(), 'assets');
                const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
                return fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)]));
            };

            const ownerBuffer = getOwnerImage();
            const media = await prepareWAMessageMedia({ image: ownerBuffer }, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                header: {
                    title: "ＵＳＥＲ  ＩＮＶＥＮＴＯＲＹ",
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                },
                body: { text: txt },
                footer: { text: "Ｃａｓｔｏｒｉｃｅ  Ａｓｓｉｓｔａｎｔ" },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "💥 ᔕᑌᑭEᖇ ᗯIᑭE",
                                id: `${usedPrefix}${command} --wipe-confirm`
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "🔁 ᖇEᖴᖇEᔕᕼ",
                                id: `${usedPrefix}${command}`
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Μ𝔼ᑎ𝕦",
                                id: ".menu"
                            })
                        }
                    ]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id, quoted: m });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};