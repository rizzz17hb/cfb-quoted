import fs from 'fs';
import path from 'path';

export default {
    name: 'delpluginprem',
    alias: ['dplugprem', 'dpprem', 'dpp'],
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
            let premLocal = files.find(f => /^premium\.(jpe?g|png)$/i.test(f));
            if (premLocal) return fs.readFileSync(path.join(assetsPath, premLocal));
            let ownerLocal = files.find(f => /^owner1\.(jpe?g|png)$/i.test(f));
            if (ownerLocal) return fs.readFileSync(path.join(assetsPath, ownerLocal));
            return null; 
        };

        const displayImg = getDisplayImage();
        const sendResponse = async (content) => {
            const payload = displayImg ? { image: displayImg, caption: content } : { text: content };
            await conn.sendMessage(m.chat, payload, { quoted: m });
        };

        // --- [ 🚀 EXECUTION START ] ---

        if (!text) {
            await m.react('❓');
            let help = `╭── ❏ *${toSmallCaps("ᴅᴇʟᴇᴛᴇ ᴘʟᴜɢɪɴ ᴘʀᴇᴍ")}* ❏\n`
            help += `│ \`\`\`❏ Mode    : Uninstaller\`\`\`\n`
            help += `│ \`\`\`❏ Rank    : Premium User\`\`\`\n`
            help += `╰───────────────➣\n\n`
            help += `*Usage:* \`${usedPrefix + command} category/filename.js\`\n`
            help += `*Example:* \`${usedPrefix + command} fun/game.js\``;
            return sendResponse(help);
        }

        await m.react('⏱️');
        let nameOnly = text.trim().replace(/\\/g, '/');
        if (!nameOnly.endsWith('.js')) nameOnly += '.js';

        const filePath = path.join(pluginsPath, nameOnly);
        const absolutePluginsDir = path.resolve(pluginsPath);

        try {
            // Path Traversal Protection
            if (!path.resolve(filePath).startsWith(absolutePluginsDir)) {
                await m.react('🚫');
                return sendResponse(`*❌ SECURITY REJECTED*\nPenghapusan di luar direktori plugins dilarang.`);
            }

            if (!fs.existsSync(filePath)) {
                await m.react('❌');
                return sendResponse(`*❌ NOT FOUND*\nFile \`plugins/${nameOnly}\` tidak ditemukan.`);
            }

            // Eksekusi Hapus
            fs.unlinkSync(filePath);

            let success = `╭── ❏ *${toSmallCaps("ᴘʟᴜɢɪɴ ʀᴇᴍᴏᴠᴇᴅ")}* ❏\n`
            success += `│ \`\`\`➢ Target  : plugins/${nameOnly}\`\`\`\n`
            success += `│ \`\`\`➢ Status  : Terminated\`\`\`\n`
            success += `│ \`\`\`➢ Rank    : Premium User\`\`\`\n`
            success += `╰───────────────➣\n\n`
            success += `_Plugin berhasil dihapus. Catatan: Kuota limit yang sudah terpakai tidak dapat dikembalikan._`;

            await sendResponse(success);
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            await sendResponse(`*❗ SYSTEM ERROR*\n\n${e.message}`);
        }
    }
};
