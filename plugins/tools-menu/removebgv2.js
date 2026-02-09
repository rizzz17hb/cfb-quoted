export default {
    name: 'removebgv2',
    alias: ['rbv2', 'rbv2', 'nobgv2'],
    category: 'tools',
    limit: true,
    exec: async ({ conn, m }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || "";

        if (!/image/.test(mime)) {
            // React tanda tanya kalau bukan gambar
            if (conn.sendMessage) await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.tools },
                caption: `Hwaaa! Mana fotonya? Kirim atau reply foto ya kaka @${m.sender.split('@')[0]}.. 🎀`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        // 1. React Sedang Proses
        if (conn.sendMessage) await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            // 2. Download & Convert ke Base64
            let media = await q.download();
            const base64Data = media.toString("base64");

            // 3. Hit API WithoutBG
            const response = await fetch("https://api.withoutbg.com/v1.0/image-without-background-base64", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": "sk-051d7f892392fee7668e4b9815551c2d208bb621c640a607c760445ab713d292"
                },
                body: JSON.stringify({ image_base64: base64Data })
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.detail || result.error || "Gagal dari server");
            }

            // 4. Convert Base64 balik ke Buffer
            const resultBuffer = Buffer.from(result.img_without_background_base64, "base64");

            // 5. React Berhasil
            if (conn.sendMessage) await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } });

            // 6. Kirim Document
            await conn.sendMessage(m.chat, { 
                document: resultBuffer, 
                mimetype: 'image/png', 
                fileName: `RadjaEngine_V3_${Date.now()}.png`,
                caption: `✨ *V3 Base64 Sukses!* ✨\nBackground berhasil dibuang kaka @${m.sender.split('@')[0]}.. 🎀`,
                mentions: [m.sender]
            }, { quoted: m });

            // React Centang
            if (conn.sendMessage) await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            
        } catch (e) {
            console.error("WithoutBG Error:", e);
            // React Gagal
            if (conn.sendMessage) await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            
            return conn.sendMessage(m.chat, { 
                image: { url: global.tools },
                caption: `Waduh Error: ${e.message}`
            }, { quoted: m });
        }
    }
};
