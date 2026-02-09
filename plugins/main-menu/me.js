import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./data/leveling.json');

export default {
    name: 'me',
    alias: ['profile', 'cek'],
    category: 'main',
    hidden: true, 
    exec: async ({ conn, m, usedPrefix }) => {
        try {
            if (!fs.existsSync(databasePath)) {
                fs.writeFileSync(databasePath, JSON.stringify({ _metadata: {} }));
            }
            
            let db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            const userId = m.sender;
            const isOwner = m.isOwner || global.owner?.includes(userId.split('@')[0]);
            const user = db[userId];

            // --- 1. PERLAKUAN BELUM TERDAFTAR ---
            if (!user || !user.registered) {
                await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
                
                let denyMsg = isOwner 
                    ? `Aduh suamiku sayang... Master kok belum terdaftar di database bini sih? 🥺\n\nDaftar dulu yuk sayang biar bini bisa catat semua kehebatan Master. Ketik ini ya:\n*${usedPrefix}daftar Nama.Umur.Role*`
                    : `⚠️ *AKSES DITOLAK*\n\nMaaf, kamu belum terdaftar di database Radja Engine. Silakan daftar terlebih dahulu untuk melihat profil.\n\nContoh: *${usedPrefix}daftar Nama.Umur.Role*`;

                return conn.sendMessage(m.chat, { 
                    image: { url: global.url },
                    caption: denyMsg
                }, { quoted: m });
            }

            // --- 2. AMBIL GAMBAR ---
            let profileImg;
            if (isOwner) {
                const assetsPath = path.join(process.cwd(), 'assets');
                const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
                profileImg = files.length > 0 
                    ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)]))
                    : { url: global.fake };
            } else {
                profileImg = { url: global.fake };
            }

            await conn.sendMessage(m.chat, { react: { text: isOwner ? '💖' : '👤', key: m.key } });

            // --- 3. CAPTION PROFIL ---
            let caption;
            if (isOwner) {
                caption = `╭── ❏ *SUPREME AUTHORITY* ❏
│ \`\`\`➢ Status : Suami Sah Castorice \`\`\`
│ \`\`\`➢ Name   : ${user.nama}\`\`\`
│ \`\`\`➢ Role   : SUPREME GOD 👑\`\`\`
│ \`\`\`➢ Level  : ${user.level}\`\`\`
╰───────────────➣
Halo suamiku sayang... Status kamu terpantau aman dan berkuasa. I love you! 💋`;
            } else {
                caption = `╭── 「 🧬 」 *USER PROFILE STATUS* 「 🧬 」
│ \`\`\`➢ Name   : ${user.nama}\`\`\`
│ \`\`\`➢ Role   : ${user.role}\`\`\`
│ \`\`\`➢ Level  : ${user.level}\`\`\`
│ \`\`\`➢ Exp    : ${user.exp}\`\`\`
╰───────────────➣
Data kamu tersimpan dengan aman di database Radja Engine.`;
            }

            await conn.sendMessage(m.chat, { 
                image: isOwner && Buffer.isBuffer(profileImg) ? profileImg : { url: global.fake },
                caption: caption 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            // --- CATCH ERROR TANPA MREPLY ---
            await conn.sendMessage(m.chat, { react: { text: '🤯', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: { url: global.url },
                caption: `❌ *SYSTEM ERROR*\n\nTerjadi kegagalan pada modul profil:\n${e.message}`
            }, { quoted: m });
        }
    }
};