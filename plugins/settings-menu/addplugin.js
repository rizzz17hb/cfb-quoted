import fs from 'fs';
import path from 'path';

export default {
    name: 'addplugin',
    alias: ['aplug', 'setplugin'],
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

        // --- [ 🚀 EXECUTION START ] ---

        if (!text || !text.includes('|')) {
            await m.react('📂');
            let info = `╭── ❏ *${toSmallCaps("ᴀᴅᴅ ᴘʟᴜɢɪɴ ᴍᴏᴅᴇ")}* ❏\n`
            info += `│ \`\`\`❏ Mode      : Deployer\`\`\`\n`
            info += `│ \`\`\`❏ Status    : Owner Active\`\`\`\n`
            info += `╰───────────────➣\n\n`
            
            info += `╭── ❏ *${toSmallCaps("ᴀᴠᴀɪʟᴀʙʟᴇ ꜰᴏʟᴅᴇʀs")}* ❏\n`
            info += `${getFormattedList()}\n`
            info += `╰───────────────➣\n\n`
            
            info += `*Usage:* \`${usedPrefix + command} folder/file.js | code\`\n`
            info += `*Example:* \`${usedPrefix + command} owner/test.js | console.log('JOSS')\``;
            
            return sendResponse(info);
        }

        await m.react('⏱️');
        let [filename, ...codeParts] = text.split('|');
        let code = codeParts.join('|').trim();
        let nameOnly = filename.trim().replace(/\\/g, '/');
        if (!nameOnly.endsWith('.js')) nameOnly += '.js';

        try {
            const pluginPath = path.join(pluginsPath, nameOnly);
            const folderPath = path.dirname(pluginPath);
            const absolutePluginsDir = path.resolve(pluginsPath);

            // Path Traversal Protection
            if (!path.resolve(pluginPath).startsWith(absolutePluginsDir)) {
                await m.react('🚫');
                return sendResponse(`*❌ SECURITY REJECTED*\nAkses di luar direktori plugins dilarang.`);
            }

            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
            fs.writeFileSync(pluginPath, code);

            let success = `╭── ❏ *${toSmallCaps("ᴅᴇᴘʟᴏʏ ᴄᴏᴍᴘʟᴇᴛᴇᴅ")}* ❏\n`
            success += `│ \`\`\`➢ Target    : plugins/${nameOnly}\`\`\`\n`
            success += `│ \`\`\`➢ Status    : Synchronized\`\`\`\n`
            success += `│ \`\`\`➢ Engine    : Radja V1\`\`\`\n`
            success += `╰───────────────➣\n\n`
            success += `_Plugin telah berhasil diintegrasikan ke dalam sistem Radja Engine._`;

            await sendResponse(success);
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            await sendResponse(`*❗ FATAL ERROR*\n\n${e.message}`);
        }
    }
};
