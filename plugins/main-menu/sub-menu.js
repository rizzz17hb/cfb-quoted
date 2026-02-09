import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { validateAccess } from '../../lib/utils/protect.js';

export default {
    name: 'submenu',
    alias: ['allmenu', 'aimenu', 'listmenu', 'beritamenu', 'assistantmenu', 'downloadmenu', 'settingsmenu', 'searchmenu', 'toolsmenu', 'othermenu', 'animemenu', 'gamemenu', 'funmenu', 'genshinmenu', 'quotesmenu', 'grupmenu', 'stickermenu', 'stalkingmenu', 'storemenu', 'islamicmenu', 'primbonmenu', 'ownermenu', 'premiummenu', 'bugmenu', 'nsfwmenu', 'internetmenu', 'educationmenu', 'musicmenu', 'lifestylemenu', 'anonymousmenu'], 
    category: 'main',
    hidden: true, 
    exec: async ({ conn, m, command, plugins, usedPrefix }) => {
        let formatNumber, runtime;
        try {
            const formatPath = pathToFileURL(path.join(process.cwd(), 'lib', 'utils', 'format.js')).href;
            const formatModule = await import(formatPath);
            formatNumber = formatModule.formatNumber;
            runtime = formatModule.runtime;
        } catch (e) {
            formatNumber = (num) => num; 
            runtime = (ms) => `${Math.floor(ms / 1000)}s`;
        }

        await m.react('⏱️');

        const allPlugins = Array.from(plugins.values()).filter(p => p.name && !p.hidden);
        let categoryTarget = command.replace('menu', '').toLowerCase();
        let listFitur = [];

        const fakeQuoted = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };

        const getFiturLabel = (p) => {
            const cat = (p.category || '').toLowerCase();
            if (cat.includes('owner') || p.isOwner) return '👑';
            if (cat.includes('prem') || p.isPremium) return '💎';
            return '✨';
        };

        const userData = global.db?.users?.[m.sender] || {};
        const isOwner = global.owner?.some(v => v.replace(/[^0-9]/g, '') === m.sender.split('@')[0]) || false;
        const userStatus = isOwner ? 'Owner' : (userData.premium ? 'Premium' : 'Free');

        const greeting = (() => {
            const jam = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
            ).getHours();

            let waktu;
            if (jam >= 0 && jam < 3) waktu = "malam";
            else if (jam >= 3 && jam < 11) waktu = "pagi";
            else if (jam >= 11 && jam < 15) waktu = "siang";
            else if (jam >= 15 && jam < 18) waktu = "sore";
            else waktu = "malam";

            if (userStatus === "Owner") {
                return {
                    pagi:  "Celamet pagi ownerku cayang💖",
                    siang: "Celamet siang ownerku cayang💖",
                    sore:  "Celamet sore ownerku cayang💖",
                    malam: "Celamet malam ownerku cayang💖"
                }[waktu];
            }

            return {
                pagi:  "Selamat Pagi user",
                siang: "Selamat Siang user",
                sore:  "Selamat Sore user",
                malam: "Selamat Malam user"
            }[waktu];})();

        const uptimeStr = runtime ? runtime(process.uptime() * 1000) : `${Math.floor(process.uptime())}s`;
        const modeBot = global.opts['self'] ? 'Self' : 'Public';

        const findImagePath = (name) => {
            const extensions = ['.jpg', '.jpeg', '.png'];
            for (let ext of extensions) {
                const fullPath = path.join(process.cwd(), 'assets', `${name}${ext}`);
                if (fs.existsSync(fullPath)) return fullPath;
            }
            return null;
        };

        const getOwnerImageBuffer = () => {
            const assetsPath = path.join(process.cwd(), 'assets');
            if (!fs.existsSync(assetsPath)) return null;
            const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
            return files.length > 0 ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)])) : null;
        };

        let finalMedia;
        if (command === 'ownermenu') {
            finalMedia = getOwnerImageBuffer() || (findImagePath('thumbnail') ? fs.readFileSync(findImagePath('thumbnail')) : null);
        } else {
            let imgName = (command === 'allmenu' || command === 'listmenu') ? 'allmenu' : categoryTarget;
            let pth = findImagePath(imgName) || findImagePath('thumbnail');
            finalMedia = pth ? fs.readFileSync(pth) : null;
        }

        const check = validateAccess(categoryTarget, isOwner, userData.premium);
        if (!check.allowed && !['all', 'list', 'ai'].includes(categoryTarget)) { 
            await m.react('🚫');
            return conn.sendMessage(m.chat, { 
                image: { url: global.fake }, 
                caption: `❌ **AKSES TERBATAS**\n\n${check.msg}` 
            }, { quoted: fakeQuoted });
        }

        let header = `╭── ❏ *I N F O R M A T I O N* ❏
│ \`\`\`❏ Bot Name  : ${global.botname}\`\`\`
│ \`\`\`❏ Developer : ${global.namaOwner}\`\`\`
│ \`\`\`❏ Mode      : ${modeBot}\`\`\`
│ \`\`\`❏ Uptime    : ${uptimeStr}\`\`\`
│ \`\`\`❏ Status    : ${userStatus}\`\`\`
│ \`\`\`❏ Fitur     : ${allPlugins.length} Fitur\`\`\`
╰───────────────➣`;

        if (command === 'allmenu' || command === 'listmenu') {
            const categories = [...new Set(allPlugins.map(p => (p.category).toLowerCase()))].sort();
            for (let cat of categories) {
                const fiturGrup = allPlugins.filter(p => (p.category).toLowerCase() === cat);
                if (fiturGrup.length > 0) {
                    listFitur.push(`\n╭─── ❏ *${cat.toUpperCase()} MENU* ❏`);
                    fiturGrup.forEach(p => listFitur.push(`│ ✧${getFiturLabel(p)}✧ ${usedPrefix}${p.name}`));
                    listFitur.push(`╰─ ❏`);
                }
            }
        } else {
            if (categoryTarget === 'stalk') categoryTarget = 'stalking';
            if (categoryTarget === 'prem') categoryTarget = 'premium';
            const fitur = allPlugins.filter(p => (p.category).toLowerCase().includes(categoryTarget));

            if (fitur.length === 0) {
                await m.react('❌');
                return conn.sendMessage(m.chat, { 
                    image: finalMedia,
                    caption: `_Maaf, untuk kategori *${categoryTarget}* tidak ditemukan atau mungkin masih dalam tahap pengembangan🙏._` 
                }, { quoted: fakeQuoted });
            }

            listFitur.push(`\n╭── ❏ *${categoryTarget.toUpperCase()} MENU* ❏`);
            fitur.forEach(p => listFitur.push(`│ ✧${getFiturLabel(p)}✧ ${usedPrefix}${p.name}`));
            listFitur.push(`╰─ ❏`);
        }

        const deskripsi = `❏ D E S C R I P T I O N ❏ \nCastorice Assistant by Radja adalah asisten virtual berbasis Node.js (Baileys Multi-Device) 
yang dirancang untuk memberikan kemudahan akses informasi, hiburan, dan alat bantu produktivitas secara otomatis melalui WhatsApp.`;

        let bodyText = `${greeting}\nJangan lupa baca aturan penggunaannya ya...\n\n${deskripsi}\n\n${header}\n${listFitur.join('\n')}\n\n© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʀᴀᴅᴊᴀ ᴇɴɢɪɴᴇ`;

        try {
            const sendOptions = {
                caption: bodyText,
                mentions: [m.sender],
                contextInfo: { mentionedJid: [m.sender], isForwarded: true, forwardingScore: 1 }
            };

            if (finalMedia) {
                await conn.sendMessage(m.chat, { image: finalMedia, ...sendOptions }, { quoted: fakeQuoted });
            } else {
                await conn.sendMessage(m.chat, { image: { url: global.url }, ...sendOptions }, { quoted: fakeQuoted });
            }
            await m.react('✅');
        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, { 
                image: { url: global.fake },
                caption: 'gagal memuat list kategori menu', 
                mentions: [m.sender] 
            }, { quoted: fakeQuoted });
        }
    }
};
