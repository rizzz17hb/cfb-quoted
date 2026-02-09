import FormData from 'form-data';
import fetch from 'node-fetch';

export default {
    name: 'tofigure',
    alias: ['tofig', 'figure'],
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
                caption: `⚠️ Silahkan reply gambar yang mau dijadiin figure` 
            }, { quoted: m });
        }

        // --- REACT: Mulai Proses ---
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            // Download Buffer Gambar
            const imageBuffer = await q.download();
            if (!imageBuffer || imageBuffer.length === 0) throw new Error("Gagal mendownload gambar.");

            // Upload ke Catbox
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', imageBuffer, {
                filename: 'upload.jpg',
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

            // Convert ke Figure (API FAA - Return Buffer)
            const apiUrl = `https://api-faa.my.id/faa/tofigura?url=${encodeURIComponent(catboxUrl)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error("API Gagal memproses gambar.");

            const resultBuffer = Buffer.from(await response.arrayBuffer());

            // Validasi ukuran buffer
            if (resultBuffer.length < 1000) {
                throw new Error("Hasil gambar kosong/korup.");
            }

            // 4. Kirim Hasil Akhir (Tanpa Reply)
            await conn.sendMessage(m.chat, {
                image: resultBuffer,
                caption: "✨ *Berhasil mengubah ke Figure Style!*"
            });

            // --- REACT: Sukses ---
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error('ToFigure Error:', e);
            
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
