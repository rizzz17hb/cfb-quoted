import FormData from 'form-data';

import fetch from 'node-fetch';

export default {
    name: 'tohd',
    alias: ['hd', 'enhance', 'remini'],
    category: 'tools',
    isOwner: false,
    exec: async ({ conn, m, command, usedPrefix }) => {
        
        // Mengambil global.tools dari config.js

        // 1. Validasi Input Gambar
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || "";

        if (!mime || !/image\/(jpe?g|png)/.test(mime)) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.tools }, 
                caption: `⚠️ Silahkan reply gambar yang mau dijadiin HD ` 
            }, { quoted: m });
        }

        // --- REACT: Mulai Proses ---
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        // (Status Upload Dihapus sesuai request)

        try {
            // Download Buffer Gambar
            const imageBuffer = await q.download();
            if (!imageBuffer || imageBuffer.length === 0) throw new Error("Gagal mendownload gambar.");

            // Upload ke Catbox
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', imageBuffer, {
                filename: 'image.jpg',
                contentType: 'image/jpeg'
            });

            const catboxRes = await fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                body: form
            });

            const catboxUrl = await catboxRes.text();

            if (!catboxUrl.startsWith('http')) {
                throw new Error("Catbox Gagal: Link tidak valid.");
            }

            // Pesan Status Processing (Tanpa Reply)
            await conn.sendMessage(m.chat, { 
                image: { url: global.tools }, 
                caption: "⏱️ Sedang meningkatkan kualitas ke HD..." 
            });

            // Panggil API To HD
            const apiUrl = `https://api-faa.my.id/faa/superhd?url=${encodeURIComponent(catboxUrl)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error("API Gagal memproses gambar.");

            const resultBuffer = Buffer.from(await response.arrayBuffer());

            if (resultBuffer.length < 1000) {
                throw new Error("Hasil gambar kosong/korup.");
            }

            // 4. Kirim Hasil Akhir (Tanpa Reply)
            await conn.sendMessage(m.chat, {
                image: resultBuffer,
                caption: "✨ *Berhasil meningkatkan kualitas ke HD...*"
            });

            // --- REACT: Sukses ---
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error('ToHD Error:', e);
            
            // --- REACT: Gagal ---
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            // Pesan Error (Tanpa Reply)
            await conn.sendMessage(m.chat, {
                image: { url: global.tools },
                caption: `❌ *GAGAL:* ${e.message}`
            });
        }
    }
};
