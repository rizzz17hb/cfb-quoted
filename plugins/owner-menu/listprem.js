import fs from 'fs';
import path from 'path';

export default {
    name: 'listprem',
    alias: ['premlist', 'lp'],
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

        await m.react('💎');

        // 1. Data Retrieval
        if (!global.db.data) global.db.data = { users: {} };
        const users = global.db.data.users;
        const prems = Object.keys(users).filter(jid => users[jid].premium);

        // 2. Format Boxed Layout
        let caption = `╭── ❏ *${toSmallCaps("ᴘʀᴇᴍɪᴜᴍ ʀᴇɢɪsᴛʀʏ")}* ❏\n`;
        
        if (prems.length === 0) {
            caption += `│ \`\`\`No elite users detected.\`\`\`\n`;
        } else {
            prems.forEach((jid, i) => {
                caption += `│ \`\`\`${(i + 1).toString().padStart(2, '0')}.\`\`\` @${jid.split('@')[0]}\n`;
            });
        }
        
        caption += `╰───────────────➣\n\n`;
        caption += `╭── ❏ *${toSmallCaps("ᴅᴀᴛᴀʙᴀsᴇ sᴛᴀᴛᴜs")}* ❏\n`;
        caption += `│ \`\`\`➢ Total    :\`\`\` ${prems.length} Members\n`;
        caption += `│ \`\`\`➢ Category :\`\`\` Premium Elite\n`;
        caption += `│ \`\`\`➢ Synced   :\`\`\` ${new Date().toLocaleDateString('id-ID')}\n`;
        caption += `╰───────────────➣\n\n`;
        caption += `_Privileged access is monitored by_ \n_Radja Engine Security Protocol._`;

        const displayImg = getOwnerImage();

        try {
            if (displayImg) {
                await conn.sendMessage(m.chat, {
                    image: displayImg,
                    caption: caption,
                    mentions: prems
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, {
                    text: caption,
                    mentions: prems
                }, { quoted: m });
            }
        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: displayImg,
                caption: `*FATAL ERROR:* Failed to synchronize premium list.` 
            }, { quoted: m });
        }
    }
};