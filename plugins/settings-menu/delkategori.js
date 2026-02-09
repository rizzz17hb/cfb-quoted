import fs from 'fs';
import path from 'path';

export default {
    name: 'delkategori',
    alias: ['delkat', 'rmdir'],
    category: 'settings',
    isOwner: true,
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        const pluginsPath = path.join(process.cwd(), 'plugins');
        const dbPath = path.join(process.cwd(), 'data', 'kategori.json');

        // --- [ 🛠️ UTILS ] ---
        const toSmallCaps = (str) => {
            const fonts = { 'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ' };
            return str.toLowerCase().split('').map(c => fonts[c] || c).join('');
        };

        const getOwnerImage = () => {
            const assetsPath = path.join(process.cwd(), 'assets');
            const files = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f)) : [];
            return files.length > 0 ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)])) : null;
        };

        const getFormattedList = () => {
            const categories = fs.readdirSync(pluginsPath, { withFileTypes: true })
                .filter(d => d.isDirectory() && !d.name.startsWith('.'))
                .map(d => d.name).sort();
            
            const kategoriData = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {};

            return categories.map(cat => {
                const name = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                const cleanKey = cat.replace(/-menu$/, '');
                
                let emoji = '📁';
                for (const group of Object.values(kategoriData)) {
                    if (group[cleanKey]) {
                        const match = group[cleanKey].match(/^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/u);
                        if (match) emoji = match[0];
                        break;
                    }
                }
                return `│ \`\`\`➢ ${name.padEnd(15)} ${emoji}\`\`\``;
            }).join('\n');
        };

        const displayImg = getOwnerImage();
        const sendResponse = async (content) => {
            const payload = displayImg ? { image: displayImg, caption: content } : { text: content };
            await conn.sendMessage(m.chat, payload, { quoted: m });
        };

        // --- [ 🚀 EXECUTION ] ---

        if (!text) {
            await m.react('🗑️');
            const totalKat = fs.readdirSync(pluginsPath, { withFileTypes: true }).filter(d => d.isDirectory()).length;
            
            let info = `╭── ❏ *${toSmallCaps("ᴅᴇʟᴇᴛᴇ ᴄᴀᴛᴇɢᴏʀʏ")}* ❏\n`
            info += `│ \`\`\`❏ Category  : ${totalKat} Folders\`\`\`\n`
            info += `│ \`\`\`❏ Status    : Owner Mode\`\`\`\n`
            info += `│ \`\`\`❏ Warning   : Permanent Delete\`\`\`\n`
            info += `╰───────────────➣\n\n`
            info += `╭── ❏ *${toSmallCaps("sʏsᴛᴇᴍ ʟɪsᴛ")}* ❏\n`
            info += `${getFormattedList()}\n`
            info += `╰───────────────➣\n\n`
            info += `*Usage:* ${usedPrefix + command} folder-name`;
            return sendResponse(info);
        }

        await m.react('⚙️');
        const folderName = text.toLowerCase().trim().replace(/\s+/g, '-');
        const targetPath = path.join(pluginsPath, folderName);
        const vitalFolders = ['owner', 'main', 'setting', 'premium'];

        // Protection Logic
        if (vitalFolders.some(v => folderName.includes(v))) {
            await m.react('🚫');
            return sendResponse(`*❌ ACCESS DENIED*\n\nCategory \`plugins/${folderName}\` adalah folder sistem vital dan tidak dapat dihapus.`);
        }

        try {
            if (!fs.existsSync(targetPath)) {
                await m.react('❓');
                return sendResponse(`*❌ NOT FOUND*\n\nFolder \`plugins/${folderName}\` tidak ditemukan.`);
            }

            // 1. Hapus Folder Fisik
            fs.rmSync(targetPath, { recursive: true, force: true });

            // 2. Sinkronisasi Database (Hapus dari Nested Object)
            if (fs.existsSync(dbPath)) {
                let kategoriData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                const cleanKey = folderName.replace(/-menu$/, '');
                
                let deletedFromDb = false;
                for (const groupName in kategoriData) {
                    if (kategoriData[groupName][cleanKey]) {
                        delete kategoriData[groupName][cleanKey];
                        // Jika grup jadi kosong setelah dihapus, hapus grupnya juga
                        if (Object.keys(kategoriData[groupName]).length === 0) {
                            delete kategoriData[groupName];
                        }
                        deletedFromDb = true;
                        break;
                    }
                }
                
                if (deletedFromDb) {
                    fs.writeFileSync(dbPath, JSON.stringify(kategoriData, null, 2));
                }
            }

            let success = `╭── ❏ *${toSmallCaps("ᴄᴀᴛᴇɢᴏʀʏ ᴅᴇʟᴇᴛᴇᴅ")}* ❏\n`
            success += `│ \`\`\`➢ Path      : plugins/${folderName}\`\`\`\n`
            success += `│ \`\`\`➢ Status    : Terminated\`\`\`\n`
            success += `│ \`\`\`➢ Database  : Synced\`\`\`\n`
            success += `╰───────────────➣\n\n`
            success += `_Kategori dan seluruh isinya telah dihapus secara permanen dari Radja Engine._`;

            await sendResponse(success);
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            await sendResponse(`*❗ FATAL ERROR*\n\n${e.message}`);
        }
    }
};
