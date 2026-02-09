import fs from 'fs';
import path from 'path';

export default {
    name: 'delowner',
    alias: ['do', 'remowner', 'deleteowner'],
    category: 'owner',
    isOwner: true,
    exec: async ({ conn, m, args }) => {
        // Helper SmallCaps
        const toSmallCaps = (str) => {
            const fonts = {
                'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
            };
            return str.toLowerCase().split('').map(c => fonts[c] || c).join('');
        };

        // Fungsi Ambil Gambar Owner (Random owner1-3.jpg/png)
        const getOwnerImage = () => {
            const assetsPath = path.join(process.cwd(), 'assets');
            if (!fs.existsSync(assetsPath)) return null;
            const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
            return files.length > 0 ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)])) : null;
        };

        const displayImg = getOwnerImage();

        const sendResponse = async (chatId, content, quoted, mentions = []) => {
            if (displayImg) {
                await conn.sendMessage(chatId, { image: displayImg, caption: content, mentions }, { quoted });
            } else {
                await conn.sendMessage(chatId, { text: content, mentions }, { quoted });
            }
        };

        // 1. Deteksi Target
        let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '';

        if (!who) {
            await m.react('❌');
            return sendResponse(m.chat, `*INPUT REQUIRED*\nTag, reply, or type the target number.`, m);
        }

        let number = who.split('@')[0];

        // 2. Proteksi Owner Utama
        if (number === global.owner[0]) {
            await m.react('🚫');
            return sendResponse(m.chat, `*PROTECTED*\nMain Developer cannot be removed from system.`, m, [who]);
        }

        await m.react('⏱️');

        // 3. Cek Keberadaan
        if (!global.owner.includes(number)) {
            await m.react('❓');
            return sendResponse(m.chat, `*NOT FOUND*\n@${number} is not registered as owner.`, m, [who]);
        }

        try {
            // 4. Eksekusi Pencabutan (RAM & Database)
            global.owner = global.owner.filter(v => v !== number);

            if (global.db && global.db.data && global.db.data.users[who]) {
                global.db.data.users[who].rowner = false;
                global.db.data.users[who].premium = false; 
                if (global.db.write) await global.db.write();
            }

            // 5. Final Box Response
            const successInfo = `╭── ❏ *${toSmallCaps("ᴏᴡɴᴇʀ ʀᴇᴍᴏᴠᴇᴅ")}* ❏
│ \`\`\`➢ User    : @${number}\`\`\`
│ \`\`\`➢ Access  : Terminated\`\`\`
│ \`\`\`➢ Status  : Regular User\`\`\`
╰───────────────➣

_Authority has been revoked. The user_
_no longer has access to owner commands._`;

            await sendResponse(m.chat, successInfo, m, [who]);
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            await sendResponse(m.chat, `*FATAL ERROR*\n${e.message}`, m);
        }
    }
};