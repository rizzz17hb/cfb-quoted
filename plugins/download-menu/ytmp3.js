import axios from 'axios'

// --- ENGINE METADATA (Ditaruh atas agar terdeteksi) ---
async function getMetadata(url) {
    const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/)
    if (!match) throw new Error('Link Youtube tidak valid')

    const res = await axios.post('https://www.terrific.tools/api/youtube/get-video-metadata', {
        videoId: match[1]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Postify/1.0.0'
        }
    })
    return res.data
}

// --- ENGINE DOWNLODER ---
async function ytdlp(type = 'audio', videoUrl) {
    const cmd = type === 'audio' ? '-x --audio-format mp3' : '-f 136+140'
    const res = await axios.get(`https://ytdlp.online/stream?command=${encodeURIComponent(`${cmd} ${videoUrl}`)}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://ytdlp.online/'
        }
    })

    const data = res.data
    const match = data.match(/href="([^"]+\.(?:mp3|mp4|m4a|webm))"/)
    if (!match) throw new Error('Link download tidak ditemukan (Server Blocked)')
    return match[1].startsWith('http') ? match[1] : 'https://ytdlp.online' + match[1]
}

export default {
    name: 'ytmp3',
    alias: ['yta', 'ytaudio'],
    category: 'download',
    exec: async ({ conn, m, args, text, usedPrefix, command }) => {
        // Ambil URL dari teks atau reply
        let url = text || (m.quoted ? m.quoted.text : args[0]);
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌ failed" }
        };

        try {
            if (!url || !url.includes('youtu')) {
                await m.react('❓')
                return await conn.sendMessage(m.chat, { 
                    image: { url: global.download }, 
                    caption: `Usage: ${usedPrefix + command} <YouTube URL>` 
                }, { quoted: fail })
            }

            await m.react('⏱️')

            // 1. Kirim Pesan Proses
            await conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: '🚀 *Castorice sedang memproses...*\nAudio akan segera dikirim.' 
            }, { quoted: fake })

            // 2. Ambil Data
            const info = await getMetadata(url)
            const dl = await ytdlp('audio', url)

            // 3. Kirim Audio
            await conn.sendMessage(m.chat, {
                audio: { url: dl },
                mimetype: 'audio/mpeg',
                fileName: `${info.title || 'audio'}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: info.title || 'YouTube Audio',
                        body: info.author || 'Castorice Downloader',
                        thumbnailUrl: info.thumbnailUrl || '',
                        sourceUrl: url,
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: fake })

            await m.react('✅')

        } catch (e) {
            console.error(e)
            await m.react('❌')
            await conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nAlasan: ${e.message}` 
            }, { quoted: fail })
        }
    }
}