import fs from 'fs';
import path from 'path';

export default {
    name: 'addpluginprem',
    alias: ['apprem', 'app'],
    category: 'premium',
    isPremium: true,
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        const pluginsPath = path.join(process.cwd(), 'plugins');
        
        // --- [ 🛠️ CORE UTILS ] ---
        const toSmallCaps = (str) => {
            const fonts = { 'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ' };
            return str.toLowerCase().split('').map(c => fonts[c] || c).join('');
        };

        const getDisplayImage = () => {
            const assetsPath = path.join(process.cwd(), 'assets');
            const files = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath) : [];
            // Prioritas: premium.jpg/png -> owner.jpg/png
            let premLocal = files.find(f => /^premium\.(jpe?g|png)$/i.test(f));
            if (premLocal) return fs.readFileSync(path.join(assetsPath, premLocal));
            let ownerLocal = files.find(f => /^owner1\.(jpe?g|png)$/i.test(f));
            if (ownerLocal) return fs.readFileSync(path.join(assetsPath, ownerLocal));
            return null; 
        };

        // --- [ 📊 DATABASE SYNC ] ---
        if (!global.db.data) global.db.data = { users: {} };
        let user = global.db.data.users[m.sender];
        if (!user) user = global.db.data.users[m.sender] = { pluginLimit: 0, premium: true };

        const currentLimit = user.pluginLimit || 0;
        const displayImg = getDisplayImage();
        
        const sendResponse = async (content) => {
            const payload = displayImg ? { image: displayImg, caption: content } : { text: content };
            await conn.sendMessage(m.chat, payload, { quoted: m });
        };

        // --- [ 🚀 EXECUTION START ] ---

        if (currentLimit <= 0) {
            await m.react('❌');
            let deny = `╭── ❏ *${toSmallCaps("ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ")}* ❏\n`
            deny += `│ \`\`\`Quota   : Exhausted (0)\`\`\`\n`
            deny += `│ \`\`\`Status  : Premium User\`\`\`\n`
            deny += `╰───────────────➣\n\n`
            deny += `_Maaf Master, kuota deployment Anda sudah habis. Silakan hubungi Developer untuk upgrade limit._`;
            return sendResponse(deny);
        }

        if (!text || !text.includes('|')) {
            await m.react('❓');
            let help = `╭── ❏ *${toSmallCaps("ʀᴀᴅᴊᴀ ᴘʀᴇᴍɪᴜᴍ ᴀᴄᴄᴇss")}* ❏\n`
            help += `│ \`\`\`❏ Mode    : Deployer\`\`\`\n`
            help += `│ \`\`\`❏ Quota   : ${currentLimit} Remaining\`\`\`\n`
            help += `╰───────────────➣\n\n`
            help += `*Format:* \`${usedPrefix + command} category/name.js | code\`\n`
            help += `*Example:* \`${usedPrefix + command} fun/game.js | export default { ... }\``;
            return sendResponse(help);
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

            // Write File
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
            fs.writeFileSync(pluginPath, code);

            // Update Quota
            user.pluginLimit -= 1;
            if (global.db.write) await global.db.write(); 

            let success = `╭── ❏ *${toSmallCaps("ᴅᴇᴘʟᴏʏ ᴄᴏᴍᴘʟᴇᴛᴇᴅ")}* ❏\n`
            success += `│ \`\`\`➢ Target  : plugins/${nameOnly}\`\`\`\n`
            success += `│ \`\`\`➢ Quota   : ${user.pluginLimit} Left\`\`\`\n`
            success += `│ \`\`\`➢ Rank    : Premium User\`\`\`\n`
            success += `╰───────────────➣\n\n`
            success += `_Sistem berhasil memproses plugin baru ke dalam engine._`;

            await sendResponse(success);
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            await sendResponse(`*❗ SYSTEM ERROR*\n\n${e.message}`);
        }
    }
};
