import fs from 'fs';
import path from 'path';

export default {
    name: 'addkategori',
    alias: ['addkat', 'newcat'],
    category: 'settings',
    isOwner: true,
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        const pluginsPath = path.join(process.cwd(), 'plugins');
        const dbPath = path.join(process.cwd(), 'data', 'kategori.json');

        // --- [ 🛠️ CORE UTILS ] ---
        const toSmallCaps = (str) => {
            const fonts = { 'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ' };
            return str.toLowerCase().split('').map(c => fonts[c] || c).join('');
        };

        const getOwnerImage = () => {
            const assetsPath = path.join(process.cwd(), 'assets');
            const files = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f)) : [];
            return files.length > 0 ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)])) : null;
        };

        const getFormattedList = (newDir = '') => {
            const categories = fs.readdirSync(pluginsPath, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();
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
                const marker = cat === newDir ? ' ➜ *[NEW]*' : '';
                return `│ \`\`\`➢ ${name.padEnd(15)} ${emoji}\`\`\`${marker}`;
            }).join('\n');
        };

        const getGroupsList = () => {
            if (!fs.existsSync(dbPath)) return '│ ```(Empty)```';
            const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            return Object.keys(data).map(g => `│ \`\`\`➢ ${g}\`\`\``).join('\n');
        };

        const displayImg = getOwnerImage();
        const sendResponse = async (content) => {
            const payload = displayImg ? { image: displayImg, caption: content } : { text: content };
            await conn.sendMessage(m.chat, payload, { quoted: m });
        };

        // --- [ 🚀 EXECUTION START ] ---

        if (!text) {
            await m.react('📂');
            const totalKat = fs.readdirSync(pluginsPath, { withFileTypes: true }).filter(d => d.isDirectory()).length;
            
            let info = `╭── ❏ *${toSmallCaps("sʏsᴛᴇᴍ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ")}* ❏\n`
            info += `│ \`\`\`❏ Engine  : Radja Engine\`\`\`\n`
            info += `│ \`\`\`❏ Folders : ${totalKat.toString().padStart(2, '0')}\`\`\`\n`
            info += `│ \`\`\`❏ Status  : Owner Active\`\`\`\n`
            info += `╰───────────────➣\n\n`
            
            info += `╭── ❏ *${toSmallCaps("ᴄᴜʀʀᴇɴᴛ ᴄᴀᴛᴇɢᴏʀɪᴇs")}* ❏\n`
            info += `${getFormattedList()}\n`
            info += `╰───────────────➣\n\n`

            info += `╭── ❏ *${toSmallCaps("ᴇxɪsᴛɪɴɢ ɢʀᴏᴜᴘs")}* ❏\n`
            info += `${getGroupsList()}\n`
            info += `╰───────────────➣\n\n`
            
            info += `*Usage:* \`${usedPrefix + command} Group | Folder | Desc\`\n`
            info += `*Note:* Pilih group yang sudah ada atau ketik baru.`;
            
            return sendResponse(info);
        }

        await m.react('⚙️');
        let [groupInput, folderInput, ...descInput] = text.split('|').map(v => v.trim());
        if (!groupInput || !folderInput) {
            return sendResponse(`*⚠️ FORMAT SALAH MASTER*\n\nContoh: \`🎮 Hiburan | rpg | ⚔️ RPG Game\``);
        }

        const folderName = folderInput.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const targetPath = path.join(pluginsPath, folderName);
        const description = descInput.join('|').trim() || `📁 Fitur ${folderName}`;

        try {
            if (fs.existsSync(targetPath)) return sendResponse(`*❌ REJECTED*: Folder sudah ada!`);

            let kategoriData = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {};
            
            // --- ANTI-DUPLIKAT GROUP LOGIC (SMART MERGE) ---
            const cleanInput = groupInput.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim().toLowerCase();
            const existingKeys = Object.keys(kategoriData);
            
            let finalGroupKey = groupInput;
            for (let key of existingKeys) {
                const cleanKey = key.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim().toLowerCase();
                if (cleanKey === cleanInput) {
                    finalGroupKey = key; 
                    break;
                }
            }

            // Create Physical Folder
            fs.mkdirSync(targetPath, { recursive: true });

            // Update Database
            if (!kategoriData[finalGroupKey]) kategoriData[finalGroupKey] = {};
            kategoriData[finalGroupKey][folderName.replace(/-menu$/, '')] = description;

            fs.writeFileSync(dbPath, JSON.stringify(kategoriData, null, 2));

            let success = `╭── ❏ *${toSmallCaps("ᴄᴀᴛᴇɢᴏʀʏ ᴄʀᴇᴀᴛᴇᴅ")}* ❏\n`
            success += `│ \`\`\`➢ Group   : ${finalGroupKey}\`\`\`\n`
            success += `│ \`\`\`➢ Folder  : plugins/${folderName}\`\`\`\n`
            success += `│ \`\`\`➢ Desc    : ${description}\`\`\`\n`
            success += `╰───────────────➣\n\n`
            success += `╭── ❏ *${toSmallCaps("ᴜᴘᴅᴀᴛᴇᴅ ʟɪsᴛ")}* ❏\n`
            success += `${getFormattedList(folderName)}\n`
            success += `╰───────────────➣`;

            await sendResponse(success);
            await m.react('✅');
        } catch (e) {
            await m.react('❌');
            await sendResponse(`*❗ ERROR:* ${e.message}`);
        }
    }
};
