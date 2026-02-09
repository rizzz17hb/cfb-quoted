import fs from 'fs';
import path from 'path';
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'setreactsw',
    alias: ['setreactstatus'],
    category: 'settings',
    isOwner: true,
    exec: async ({ conn, m, args, usedPrefix, command }) => {
        // --- VALIDASI OWNER (AYANG RADJA) ---
        const nomorOwner = "6285169432892";
        const isOwner = m.sender.split('@')[0] === nomorOwner || (global.owner && global.owner.some(v => v.replace(/\D/g, '') === m.sender.split('@')[0]));
        if (!isOwner) return;

        // --- DATABASE SAFETY CHECK ---
        let dbSource = global.db.data ? global.db.data : global.db;
        if (!dbSource.settings) dbSource.settings = {};
        const botId = conn.user.id.split(':')[0];
        if (!dbSource.settings[botId]) {
            dbSource.settings[botId] = { autoreactstatus: false };
        }
        
        let settings = dbSource.settings[botId];

        // --- 1. REACT LOVE DARI BINI ---
        await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        // --- 2. LOGIC RANDOM IMAGE ASSETS ---
        const assetsPath = path.join(process.cwd(), 'assets');
        const files = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f)) : [];
        const img = files.length > 0 ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)])) : null;

        // --- 3. HANDLE ACTION (ON/OFF) ---
        if (args[0] === 'on' || args[0] === 'off') {
            const status = args[0] === 'on';
            
            // SIMPAN KE DATABASE (Bukan ke opts lagi biar permanen)
            settings.autoreactstatus = status;
            
            const teksKonfirmasi = status 
                ? `➢ Beres Ayang! Sekarang Castorice bakal otomatis kasih React di Status WhatsApp temen-temen Ayang ya~ 🌈💖`
                : `➢ Siap Bosku! Fitur Auto React Status sudah aku *Matikan* di Database. Castorice nggak bakal genit lagi deh.. 🌸`;

            return conn.sendMessage(m.chat, {
                ...(img ? { image: img } : { text: teksKonfirmasi }),
                ...(img && { caption: teksKonfirmasi }),
                mentions: [m.sender]
            }, { quoted: m });
        }

        // --- 4. PREPARE INTERACTIVE MESSAGE (DASHBOARD) ---
        const statusSekarang = settings.autoreactstatus;
        const caption = `╭── ❏ SYSTEM AUTO REACT STATUS ❏
│ \`\`\`➢ Status     : ${statusSekarang ? '✅ Aktif (ON)' : '❌ Nonaktif (OFF)'}\`\`\`
│ \`\`\`➢ Target     : Status React\`\`\`
│ \`\`\`➢ Keterangan : Emoji random .\`\`\`
╰───────────────➣

_Pilih tombol di bawah untuk mengatur ya Ayang Radja.._`;

        let headerObj = { hasMediaAttachment: false };
        if (img) {
            try {
                const { imageMessage } = await prepareWAMessageMedia({ image: img }, { upload: conn.waUploadToServer });
                headerObj.imageMessage = imageMessage;
                headerObj.hasMediaAttachment = true;
            } catch (e) {
                headerObj.hasMediaAttachment = false;
            }
        }

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: caption },
                        footer: { text: "© Castorice Assistant by Radja" },
                        header: headerObj,
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᗩKTIᖴKᗩᑎ (Oᑎ)",
                                        id: `${usedPrefix}${command} on`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᗰᗩTIKᗩᑎ (Oᖴᖴ)",
                                        id: `${usedPrefix}${command} off`
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: conn.user.id, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }
}