import FormData from 'form-data';
import fetch from 'node-fetch';

export default {
    name: 'toireng',
    alias: ['tohitam', 'ireng', 'black'],
    category: 'tools',
    isPremium: false,
    isOwner: false,
    exec: async ({ conn, m, command, usedPrefix }) => {
    
        // 1. Validasi Input Gambar
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || "";

        if (!mime || !/image\/(jpe?g|png|webp)/.test(mime)) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.tools }, 
                caption: `⚠️ Silahkan reply gambar yang mau dijadiin Irreeeng ` 
            }, { quoted: m });
        }

        // --- REACT: Proses Mulai ---
        m.react('⏱️');
        try {
            // Download Buffer
            const imageBuffer = await q.download();
            if (!imageBuffer || imageBuffer.length === 0) throw new Error("Gagal mengunduh gambar.");

            // Upload ke Catbox
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', imageBuffer, {
                filename: 'tohitam_req.jpg',
                contentType: 'image/jpeg'
            });

            const catboxRes = await fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                body: form
            });

            const catboxUrl = await catboxRes.text();

            if (!catboxUrl.startsWith('http')) {
                throw new Error("Gagal mendapatkan URL dari Catbox.");
            }

            // Hit API FAA - ToHitam (Toireng)
            const apiUrl = `https://api-faa.my.id/faa/tohitam?url=${encodeURIComponent(catboxUrl)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error("API FAA gagal memproses gambar.");

            const resultBuffer = Buffer.from(await response.arrayBuffer());

            if (resultBuffer.length < 1000) {
                throw new Error("Hasil gambar korup.");
            }

            // 3. Kirim Hasil Akhir
            await conn.sendMessage(m.chat, {
                image: resultBuffer,
                caption: "✨ Berhasil menambahkan efek ireng."
            });

            m.react('✅');

        } catch (e) {
            console.error('ToIreng Error:', e);
            m.react('❌');

            await conn.sendMessage(m.chat, {
                image: { url: global.tools },
                caption: `❌ *ERROR:* ${e.message}`
            });
        }
    }
};
