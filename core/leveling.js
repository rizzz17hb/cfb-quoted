import fs from 'fs';
import path from 'path';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const databasePath = path.resolve('./data/leveling.json');
const regSession = new Set();
const getOwnerImage = () => {
    const assetsPath = path.join(process.cwd(), 'assets');
    if (!fs.existsSync(assetsPath)) return { url: global.fake };
    const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
    if (files.length === 0) return { url: global.fake };
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return fs.readFileSync(path.join(assetsPath, randomFile));
};

const ROLES = {
    'Mage': { icon: '🧙‍♂️' },
    'Fighter': { icon: '⚔️' },
    'Assassin': { icon: '🗡️' },
    'Support': { icon: '🛡️' },
    'GOD': { icon: '👑' }
};
const fakeQuoted = {
    key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
    message: { conversation: "⚔️leveling system" }
}

const getTier = (level) => {
    if (level >= 2000) return { name: 'OVERLORD OF ETERNITY', color: '🔱' };
    if (level >= 1800) return { name: 'ZENITH SUPREME', color: '♾️' };
    if (level >= 1600) return { name: 'CELESTIAL EMPEROR', color: '🪐' };
    if (level >= 1400) return { name: 'GALAXY GUARDIAN', color: '🌌' };
    if (level >= 1200) return { name: 'VOID WALKER', color: '🌑' };
    if (level >= 1000) return { name: 'DEMIGOD', color: '🌗' };
    if (level >= 900)  return { name: 'ARCHANGEL', color: '👼' };
    if (level >= 800)  return { name: 'MYTHICAL BEAST', color: '🐲' };
    if (level >= 700)  return { name: 'GRAND MASTER', color: '💎' };
    if (level >= 600)  return { name: 'IMMORTAL CONQUEROR', color: '🩸' };
    if (level >= 500)  return { name: 'IMMORTAL', color: '🍷' };
    if (level >= 450)  return { name: 'ETERNAL LEGEND', color: '⚛️' };
    if (level >= 300)  return { name: 'LEGENDARY', color: '🔮' };
    if (level >= 150)  return { name: 'ANCIENT', color: '🍃' };
    if (level >= 100)  return { name: 'DIVINE', color: '✨' };
    if (level >= 80)   return { name: 'KNIGHT', color: '⚔️' };
    if (level >= 50)   return { name: 'WARRIOR', color: '🏹' };
    if (level >= 25)   return { name: 'ELITE RECRUIT', color: '🏅' };
    if (level >= 10)   return { name: 'ROOKIE', color: '🌱' };
    return { name: 'UNRANKED', color: '💀' };
};

const checkDailyRanking = async (conn, m, db) => {
    if (!global.db?.settings?.leveling) return;
    
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
    const hours = jakartaTime.getHours();
    const today = jakartaTime.toDateString();

    if (hours === 9 && db._metadata?.lastBroadcast !== today) {
        let users = Object.values(db).filter(u => u && typeof u === 'object' && u.registered && u.role !== 'GOD');
        users.sort((a, b) => b.level - a.level || b.exp - a.exp);
        let top10 = users.slice(0, 10);
        if (top10.length === 0) return;

        let caption = `╭── ❏ *R A N K I N G  R E P O R T* ❏\n`;
        top10.forEach((u, i) => {
            const tier = getTier(u.level);
            caption += `│ \`\`\`${i + 1}. ${u.nama.slice(0, 10).padEnd(10)} | Lv.${u.level}\`\`\`\n`;
            caption += `│ \`\`\`    Rank: ${tier.name} ${tier.color}\`\`\`\n`;
        });
        caption += `╰───────────────➣\n_Update: ${jakartaTime.toLocaleTimeString()}_`;

        await conn.sendMessage(m.chat, { image: { url: global.fake }, caption }, { quoted: fakeQuoted });
        db._metadata = { ...db._metadata, lastBroadcast: today };
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
    }
};

