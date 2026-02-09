import fs from 'fs';
import path from 'path';

export default {
    name: 'setdesk',
    alias: ['setbio', 'setstatus'],
    category: 'settings',
    isOwner: true,
    exec: async ({ conn, m, text, usedPrefix, command }) => {
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

        const sendResponse = async (chatId, content, quoted) => {
            if (displayImg) {
                await conn.sendMessage(chatId, { image: displayImg, caption: content }, { quoted });
            } else {
                await conn.sendMessage(chatId, { text: content }, { quoted });
            }
        };

        try {
            // 1. Validasi Input
            if (!text) {
                await m.react('❌');
                const helpInfo = `╭── ❏ *${toSmallCaps("sʏsᴛᴇᴍ ᴘʀᴏꜰɪʟᴇ")}* ❏
│ \`\`\`➢ Task      : Update Bio\`\`\`
│ \`\`\`➢ Status    : Input Required\`\`\`
╰───────────────➣

*Example:* ${usedPrefix + command} Radja Engine's Bot`;
                return sendResponse(m.chat, helpInfo, m);
            }

            // WhatsApp About limit is 139 characters
            if (text.length > 139) {
                await m.react('❌');
                return sendResponse(m.chat, `*LIMIT EXCEEDED*\nBio maximum length is 139 characters.`, m);
            }

            await m.react('⏱️');

            // 2. Update Status/Bio Profile
            await conn.updateProfileStatus(text);

            // 3. Final Box Response
            const successInfo = `╭── ❏ *${toSmallCaps("ᴘʀᴏꜰɪʟᴇ ᴜᴘᴅᴀᴛᴇᴅ")}* ❏
│ \`\`\`➢ Task      : Bot About/Bio\`\`\`
│ \`\`\`➢ Status    : Success\`\`\`
╰───────────────➣

_New Bot Bio:_
_"${text}"_

_The public profile information has been synchronized._`;

            await sendResponse(m.chat, successInfo, m);
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            await sendResponse(m.chat, `*FATAL ERROR*\n${e.message}`, m);
        }
    }
};
