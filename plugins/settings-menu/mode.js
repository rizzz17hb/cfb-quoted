import fs from 'fs';
import path from 'path';

export default {
    name: 'mode',
    alias: ['botmode', 'self', 'public'],
    category: 'settings',
    isOwner: true,
    exec: async ({ conn, m, args, command }) => {

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

        // 1. Inisialisasi Settings
        if (!global.db.data.settings) global.db.data.settings = {};
        let settings = global.db.data.settings;

        // Auto-detect input dari command atau args
        let input = args[0] ? args[0].toLowerCase() : command.toLowerCase();

        if (!['public', 'self'].includes(input)) {
            await m.react('❓');
            return sendResponse(m.chat, `*INPUT REQUIRED*\nSelect engine mode: *public* or *self*`, m);
        }

        await m.react('⚙️');

        let isSelf = input === 'self';
        let reactEmoji = isSelf ? '🔒' : '🔓';
        
        // 2. Update Logic (RAM & Database Synchronization)
        global.opts['self'] = isSelf;
        settings.self = isSelf;
        if (global.db.write) await global.db.write();

        // 3. Final Box Response
        const successInfo = `╭── ❏ *("sʏsᴛᴇᴍ ᴄᴏɴꜰɪɢᴜʀᴀᴛɪᴏɴ")* ❏
│ \`\`\`➢ Mode      : ${input.toUpperCase()}\`\`\`
│ \`\`\`➢ Status    : Synchronized\`\`\`
│ \`\`\`➢ Security  : ${isSelf ? 'High' : 'Standard'}\`\`\`
│ \`\`\`➢ Executor  : @${m.sender.split('@')[0]}\`\`\`
╰───────────────➣

_Engine has been switched to ${input} mode._
_${isSelf ? 'Only authorized personnel can access.' : 'All users can now access the features.'}_`;

        try {
            await sendResponse(m.chat, successInfo, m, [m.sender]);
            await m.react(reactEmoji);
        } catch (e) {
            await m.react('❌');
            await sendResponse(m.chat, `*FATAL ERROR*\n${e.message}`, m);
        }
    }
};
