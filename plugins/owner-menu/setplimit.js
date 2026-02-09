import fs from 'fs';
import path from 'path';

export default {
    name: 'setplimit',
    alias: ['spl', 'setpluglimit'],
    category: 'owner',
    isOwner: true,
    exec: async ({ conn, m, args, usedPrefix, command }) => {
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
            await m.react('❓');
            return sendResponse(m.chat, `*INPUT REQUIRED*\n\nUsage: ${usedPrefix + command} @tag 20\nExample: ${usedPrefix + command} 20 (as reply)`, m);
        }

        // 2. Ambil Jumlah Angka
        let jumlah = parseInt(args.find(a => !isNaN(a) && a.length < 10));
        if (isNaN(jumlah)) {
            await m.react('❌');
            return sendResponse(m.chat, `*INVALID AMOUNT*\nPlease provide a valid number for plugin quota.`, m);
        }

        // Database Verification
        if (!global.db.data) global.db.data = { users: {} };
        let user = global.db.data.users[who];

        if (!user) {
            await m.react('❓');
            return sendResponse(m.chat, `*NOT FOUND*\nUser is not registered in the database.`, m);
        }

        await m.react('⏱️');

        try {
            // 3. Update Privilege
            user.pluginLimit = Math.max(0, jumlah);
            if (global.db.write) await global.db.write();

            // 4. Final Box Response
            const successInfo = `╭── ❏ *${toSmallCaps("ᴘʟᴜɢɪɴ ʟɪᴍɪᴛ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ")}* ❏
│ \`\`\`➢ User    : @${who.split('@')[0]}\`\`\`
│ \`\`\`➢ Quota   : ${jumlah} Plugins\`\`\`
│ \`\`\`➢ Status  : Active Access\`\`\`
╰───────────────➣

_The user now has administrative permission_
_to deploy up to ${jumlah} files to the engine._`;

            await sendResponse(m.chat, successInfo, m, [who]);
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            await sendResponse(m.chat, `*FATAL ERROR*\n${e.message}`, m);
        }
    }
};