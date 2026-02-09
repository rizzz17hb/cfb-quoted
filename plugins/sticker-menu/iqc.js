export default {
    name: 'iqc',
    alias: ['iphonequoted', 'iq'],
    category: 'sticker',
    limit: true,
    exec: async ({ conn, m, text }) => {

         // 1. Validasi input dengan gambar instruksi
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.sticker },
                caption: "Contoh: .iqc teksnya \n" 
            });
        }

        // 2. React loading
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            // 3. Endpoint FAA (Langsung masukkan ke objek image)
            const apiUrl = `https://api-faa.my.id/faa/iqc?prompt=${encodeURIComponent(text)}`;

            // 4. Kirim gambar tanpa reply/quoted
            await conn.sendMessage(m.chat, { 
                image: { url: apiUrl }, 
                caption: "Done." 
            });

            // Sukses react
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error("IQC Error:", e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, {
                image: { url: global.sticker },
                caption: "server sedang sibuk...." 
            });
        }
    }
};