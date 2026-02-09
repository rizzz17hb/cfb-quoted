import FormData from 'form-data';
import fetch from 'node-fetch';

export default {
    name: 'removebgv3',
    alias: ['rbgv3', 'nobgv3'],
    category: 'tools',
    isOwner: false,
    exec: async ({ conn, m, command, usedPrefix }) => {
        
        // 1. Validasi Input Gambar
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || "";

        if (!mime || !/image\/(jpe?g|png|webp)/.test(mime)) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.tools }, 
                caption: `⚠️ Silahkan reply gambar yang mau dihapus backgroud nya?` 
            }, { quoted: m });
        }

        // --- REACT: Mulai Proses ---
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });
        
        try {
            // Download Buffer Gambar dari WA
            const imageBuffer = await q.download();
            if (!imageBuffer || imageBuffer.length === 0) throw new Error("Gagal mendownload gambar.");

            // 3. Upload ke Cloud (Catbox)
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', imageBuffer, {
                filename: 'radja_upload.jpg',
                contentType: 'image/jpeg'
            });

            const catboxRes = await fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                body: form
            });

            const catboxUrl = await catboxRes.text();

            if (!catboxUrl.startsWith('http')) {
                throw new Error("Gagal mengunggah gambar ke server temporary.");
            }

            // 4. Eksekusi Core Engine (Castorie Engine)
            const apiUrl = `https://api-faa.my.id/faa/removebg?url=${encodeURIComponent(catboxUrl)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error("Castorie Engine sedang sibuk, coba lagi nanti.");

            // Ambil hasil sebagai Buffer PNG
            const resultBuffer = Buffer.from(await response.arrayBuffer());

            if (resultBuffer.length < 1000) {
                throw new Error("Hasil pemrosesan tidak valid.");
            }

            // 5. Kirim Hasil Akhir (Document agar PNG Transparan tetap terjaga)
            await conn.sendMessage(m.chat, {
                document: resultBuffer,
                mimetype: 'image/png',
                fileName: 'RadjaEngine_RemoveBG.png',
                caption: "✨ *Success by Castorie Engine*\nBackground berhasil dihapus dengan rapi."
            });

            // --- REACT: Sukses ---
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error('RemoveBG v3 Error:', e);
            
            // --- REACT: Gagal ---
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            // Pesan Error Branding Radja
            await conn.sendMessage(m.chat, {
                image: { url: global.tools },
                caption: `❌ *[ Radja Engine Error ]*\n${e.message}`
            });
        }
    }
};