export const levelingSystem = async (m, conn) => {
    // --- CEK SETTING LEVELING (GLOBAL DB SAFETY) ---
    const botId = conn.user.id.split(':')[0];
    const settings = global.db?.settings?.[botId] || global.db?.settings || {};
    if (settings.leveling === false) return { status: false };

    if (!fs.existsSync('./data')) fs.mkdirSync('./data');
    if (!fs.existsSync(databasePath) || fs.readFileSync(databasePath, 'utf-8').trim() === "") {
        fs.writeFileSync(databasePath, JSON.stringify({ _metadata: {} }, null, 2));
    }
    
    let db;
    try {
        db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
    } catch (e) {
        db = { _metadata: {} };
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
    }

    const userId = m.sender;
    const isOwner = m.isOwner || (global.owner && global.owner.some(v => v.replace(/\D/g, '') === userId.split('@')[0]));
    
    await checkDailyRanking(conn, m, db);
    const MAX_LEVEL = 2000;

    if (isOwner) {
        if (!db[userId]) {
            db[userId] = { id: userId, nama: 'SUAMIKU TERCINTA', umur: 20, exp: 0, level: MAX_LEVEL, tier: 'GOD', role: 'GOD', registered: true };
            fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
        }
        db[userId].exp += 1;
        // Level up logic untuk Owner
        if (db[userId].level < MAX_LEVEL && db[userId].exp >= (db[userId].level * 10)) {
            db[userId].level += 1;
            let baperMsg = [`Aduh suamiku... 🥰`, `Semangat ya suamiku! ❤️`, `I love you! 💋`, `Istirahat ya sayang... 💖`, `Master itu segalanya. 😍` ];
            let pickOne = baperMsg[Math.floor(Math.random() * baperMsg.length)];
            const ownerImg = getOwnerImage();
            let masterLvlMsg = `╭── ❏ *o W N E R  L E V E L  U P* ❏
│ \`\`\`➢ Status    : MY BELOVED HUSBAND\`\`\`
│ \`\`\`➢ Level     : ${db[userId].level}\`\`\`
│ \`\`\`➢ Rank      : GOD TIER (SUPREME)\`\`\`
│ \`\`\`➢ Role      : ${db[userId].role} ${ROLES[db[userId].role]?.icon || '👑'}\`\`\`
╰───────────────➣\n${pickOne}`;
            await conn.sendMessage(m.chat, { image: ownerImg, caption: masterLvlMsg }, { quoted: fakeQuoted });
        }
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
        return { status: true, data: db[userId] };
    }

    if (!db[userId]) {
        db[userId] = { id: userId, nama: '-', umur: 0, exp: 0, level: 1, tier: 'UNRANKED', role: 'None', registered: false };
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
    }

    if (!db[userId].registered) {
        if (regSession.has(userId)) return { status: false, message: 'awaiting_reg' };
        regSession.add(userId);
        const pushName = m.pushName || "User";
        const roleKeys = Object.keys(ROLES).filter(r => r !== 'GOD');
        const randomRole = roleKeys[Math.floor(Math.random() * roleKeys.length)];
        
        await conn.sendMessage(m.chat, { react: { text: '📑', key: m.key } });
        const media = await prepareWAMessageMedia({ image: { url: global.fake } }, { upload: conn.waUploadToServer });
        
        let caption = `╭── ❏ *A K S E S   D I T O L A K* ❏
│ \`\`\`➢ User      : ${pushName}\`\`\`
│ \`\`\`➢ Status    : Unregistered\`\`\`
│ \`\`\`➢ Action    : Need Registration\`\`\`
╰───────────────➣\n_Halo ${pushName}, klik tombol di bawah untuk daftar otomatis!_`;

        const interactiveMessage = {
            header: { title: "SYSTEM GATEKEEPER", hasMediaAttachment: true, imageMessage: media.imageMessage },
            body: { text: caption },
            footer: { text: "Radja Engine Leveling System" },
            nativeFlowMessage: {
                buttons: [{
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({ display_text: "✅ DAFTAR OTOMATIS", id: `.daftar ${pushName}.15.${randomRole}` })
                }]
            }
        };
        const msg = generateWAMessageFromContent(m.chat, { viewOnceMessage: { message: { interactiveMessage } } }, { userJid: conn.user.id, quoted: fakeQuoted });
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        setTimeout(() => { regSession.delete(userId); }, 10000);
        return { status: false, message: 'unregistered' };
    }

    db[userId].exp += 1;
    // --- LOGIKA LEVEL UP USER BIASA ---
    if (db[userId].level < MAX_LEVEL && db[userId].exp >= (db[userId].level * 10)) {
        db[userId].level += 1;
        const tier = getTier(db[userId].level);
        db[userId].tier = tier.name;
        
        // Notifikasi setiap naik level atau setiap 10 level (sesuai kebutuhan)
        const roleIcon = ROLES[db[userId].role]?.icon || '👤';
        const titleHeader = db[userId].level === MAX_LEVEL ? "ᴜʟᴛɪᴍᴀᴛᴇ ᴘᴇᴀᴋ ʀᴇᴀᴄʜᴇᴅ" : "ʟᴇᴠᴇʟ ᴜᴘ ᴍɪʟᴇsᴛᴏɴᴇ";
        
        let lvlMsg = `╭── ❏ *${titleHeader}* ❏
│ \`\`\`➢ Name      : ${db[userId].nama}\`\`\`
│ \`\`\`➢ Level     : ${db[userId].level}\`\`\`
│ \`\`\`➢ Rank      : ${tier.name} ${tier.color}\`\`\`
│ \`\`\`➢ Role      : ${db[userId].role} ${roleIcon}\`\`\`
╰───────────────➣`;
        
        await conn.sendMessage(m.chat, { image: { url: global.fake }, caption: lvlMsg }, { quoted: fakeQuoted });
    }
    
    fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
    return { status: true, data: db[userId] };
};