import fs from 'fs';
import path from 'path';

export default {
    name: 'delprem',
    alias: ['remprem', 'unprem'],
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

        // Fungsi Ambil Gambar Owner
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

        // 2. Database Handling
        if (!global.db.data) global.db.data = { users: {} };
        let user = global.db.data.users[who];

        if (!user) {
            await m.react('❓');
            return sendResponse(m.chat, `*NOT FOUND*\nUser is not registered in the database.`, m);
        }

        if (!user.premium) {
            await m.react('💡');
            return sendResponse(m.chat, `*NOT PREMIUM*\n@${who.split('@')[0]} is already a regular user.`, m, [who]);
        }

        await m.react('⏱️');

        try {
            // 3. Reset Privilege (Factory Reset)
            user.premium = false;
            user.premiumTime = 0;
            user.limit = 20;       
            user.pluginLimit = 0;  
            if (global.db.write) await global.db.write();

            // 4. Final Box Response
            const successInfo = `╭── ❏ *${toSmallCaps("ᴘʀᴇᴍɪᴜᴍ ʀᴇᴠᴏᴋᴇᴅ")}* ❏
│ \`\`\`➢ User    : @${who.split('@')[0]}\`\`\`
│ \`\`\`➢ Status  : Regular Member\`\`\`
│ \`\`\`➢ Access  : Restricted\`\`\`
│ \`\`\`➢ Limit   : Standard (20)\`\`\`
╰───────────────➣

_Premium authority has been terminated._
_User returned to standard engine configuration._`;

            await sendResponse(m.chat, successInfo, m, [who]);
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            await sendResponse(m.chat, `*FATAL ERROR*\n${e.message}`, m);
        }
    }
};