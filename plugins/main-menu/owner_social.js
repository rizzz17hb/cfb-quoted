import fs from 'fs';
import path from 'path';

export default {
    name: 'sosmed',
    alias: ['ttowner', 'tgowner', 'gcbot', 'igowner'], 
    category: 'main',
    hidden: true, 
    exec: async ({ conn, m, command }) => {
        // 1. React Awal (Proses)
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        let text = '';
        const imagePath = path.join(process.cwd(), 'assets', 'sosmed.jpg');

        // Logic Konten berdasarkan Command
        switch (command) {
            case 'igowner':
                text = `📸 *INSTAGRAM OWNER*\n\nFollow Instagram Radja Ya:\n🔗 https://www.instagram.com/fanatickurumi`;
                break;
            case 'ttowner':
                text = `🎬 *TIKTOK OWNER*\n\nFollow TikTok Radja Juga Ya:\n🔗 https://www.tiktok.com/@nyraleii`;
                break;
            case 'tgowner':
                text = `✈️ *TELEGRAM OWNER*\n\nHubungi dev melalui jalur pribadi Telegram:\n🔗 https://t.me/fanatic_kurumi`;
                break;
            case 'gcbot':
                text = `👥 *GROUP COMMUNITY*\n\nTempat kumpul user untuk diskusi & update:\n🔗 https://chat.whatsapp.com/Ez8TnTrtLWR6T39oZhpg0b`;
                break;
        }

        if (text) {
            try {
                let hasImage = fs.existsSync(imagePath);
                let imageSource = hasImage ? fs.readFileSync(imagePath) : { url: 'https://files.catbox.moe/0umsgb.jpg' };

                // 2. Kirim Pesan Tanpa ExternalAdReply
                await conn.sendMessage(m.chat, {
                    image: imageSource,
                    caption: text,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 1,
                        isForwarded: true
                    }
                }, { quoted: m });

                // 3. React Akhir (Sukses)
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            } catch (e) {
                console.error("Error Sosmed Plugin:", e);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                await conn.sendMessage(m.chat, { 
                image: { url: global.url },
                caption: `⚠️ Gagal memuat sosmed owner` 
            }, { quoted: m });
            }
        }
    }
}