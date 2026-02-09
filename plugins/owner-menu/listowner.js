import fs from 'fs';
import path from 'path';

export default {
    name: 'listowner',
    alias: ['lo', 'ownerlist'],
    category: 'owner',
    isOwner: true,
    exec: async ({ conn, m }) => {
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

        await m.react('👑');

        // 1. Sinkronisasi Data Owner
        let rawOwners = [
            ...(global.owner || []),
            ...(global.db?.data?.settings?.owner || [])
        ];

        const allOwners = [...new Set(rawOwners.map(v => {
            if (Array.isArray(v)) return v[0].replace(/[^0-9]/g, '');
            if (typeof v === 'string') return v.replace(/[^0-9]/g, '');
            return v;
        }))];

        const displayImg = getOwnerImage();
        const jids = allOwners.map(v => v + '@s.whatsapp.net');

        // 2. Format Boxed Layout
        let caption = `╭── ❏ *${toSmallCaps("ᴀᴜᴛʜᴏʀɪᴢᴇᴅ ᴘᴇʀsᴏɴɴᴇʟ")}* ❏\n`;
        allOwners.forEach((v, i) => {
            caption += `│ \`\`\`${(i + 1).toString().padStart(2, '0')}.\`\`\` @${v}\n`;
        });
        caption += `╰───────────────➣\n\n`;
        caption += `╭── ❏ *${toSmallCaps("sʏsᴛᴇᴍ sᴛᴀᴛᴜs")}* ❏\n`;
        caption += `│ \`\`\`➢ Total    :\`\`\` ${allOwners.length} User(s)\n`;
        caption += `│ \`\`\`➢ Access   :\`\`\` Full Control\n`;
        caption += `│ \`\`\`➢ Security :\`\`\` Verified\n`;
        caption += `╰───────────────➣\n\n`;
        caption += `_Unauthorized users are restricted from_ \n_accessing administrative commands._`;

        try {
            if (displayImg) {
                await conn.sendMessage(m.chat, {
                    image: displayImg,
                    caption: caption,
                    mentions: jids
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, {
                    text: caption,
                    mentions: jids
                }, { quoted: m });
            }
        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: displayImg,
                caption: `*FATAL ERROR:* Failed to fetch owner registry.` 
            }, { quoted: m });
        }
    }
};