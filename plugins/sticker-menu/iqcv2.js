export default {
    name: 'iqcv2',
    alias: ['iphonequoted2', 'iq2'],
    category: 'sticker',
    limit: true,
    exec: async ({ conn, m, text, args }) => {
        // 1. Validasi input dengan gambar instruksi
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, { 
                image: { url: global.sticker },
                caption: "Contoh: .iqcv2 teksnya | jam | batre\nAtau cukup: .iqcv2 teksnya (otomatis jam & batre)" 
            });
        }

        // 2. Logika Parsing Parameter
        let [prompt, jamInput, batreInput] = text.split('|').map(v => v.trim());

        // Waktu lokal WIB (UTC+7)
        let d = new Date();
        let jamOtomatis = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + (3600000 * 7))
            .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');

        let fixPrompt = prompt;
        let fixJam = jamInput || jamOtomatis;
        let fixBatre = batreInput || Math.floor(Math.random() * 100) + 1;

        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            // 3. Endpoint FAA v2
            const apiUrl = `https://api-faa.my.id/faa/iqcv2?prompt=${encodeURIComponent(fixPrompt)}&jam=${encodeURIComponent(fixJam)}&batre=${encodeURIComponent(fixBatre)}`;

            // 4. Kirim hasil tanpa reply/quoted
            await conn.sendMessage(m.chat, { 
                image: { url: apiUrl }, 
                caption: "Done." 
            });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error("IQC v2 Error:", e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, {
                image: { url: global.sticker },
                caption: "Contoh: .iqcv2 teksnya | jam | batre\nAtau cukup: .iqcv2 teksnya (otomatis jam & batre)" 
            });
        }
    }
};