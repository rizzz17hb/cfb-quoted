import axios from "axios";
import FormData from "form-data";
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import('@whiskeysockets/baileys')).default;
const ttSearch = async (query, count = 3) => {
    try {
        let d = new FormData();
        d.append("keywords", query);
        d.append("count", count);
        d.append("cursor", 0);
        d.append("web", 1);
        d.append("hd", 1);

        let { data } = await axios.post("https://tikwm.com/api/feed/search", d, {
            headers: {
                ...d.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        if (!data.data || !data.data.videos) return [];
        
        return data.data.videos.map(v => ({
            play: v.play.startsWith('http') ? v.play : "https://tikwm.com" + v.play,
            title: v.title || "Tiktok Video",
            origin_url: `https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}`
        }));
    } catch (e) {
        return [];
    }
}

export default {
    name: 'tiktoksearch',
    alias: ['ttsearch', 'ttfind'],
    category: 'search',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            if (!text) {
                await m.react('❓');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.search },
                    caption: `*INPUT DIPERLUKAN*\n\nContoh: ${usedPrefix + command} jedag jedug | 3` 
                }, { quoted: m });
            }

            let [query, jumlah] = text.split("|").map(v => v.trim());
            let count = Math.min(parseInt(jumlah) || 3, 5);

            await m.react('🔍');

            let videos = await ttSearch(query, count);
            if (!videos.length) throw new Error("Video tidak ditemukan.");

            await m.react('📽️');

            for (let i = 0; i < videos.length; i++) {
                const video = videos[i];
                
                // Prepare Media dengan protokol Radja
                const media = await prepareWAMessageMedia(
                    { video: { url: video.play } }, 
                    { upload: conn.waUploadToServer }
                );

                const interactiveMessage = {
                    header: {
                        title: `HASIL KE-${i + 1}`,
                        hasMediaAttachment: true,
                        videoMessage: media.videoMessage
                    },
                    body: { 
                        text: `*Judul:* ${video.title}\n\n_TikTok Search System_` 
                    },
                    footer: { text: "Radja Engine Security" },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ 
                                display_text: "🎵 ᗩᗰᗷIᒪ ᗩᑌᗪIO", 
                                id: `${usedPrefix}ttaudio ${video.origin_url}` 
                            })
                        }]
                    }
                };

                const msg = generateWAMessageFromContent(m.chat, { 
                    viewOnceMessage: { 
                        message: { interactiveMessage } 
                    } 
                }, { userJid: conn.user.id, quoted: m });

                await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                
                // Jeda 2 detik agar tidak dianggap spam oleh WhatsApp
                await new Promise(r => setTimeout(r, 2000));
            }

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                image: { url: global.search },
                caption: `*PENCARIAN GAGAL*\n\nAlasan: ${e.message || "Server Sedang Sibuk"}`
            }, { quoted: m });
        }
    }
};
