import { igaudio } from '../../lib/scraper/index.js'; 

export default {
    name: 'igaudio',
    alias: ['instaaudio', 'igmp3', 'reelsaudio'],
    category: 'download',
    async exec({ conn, m, text, command }) {
        // Membersihkan url dari spasi atau karakter liar
        let url = text?.trim().split(/\?| /)[0]; 
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        if (!url) return;

        if (!/(instagram\.com\/(reel|p|reels|tv|stories))/i.test(url)) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(
                m.chat,
                {
                    image: { url: global.download },
                    caption: "❌ *Link Instagram tidak valid!*\nPastikan linknya bener ya (Reel/Post/Story)."
                },
                { quoted: fail }
            );
        }

        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        const sendAudio = async (audioUrl, isFallback = false) => {
            try {
                // Kita ambil buffernya dulu biar lebih aman dikirim WhatsApp
                const { data } = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                
                await conn.sendMessage(m.chat, {
                    audio: data, // Kirim sebagai buffer
                    mimetype: 'audio/mp4', // Pakai audio/mp4 sering lebih stabil di WA
                    fileName: 'CastoriceAudio.mp3',
                    ptt: false,
                    contextInfo: {
                        externalAdReply: {
                            showAdAttribution: true,
                            title: "Ｉ Ｎ Ｓ Ｔ Ａ Ｇ Ｒ Ａ Ｍ • Ａ Ｕ Ｄ Ｉ Ｏ",
                            body: isFallback ? "Server Cadangan" : "Castorice Assistant",
                            thumbnailUrl: global.download ,
                            sourceUrl: url,
                            mediaType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: fake });

                await m.react('✅');
            } catch (err) {
                await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { quoted: fake });
            }
        };

        try {
            const res = await igaudio(url);
            
            if (!res || !res.audio) throw new Error("Audio not found");

            await sendAudio(res.audio, res.source !== "reelsvideo");

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(
                m.chat,
                {
                    image: { url: global.download },
                    caption: "❏ K E S A L A H A N  S Y S T E M ❏\nAlasan: Gagal mengambil audio. Link mungkin privat atau audio tidak tersedia di server cadangan."
                },
                { quoted: fail }
            );
        }
    }
};