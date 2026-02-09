import axios from 'axios';
import * as cheerio from 'cheerio';

// Fungsi buat dapet token & session dari snappin.app
async function getSnappinToken() {
    try {
        let { headers, data } = await axios.get('https://snappin.app/', {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            }
        });
        let cookies = headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
        let $ = cheerio.load(data);
        let csrfToken = $('meta[name="csrf-token"]').attr('content');
        return { csrfToken, cookies };
    } catch (e) {
        return { csrfToken: null, cookies: null };
    }
}

export default {
    name: 'pinterest',
    alias: ['pindl', 'pinterestdl'], // Saya hapus 'pin' biar gak tabrakan sama command .pinterest (search)
    category: 'download',
    limit: true,
    async exec({ conn, m, text, args }) {
        // Ambil link dari teks, quote, atau argumen
        let input = text || (m.quoted ? m.quoted.text : args[0]);
        
        // FIX 1: Regex Support Link Pin Asli ATAU Link Gambar Langsung
        let url = input?.match(/https?:\/\/(www\.|id\.)?pinterest\.(com|it|ca|co\.uk|at|ch)\/pin\/[^\s?]+/i)?.[0] 
                || input?.match(/https?:\/\/i\.pinimg\.com\/[^\s]+/i)?.[0] 
                || input;

        // --- 1. GABUNG PENGECEKAN BIAR RAPI ---
        if (!url || (!url.includes('pinterest') && !url.includes('pinimg'))) {
            // 1. Tetap kasih React
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });

            // 2. Kirim Gambar + Teks (Caption)
            return conn.sendMessage(m.chat, { 
                image: { url: global.download }, // Ambil foto dari global variabel lu
                caption: "*Format link salah atau kosong!*\nHarus link Pin Pinterest yang valid ya Master." 
            }, { quoted: m });
        }
        // --- 2. REACT LOADING PAS LINK VALID ---
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            // LOGIKA KHUSUS: Kalau link langsung gambar (i.pinimg.com), langsung kirim.
            // Kita gak perlu scrape snappin kalau gambarnya sudah ketemu.
            if (url.includes('i.pinimg.com')) {
                 await conn.sendMessage(m.chat, {
                    image: { url: url },
                    caption: `Done! ✅ (Direct Image)`
                }, { quoted: m });
                return await m.react('✅');
            }

            // JIKA LINK PIN (pinterest.com/pin/), LAKUKAN SCRAPE
            let { csrfToken, cookies } = await getSnappinToken();
            if (!csrfToken) throw new Error("Gagal inisialisasi token Snappin.");

            let { data } = await axios.post('https://snappin.app/', { url }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                    'Cookie': cookies,
                    'Referer': 'https://snappin.app',
                    'Origin': 'https://snappin.app',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            let $ = cheerio.load(data);
            let downloadLinks = $('a.button.is-success').map((_, el) => $(el).attr('href')).get();

            // Fallback kalau class button berubah, cari link yang ada kata 'download' atau 'media'
            if (!downloadLinks.length) {
                 downloadLinks = $('a[href*="download"]').map((_, el) => $(el).attr('href')).get();
            }

            if (!downloadLinks.length) throw new Error("Gagal scrape link download.");

            let mediaUrl = null;
            let type = 'image';

            // Loop buat cari yang video dulu
            for (let link of downloadLinks) {
                let fullLink = link.startsWith('http') ? link : 'https://snappin.app' + link;
                
                try {
                    let head = await axios.head(fullLink, { 
                        headers: { 'User-Agent': 'Mozilla/5.0' } 
                    });
                    let contentType = head?.headers?.['content-type'] || '';
                    
                    if (contentType.includes('video')) {
                        mediaUrl = fullLink;
                        type = 'video';
                        break; 
                    } else if (contentType.includes('image')) {
                        mediaUrl = fullLink;
                        type = 'image';
                    }
                } catch (err) {}
            }

            if (!mediaUrl) throw new Error("Media tidak ditemukan.");

            await conn.sendMessage(m.chat, {
                [type]: { url: mediaUrl },
                caption: `Done Radja! ✅\n\nType: ${type.toUpperCase()}`
            }, { quoted: m });

            await m.react('✅');

        } catch (e) {
            // Console error disembunyikan
            
            await m.react('❌');
            
            // Kirim pesan error dengan gambar global.download
            await conn.sendMessage(m.chat, {
                image: { url: global.download },
                caption: `Gagal download Pinterest. Mungkin link privat atau server scraper sedang error!`
            }, { quoted: m });
        }
    }
};