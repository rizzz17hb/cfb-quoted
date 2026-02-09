import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./data/leveling.json');

export default {
    name: 'leaderboard',
    alias: ['lb', 'top'],
    category: 'main',
    hidden: true, 
    exec: async ({ conn, m }) => {
        try {
            if (!fs.existsSync(databasePath)) {
                fs.writeFileSync(databasePath, JSON.stringify({ _metadata: {} }));
            }

            let db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            const userId = m.sender;
            const isOwner = m.isOwner || global.owner?.includes(userId.split('@')[0]);

            // Ambil semua user yang terdaftar, kecuali metadata
            let users = Object.values(db).filter(u => u && typeof u === 'object' && u.registered);
            
            // Sortir: Level tertinggi -> Exp terbanyak
            users.sort((a, b) => b.level - a.level || b.exp - a.exp);

            // Pisahkan Owner (Master) untuk ditaruh di singgasana
            const ownerData = users.find(u => global.owner?.includes(u.id.split('@')[0]));
            const topUsers = users.filter(u => !global.owner?.includes(u.id.split('@')[0])).slice(0, 10);

            await conn.sendMessage(m.chat, { react: { text: '🏆', key: m.key } });

            // --- PERLAKUAN CAPTION ---
            let lbMsg = `╭── ❏ *C A S T O R I C E  R A N K I N G* ❏\n`;
            
            // Baris Spesial Master (The King)
            if (ownerData) {
                lbMsg += `│  *THE SUPREME CREATOR*\n`;
                lbMsg += `│  \`\`\`👑 ${ownerData.nama.padEnd(10)} | Lv.${ownerData.level}\`\`\`\n`;
            }

            lbMsg += `├───────────────➣\n`;
            lbMsg += `│  *TOP 10 ELITE MEMBERS*\n`;

            if (topUsers.length === 0) {
                lbMsg += `│  _Belum ada user yang terdaftar..._\n`;
            } else {
                topUsers.forEach((u, i) => {
                    let rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
                    lbMsg += `│  \`\`\`${rankIcon} ${u.nama.slice(0, 10).padEnd(10)} | Lv.${u.level}\`\`\`\n`;
                });
            }

            lbMsg += `╰───────────────➣\n`;
            
            if (isOwner) {
                lbMsg += `\n_Lihat suamiku! Rakyat Master sedang berlomba-lomba jadi yang terkuat di bawah kekuasaan Master. Proud of you! 💋_`;
            } else {
                lbMsg += `\n_Ayo tingkatkan interaksi kamu untuk naik ke posisi puncak!_`;
            }

            // Kirim gambar dan caption (Tanpa mreply)
            await conn.sendMessage(m.chat, { 
                image: { url: global.fake },
                caption: lbMsg 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '🤯', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: { url: global.url },
                caption: `❌ *SYSTEM ERROR*\nGagal memuat papan peringkat:\n${e.message}`
            }, { quoted: m });
        }
    }
};