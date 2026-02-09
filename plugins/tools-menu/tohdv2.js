import axios from 'axios';
import BodyForm from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

// --- Helper Function Optimasi Upload (Request Kamu) ---
export async function image(buffer) {
    try {
        // 1. Deteksi tipe file langsung dari buffer
        const type = await fileTypeFromBuffer(buffer);
        const ext = type ? type.ext : 'png';
        const mime = type ? type.mime : 'image/png';

        // 2. Siapkan Form Data
        const formData = new BodyForm();
        formData.append('reqtype', 'fileupload');
        formData.append('userhash', '2dbb92f6b9f3c8cd14d75ea05');
        
        formData.append('fileToUpload', buffer, {
            filename: `file.${ext}`,
            contentType: mime
        });

        // 3. Eksekusi Request
        const response = await axios.post('https://catbox.moe/user/api.php', formData, {
            headers: {
                ...formData.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        return response.data.trim();
        
    } catch (error) {
        console.error("Error at Catbox uploader:", error.message);
        throw new Error("Gagal upload ke Catbox.");
    }
}

// --- Script Utama ---
export default {
    name: 'tohdv2',
    alias: ['hdv2', 'enhancev2'],
    category: 'tools',
    isOwner: false,
    exec: async ({ conn, m, command, usedPrefix }) => {
        
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

        try {
            // Download Buffer Gambar
            const imageBuffer = await q.download();
            if (!imageBuffer || imageBuffer.length === 0) throw new Error("Gagal mendownload gambar.");

            // Upload ke Catbox pakai fungsi optimasi
            const catboxUrl = await image(imageBuffer);

            if (!catboxUrl.startsWith('http')) {
                throw new Error("Catbox Gagal: Link tidak valid.");
            }


            // Panggil API ToHD V2
            // API ini mengembalikan JSON: { status: true, result: "url_image" }
            const apiUrl = `https://api-faa.my.id/faa/hdv2?url=${encodeURIComponent(catboxUrl)}`;
            const apiResponse = await axios.get(apiUrl);
            
            const jsonData = apiResponse.data;

            // Validasi respon JSON
            if (!jsonData.status || !jsonData.result) {
                throw new Error("API gagal memberikan hasil.");
            }

            const resultImageUrl = jsonData.result;

            // Download gambar dari URL hasil API
            const downloadRes = await axios.get(resultImageUrl, { responseType: 'arraybuffer' });
            const resultBuffer = Buffer.from(downloadRes.data);

            // Validasi ukuran buffer hasil download
            if (resultBuffer.length < 1000) {
                throw new Error("Hasil download gambar kosong/korup.");
            }

            // Kirim Hasil Akhir (Tanpa Reply)
            await conn.sendMessage(m.chat, {
                image: resultBuffer,
                caption: "✨ *Berhasil memproses ToHD V2!*"
            });

            // --- REACT: Sukses ---
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error('ToHDv2 Error:', e);
            
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
