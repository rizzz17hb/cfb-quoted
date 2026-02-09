import axios from "axios";
import FormData from "form-data";
import { catbox } from "../../lib/scraper/index.js"; 

export default {
    name: 'removebg',
    alias: ['removebg', 'nobg', 'rb'],
    category: 'tools',
    limit: true,
    exec: async ({ conn, m }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || "";

        // 1. Cek Media
        if (!/image/.test(mime)) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.tools },
                caption: `Hwaaa! Mana fotonya ? Kirim atau reply foto yang mau dihapus background-nya ya.. 🎀\n\n*Contoh:* .removebg (sambil reply foto)` 
            }, { quoted: m });
        }

        await m.react('⏱️');

        try {
            // 2. Download & Upload
            let media = await q.download();
            
            // GUNAKAN catbox (atau image) secara langsung di sini
            let url = await catbox(media); 

            if (!url) throw new Error("Gagal upload media ke server.");

            // --- MULTI API KEY LOGIC ---
            const apiKeys = [
                "th6LsEX1Jv6JwUytMFePzZuL", // Key 1
                "s8YcsPWRKYvEdbsxnvU2EQ7E"  // Key 2
            ];
            const selectedKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
            // ---------------------------

            // 3. Hit API Remove.bg
            const formData = new FormData();
            formData.append("size", "auto");
            formData.append("image_url", url);

            let { data } = await axios({
                method: "post",
                url: "https://api.remove.bg/v1.0/removebg",
                data: formData,
                responseType: "arraybuffer",
                headers: {
                    ...formData.getHeaders(),
                    "X-Api-Key": selectedKey,
                },
                encoding: null,
            });

            // 4. Kirim Hasil (Pake Document biar Transparan)
             
            await conn.sendMessage(m.chat, { 
                document: data, 
                mimetype: 'image/png', 
                fileName: `CastoriceEdit_${Date.now()}.png`,
                caption: `✨ *Selesai Kaka!* ✨\nBackground-nya sudah Castorice sulap jadi hilang @${m.sender.split('@')[0]}..`,
                mentions: [m.sender]
            }, { quoted: m });
            
            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            
            // 5. Error Message
            let errorText = "Waduh, server sulapnya lagi pusing , coba lagi nanti ya.. 😔";
            if (e.response?.status === 402) {
                errorText = "Yahhh, kuota API Key Remove.bg nya sudah habis .. Coba lagi beberapa saat lagi ya kaka sayang.. 💔";
            }

            // PERBAIKAN: Gunakan variabel errorText, bukan string "errorText"
            return conn.sendMessage(m.chat, { 
                image: { url: global.tools },
                caption: errorText 
            }, { quoted: m });
        }
    }
};