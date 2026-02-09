import axios from 'axios';
export default {
    name: 'pixiv',
    alias: ['pixivsearch', 'pixivs'],
    category: 'search',
    limit: true,
    isPremium: false,
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            if (!text) {
                await m.react('❓');
                return conn.sendMessage(m.chat, {
                    image: { url: global.search },
                    caption: `*PIXIV PREMIUM SEARCH*\n\nContoh: ${usedPrefix + command} miku r18`
                }, { quoted: m });
            }

            await m.react('⏱️');
            
            const args = text.split(" ");
            const query = args[0];
            const isR18 = args.some(arg => arg.toLowerCase() === 'r18');

            // 1. Fetching Data (Cadangan 20 gambar)
            const { data } = await axios.get(`https://api.lolicon.app/setu/v2`, {
                params: { r18: isR18 ? 1 : 0, num: 20, excludeAi: true, size: 'regular', keyword: query },
                timeout: 15000 
            });

            if (!data.data || data.data.length === 0) throw new Error("Gambar tidak ditemukan.");

            // 2. Head-Check Validation (Cek link hidup/mati)
            await m.react('🔎');
            const checks = data.data.slice(0, 15).map(async (res) => {
                try {
                    const check = await axios.head(res.urls.regular, { timeout: 4000 });
                    if (check.status === 200) return res;
                } catch { return null; }
            });

            const validImagesRaw = await Promise.allSettled(checks);
            let validImages = validImagesRaw
                .filter(p => p.status === 'fulfilled' && p.value !== null)
                .map(p => p.value);

            let selected = validImages.slice(0, 7);
            if (selected.length === 0) throw new Error("Server Pixiv sedang sibuk.");

            // 3. Susun Metadata Minimalis
            const metadata = selected.map((v, i) => `• ${i + 1}. ${v.title} - ${v.author}`).join('\n');
            const links = selected.map((v, i) => `• ${i + 1}. https://pixiv.net/artworks/${v.pid}`).join('\n');

            const mainCaption = `*PIXIV PREMIUM SEARCH*
            
• *Query:* ${query.toUpperCase()}
• *Status:* ${isR18 ? 'Explicit (R18)' : 'Safe Content'}
• *Hasil:* ${selected.length} Gambar Terverifikasi

*Daftar Karya:*
${metadata}

*Direct Links:*
${links}

_Sistem sedang mengirim album..._`;

            // 4. Kirim Header Dahulu
            await conn.sendMessage(m.chat, { 
                image: { url: global.search }, 
                caption: mainCaption 
            }, { quoted: m });

             

            // 5. Kirim Album Secara Berurutan
            for (const item of selected) {
                try {
                    const imgRes = await axios.get(item.urls.regular, { 
                        responseType: 'arraybuffer', 
                        timeout: 15000 
                    });
                    
                    if (imgRes.status === 200) {
                        await conn.sendMessage(m.chat, { 
                            image: Buffer.from(imgRes.data),
                            caption: `✅ *${item.title}*`
                        });
                        await new Promise(r => setTimeout(r, 1000)); // Jeda 1 detik agar tidak spam/delay
                    }
                } catch { continue; }
            }

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                image: { url: global.search }, 
                caption: `*ENGINE ERROR*\n\nAlasan: ${e.message}`
            }, { quoted: m });
        }
    }
};
