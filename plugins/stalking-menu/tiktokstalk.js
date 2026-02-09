import axios from 'axios';

export default {
    name: 'tiktokstalk',
    alias: ['ttstalk', 'stalktt'],
    category: 'stalking',
    limit: true,
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        // 1. Instruksi Jika Input Kosong (Pake Gambar global.stalking)
        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.stalking },
                caption: `乂  *ＴＩＫＴＯＫ  ＳＴＡＬＫ*\n\nSilahkan masukkan username target.\n\nContoh: *${usedPrefix + command}* nyraleii` 
            });
        }

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            // 2. Fetch Data dari API FAA
            const { data } = await axios.get(`https://api-faa.my.id/faa/tiktokstalk?username=${encodeURIComponent(text)}`);

            // Cek status API
            if (!data.status || !data.result) {
                return conn.sendMessage(m.chat, { 
                    image: { url: global.stalking },
                    caption: `❌ User *@${text}* tidak ditemukan.` 
                });
            }

            const r = data.result;
            const s = r.stats;

            // 3. Susun Caption Mewah sesuai JSON baru
            let caption = `乂  *ＴＩＫＴＯＫ  ＵＳＥＲ  ＩＮＦＯ*\n\n`
            caption += `┌  ◦  *Name* : ${r.name}\n`
            caption += `│  ◦  *Username* : @${r.username}\n`
            caption += `│  ◦  *ID* : ${r.id}\n`
            caption += `│  ◦  *Region* : ${r.region?.toUpperCase() || 'Unknown'}\n`
            caption += `│  ◦  *Verified* : ${r.verified ? '✅' : '❌'}\n`
            caption += `│  ◦  *Account* : ${r.private ? '🔒 Private' : '🔓 Public'}\n`
            caption += `└  ◦  *Bio* : ${r.bio || '-'}\n\n`
            
            caption += `乂  *ＵＳＥＲ  ＳＴＡＴＩＳＴＩＣ*\n\n`
            caption += `┌  ◦  *Followers* : ${s.followers.toLocaleString()}\n`
            caption += `│  ◦  *Following* : ${s.following.toLocaleString()}\n`
            caption += `│  ◦  *Total Likes* : ${s.likes.toLocaleString()}\n`
            caption += `│  ◦  *Videos* : ${s.videos.toLocaleString()}\n`
            caption += `└  ◦  *Friends* : ${s.friend.toLocaleString()}\n`

            // 4. Kirim Foto Profil Target
            await conn.sendMessage(m.chat, { 
                image: { url: r.avatar }, 
                caption: caption 
            });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, { 
                image: { url: global.stalking },
                caption: "⚠️ Gagal mengambil data TikTok. Coba lagi nanti." 
            });
        }
    }
};