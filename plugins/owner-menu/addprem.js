import fs from 'fs';
import path from 'path';

export default {
    name: 'addprem',
    alias: ['ap', 'setprem'],
    category: 'owner',
    isOwner: true,
    exec: async ({ conn, m, args, usedPrefix, command }) => {

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

        // 1. Deteksi Target
        let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '';

        if (!who) {
            await m.react('❌');
            return sendResponse(m.chat, `*INPUT REQUIRED*\n\nUsage: ${usedPrefix + command} @tag days\nExample: ${usedPrefix + command} @user 30`, m);
        }

        await m.react('⏱️');

        // 2. Database Handling
        if (!global.db.data) global.db.data = { users: {} };
        if (!global.db.data.users[who]) {
            global.db.data.users[who] = {
                name: await conn.getName(who),
                limit: 20,
                pluginLimit: 0,
                premium: false,
                premiumTime: 0
            };
        }

        let user = global.db.data.users[who];
        let days = args[1] && !isNaN(args[1]) ? parseInt(args[1]) : 30;
        let dayInMs = 86400000;
        let expired = user.premium ? user.premiumTime + (days * dayInMs) : Date.now() + (days * dayInMs);

        // 3. Set Privilege
        user.premium = true;
        user.premiumTime = expired;
        user.limit = 999999; 
        user.pluginLimit = 10; 
        if (global.db.write) await global.db.write();

        // 4. Final Response
        const successInfo = `╭── ❏ *("ᴘʀᴇᴍɪᴜᴍ ᴀᴄᴛɪᴠᴀᴛᴇᴅ")* ❏
│ \`\`\`➢ User    : @${who.split('@')[0]}\`\`\`
│ \`\`\`➢ Duration: ${days} Days\`\`\`
│ \`\`\`➢ Quota   : 10 Plugins\`\`\`
│ \`\`\`➢ Expired : ${new Date(expired).toLocaleDateString('id-ID')}\`\`\`
╰───────────────➣

_User has been upgraded to Premium._
_All engine limits have been bypassed._`;

        try {
            await sendResponse(m.chat, successInfo, m, [who]);
            await m.react('✅');
        } catch (e) {
            await m.react('❌');
            await sendResponse(m.chat, `*FATAL ERROR*\n${e.message}`, m);
        }
    }
};