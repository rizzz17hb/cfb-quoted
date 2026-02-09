import fs from 'fs';
import path from 'path';

export default {
    name: 'delplugin',
    alias: ['df', 'dp', 'deleteplugin'],
    category: 'settings',
    isOwner: true,
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        const pluginsPath = path.join(process.cwd(), 'plugins');

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

        const getFormattedList = () => {
            const emojies = {
                'berita': '📰', 'download': '📥', 'search': '🔍', 'tools': '🛠️',
                'other': '📁', 'anime': '🌸', 'game': '🎮', 'fun': '🎡',
                'genshin': '🧭', 'quotes': '💬', 'grup': '👥', 'sticker': '✨',
                'stalking': '🕵️', 'store': '🏪', 'islamic': '🌙', 'primbon': '🔮',
                'owner': '👑', 'premium': '💎', 'bug': '👾', 'nsfw': '🔞',
                'ai': '🤖', 'test': '🧪'
            };

            const categories = fs.readdirSync(pluginsPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
                .map(dirent => dirent.name);

            return categories.map(cat => {
                const name = cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                
                // Logika Emoji Pintar (Keyword Match)
                const lowCat = cat.toLowerCase();
                let emoji = '📁';
                for (let key in emojies) {
                    if (lowCat.includes(key)) {
                        emoji = emojies[key];
                        break;
                    }
                }
                
                return `│ \`\`\`➢ ${name} ${emoji}\`\`\``;
            }).join('\n');
        };

        // 1. Tampilan Awal (List Information)
        if (!text) {
            await m.react('📂');
            const currentList = getFormattedList();
            
            const headerInfo = `╭── ❏ *${toSmallCaps("ᴅᴇʟᴇᴛᴇ ᴘʟᴜɢɪɴ ᴍᴏᴅᴇ")}* ❏
│ \`\`\`❏ Mode      : Uninstaller\`\`\`
│ \`\`\`❏ Status    : Owner Access\`\`\`
╰───────────────➣

╭── ❏ *${toSmallCaps("ᴀᴠᴀɪʟᴀʙʟᴇ ꜰᴏʟᴅᴇʀs")}* ❏
${currentList}
╰───────────────➣

*Format:* ${usedPrefix + command} category/name.js`;

            return sendResponse(m.chat, headerInfo, m);
        }

        await m.react('⏱️');
        let input = text.trim().replace(/\\/g, '/'); // Normalize slashes
        if (!input.endsWith('.js')) input += '.js';
        
        const filePath = path.join(pluginsPath, input);
        const absolutePluginsDir = path.resolve(pluginsPath);

        try {
            // Security Check (Path Traversal Protection)
            if (!path.resolve(filePath).startsWith(absolutePluginsDir)) {
                await m.react('🚫');
                return sendResponse(m.chat, `*SECURITY REJECTED*\nDeletion outside plugins directory is forbidden.`, m);
            }

            if (!fs.existsSync(filePath)) {
                await m.react('❓');
                return sendResponse(m.chat, `*NOT FOUND*\nFile plugins/${input} does not exist.`, m);
            }

            // Eksekusi Hapus File
            fs.unlinkSync(filePath);

            const successInfo = `╭── ❏ *${toSmallCaps("ᴘʟᴜɢɪɴ ʀᴇᴍᴏᴠᴇᴅ")}* ❏
│ \`\`\`❏ Target    : plugins/${input}\`\`\`
│ \`\`\`❏ Status    : Terminated\`\`\`
╰───────────────➣

_The plugin has been successfully_
_purged from the Radja Engine system._`;

            await sendResponse(m.chat, successInfo, m);
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            await sendResponse(m.chat, `*FATAL ERROR*\n${e.message}`, m);
        }
    }
};
