import axios from "axios";
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'ytmp4',
    alias: ['ytv', 'ytvideo'],
    category: 'download',
    limit: true,
    async exec({ conn, m, args, text, usedPrefix, command }) {
        // 1. Ambil input dari berbagai sumber
        let input = text || (m.quoted ? m.quoted.text : args[0]);

        // 2. Cek kalau kosong atau linknya bukan YouTube
        if (!input || !/(youtube\.com|youtu\.be|shorts)/i.test(input)) {
            // Kasih reaksi bingung
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });

            // Kirim instruksi pake gambar biar keren
            return conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `⚠️ *Mana link YouTube-nya ?*\n\nContoh:\n> ${usedPrefix + command} https://youtu.be/xxxx` 
            }, { quoted: m });
        }

        // 3. JIKA LOLOS, BARU REACT LOADING
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        // ... Lanjut ke proses ytdlp Master ...

        // 1. Kirim Pesan Proses (Sama seperti ytmp3)
        await conn.sendMessage(m.chat, { 
            image: { url: global.download }, 
            caption: 'Castorice sedang memproses, video akan segera dikirim' 
        })

        try {
            const info = await getMetadata(input);
            
            // 2. POLLING / TUNGGU LINK MP4
            let dl = null;
            let attempts = 0;
            const maxAttempts = 15;

            while (attempts < maxAttempts) {
                try {
                    dl = await ytdlp('video', input);
                    // Validasi link
                    if (!dl || dl.includes('processing') || dl.includes('html')) {
                        throw new Error("Belum siap");
                    }
                    break;
                } catch (err) {
                    attempts++;
                    if (attempts >= maxAttempts) throw new Error("Gagal mendapatkan link video (Server timeout/blocked)");
                    // Tunggu 1.5 detik sebelum coba lagi
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }

            await m.react('🎬');

            // 3. Persiapkan Media Header
            let mediaType = { video: { url: dl } };
            const media = await prepareWAMessageMedia(mediaType, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                header: {
                    title: "YouTube Video",
                    hasMediaAttachment: true,
                    videoMessage: media.videoMessage
                },
                body: { 
                    text: `Ｙ Ｏ Ｕ Ｔ Ｕ Ｂ Ｅ\n\n*${info.title}*\n` 
                },
                footer: { text: "Castorice Assistant" },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ 
                            display_text: "🎵 ᗩᗰᗷIᒪ ᗩᑌᗪIO", 
                            id: `.ytmp3 ${input}` 
                        })
                    }]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { 
                    message: { interactiveMessage } 
                } 
            }, { userJid: conn.user.id });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            // Pesan error menggunakan global.download juga agar konsisten
            await conn.sendMessage(m.chat, { 
                image: { url: global.download }, 
                caption: `Castorice gagal memproses audio, mohon hubungi owner castorice untuk lapor eror: ${e.message}` 
            })
        }
    }
}

// --- ENGINE DOWNLODER (YTDLP ONLINE) ---
async function ytdlp(type = 'video', videoUrl) {
    const cmd = type === 'audio' ? '-x --audio-format mp3' : '-f 136+140';
    
    const res = await axios.get(`https://ytdlp.online/stream?command=${encodeURIComponent(`${cmd} ${videoUrl}`)}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Referer': 'https://ytdlp.online/'
        }
    })

    const data = res.data
    const match = data.match(/href="([^"]+\.mp4)"/)
    
    if (!match) throw new Error('Link MP4 belum muncul (Sedang merging...)')

    return match[1].startsWith('http') ? match[1] : 'https://ytdlp.online' + match[1]
}

// --- ENGINE METADATA ---
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