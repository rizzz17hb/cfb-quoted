import FormData from 'form-data';
import fetch from 'node-fetch';

export default {
    name: 'tomirror',
    alias: ['mirror', 'miror'],
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
                caption: `⚠️ Silahkan reply gambar yang mau dijadiin Mirror ` 
            }, { quoted: m });
        }

        // --- REACT: Proses Mulai ---
        m.react('⏱️');

        try {
            // Download Buffer via context function
            const imageBuffer = await q.download();
            if (!imageBuffer || imageBuffer.length === 0) throw new Error("Gagal mengunduh gambar.");

            // Upload ke Catbox
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', imageBuffer, {
                filename: 'tomirror_req.jpg',
                contentType: 'image/jpeg'
            });

            const catboxRes = await fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                body: form
            });

            const catboxUrl = await catboxRes.text();

            if (!catboxUrl || !catboxUrl.startsWith('http')) {
                throw new Error("Gagal mendapatkan URL dari Catbox.");
            }

            // Hit API FAA - ToMirror (Pastikan URL di-trim agar tidak ada spasi)
            const apiUrl = `https://api-faa.my.id/faa/tomirror?url=${encodeURIComponent(catboxUrl.trim())}`;
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error(`API FAA Error: ${response.statusText}`);

            // Mengambil hasil sebagai Buffer
            const arrayBuffer = await response.arrayBuffer();
            const resultBuffer = Buffer.from(arrayBuffer);

            // Validasi apakah yang didapat benar-benar gambar (bukan teks error)
            if (resultBuffer.length < 1000) {
                // Jika kecil, kemungkinan besar isinya JSON error atau HTML
                const check = resultBuffer.toString();
                if (check.includes('{')) {
                    const errJson = JSON.parse(check);
                    throw new Error(errJson.error || "Gagal memproses gambar.");
                }
                throw new Error("Hasil gambar korup atau tidak valid.");
            }

            // 3. Kirim Hasil Akhir
            await conn.sendMessage(m.chat, {
                image: resultBuffer,
                caption: "✨ Berhasil memberikan efek mirror."
            }, { quoted: m });

            m.react('✅');

        } catch (e) {
            console.error('ToMirror Error:', e);
            m.react('❌');

            await conn.sendMessage(m.chat, {
                image: { url: global.tools },
                caption: `❌ *ERROR:* ${e.message || e}`
            });
        }
    }
};
