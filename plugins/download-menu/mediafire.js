import { get } from 'https';
import { parse } from 'url';

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const options = {
      ...parse(url),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.mediafire.com/',
      },
    };

    get(options, (res) => {
      // Handle redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHtml(res.headers.location).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function getDirectLinkAndName(mediafireUrl) {
  const html = await fetchHtml(mediafireUrl);

  // Pattern terbaru: cari href di link download utama
  const directMatch = html.match(/href=["'](https:\/\/download\d+\.mediafire\.com\/[^"']+)["']/i);
  if (directMatch && directMatch[1]) {
    const directLink = directMatch[1];

    // Extract filename dari text link atau title
    let fileName = 'downloaded_file';
    const nameInLink = directLink.split('/').pop();
    if (nameInLink) fileName = decodeURIComponent(nameInLink);

    // Alternatif: dari teks filename di halaman
    const nameMatch = html.match(/class=["']?filename["']?[^>]*>([^<]+)</i) ||
                      html.match(/<title>([^<]+) - MediaFire<\/title>/i);
    if (nameMatch) fileName = nameMatch[1].trim();

    return { directLink, fileName };
  }

  // Fallback lama
  const ariaMatch = html.match(/<a[^>]+aria-label=["']?Download file["']?[^>]+href=["']([^"']+)["']/i);
  if (ariaMatch && ariaMatch[1]) {
    const directLink = ariaMatch[1].startsWith('http') ? ariaMatch[1] : 'https://www.mediafire.com' + ariaMatch[1];
    let fileName = 'downloaded_file';
    const nameMatch = html.match(/class=["']?filename["']?[^>]*>([^<]+)</i);
    if (nameMatch) fileName = nameMatch[1].trim();
    return { directLink, fileName };
  }

  throw new Error('Gagal menemukan direct download link. Layout MediaFire berubah lagi atau link invalid/private/deleted.');
}

function downloadFile(directLink) {
  return new Promise((resolve, reject) => {
    get(directLink, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // Follow redirect jika ada
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Gagal download: ${res.statusCode} ${res.statusMessage}`));
        return;
      }

      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

export default {
    name: 'mediafire',
    alias: ['mfdl', 'mf', 'mfire'],
    category: 'download',
    desc: 'Download file dari MediaFire (Native HTTP)',
    async exec({ conn, m, text, args, command }) {
      const fake = {
        key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
        message: { conversation: command }
      };
      const fail = {
        key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
        message: { conversation: "❌failed" }
      };
        try {
            // 1. INPUT HANDLING (Support Quote/Teks)
            let input = text || (m.quoted ? m.quoted.text : args[0]); // Pake args[0] biar lebih peka
            let url = input?.match(/https?:\/\/(?:www\.)?mediafire\.com\/file\/[^\s]+/i)?.[0];

            if (!url) {
                // --- 1. REACT TANDA TANYA ---
                await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });

                return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "❌ Kirim link MediaFire yang valid!\nContoh: .mf https://www.mediafire.com/file/.../file" 
            }, { quoted: fail });
        }

            const mediafireUrl = url.trim();

            // --- 2. REACT LOADING (Proses Grab Link) ---
            await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

            const { directLink, fileName } = await getDirectLinkAndName(mediafireUrl);
            // Console log dihilangkan untuk kerapian

            const buffer = await downloadFile(directLink);

            // Detect MIME sederhana
            let mime = 'application/octet-stream';
            if (buffer.slice(0, 4).toString('hex') === '25504446') mime = 'application/pdf'; // PDF
            else if (buffer.slice(0, 8).toString('hex') === 'ffd8ffe000104a464946') mime = 'image/jpeg';
            else if (buffer.slice(0, 4).toString('hex') === '89504e47') mime = 'image/png';
            else if (buffer.slice(0, 6).toString() === '%PDF-') mime = 'application/pdf';
            // Deteksi ekstensi dari filename jika magic number gagal
            else if (fileName.endsWith('.mp4')) mime = 'video/mp4';
            else if (fileName.endsWith('.mkv')) mime = 'video/mkv';

            const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

            const caption = `*MEDIAFIRE DOWNLOADED* ✅\n`;

            // GANTI M.REPLY -> CONN.SENDMESSAGE
            if (mime.startsWith('video/')) {
                await conn.sendMessage(m.chat, { video: buffer, caption, mimetype: 'video/mp4' }, { quoted: fake });
            } else if (mime.startsWith('image/')) {
                await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: fake });
            } else {
                await conn.sendMessage(m.chat, { document: buffer, fileName, mimetype: mime, caption }, { quoted: fake });
            }

            await m.react('✅');
        } catch (e) {
            // Console log dihilangkan
            
            await m.react('❌');
            // GANTI M.REPLY -> CONN.SENDMESSAGE + global.download
            await conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nAlasan: ${e.message}\n\nLink mungkin private, deleted, atau MediaFire lagi proteksi bot. Coba link lain atau tunggu update lagi.` 
            }, { quoted: fail });
        }
    }
};