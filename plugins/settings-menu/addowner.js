import fs from 'fs';
import path from 'path';

export default {
    name: 'addowner',
    alias: ['ao', 'tambahowner'],
    category: 'settings',
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

        await m.react('⏱️');
        let number = who.split('@')[0];

        // 2. Check if already owner
        if (global.owner.includes(number)) {
            await m.react('💡');
            return sendResponse(m.chat, `*ALREADY EXIST*\n@${number} is already part of the owner list.`, m, [who]);
        }

        try {
            // 3. Update Database & Memory
            global.owner.push(number);

            if (global.db && global.db.data) {
                if (!global.db.data.users[who]) global.db.data.users[who] = {
                    name: await conn.getName(who),
                    limit: 100,
                    lastclaim: 0,
                    premium: false,
                    pluginLimit: 0
                };
                global.db.data.users[who].rowner = true;
                global.db.data.users[who].premium = true;
                if (global.db.write) await global.db.write();
            }

            // 4. Final Box Response
            const successInfo = `╭── ❏ *${toSmallCaps("ᴀᴅᴅ ᴏᴡɴᴇʀ sᴜᴄᴄᴇss")}* ❏
│ \`\`\`➢ User    : @${number}\`\`\`
│ \`\`\`➢ Access  : Full Control\`\`\`
│ \`\`\`➢ Status  : Real Owner\`\`\`
╰───────────────➣

_The user has been granted full authority_
_and permanent access to the engine._`;

            await sendResponse(m.chat, successInfo, m, [who]);
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            await sendResponse(m.chat, `*FATAL ERROR*\n${e.message}`, m);
        }
    }
};
