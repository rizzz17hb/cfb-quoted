export default {
    name: 'setdesgc',
    alias: ['setdesgc', 'setdescriptiongc'],
    category: 'grup',
    isOwner: true,
    isGroup: true,
    isBotAdmin: true,
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            // 1. Cek Input (Kalau teks kosong, kirim instruksi pake global.grup)
            if (!text) {
                await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
                return await conn.sendMessage(m.chat, {
                    image: { url: global.grup },
                    caption: `*CHANGE GROUP DESCRIPTION* 📝\n\nSilakan masukkan deskripsi baru:\n*${usedPrefix + command}* Grup ini adalah tempat kumpul sultan.`
                });
            }

            await m.react('⏱️');

            // --- EKSEKUSI UPDATE DESKRIPSI ---
            // Baileys: groupUpdateDescription(jid, description)
            await conn.groupUpdateDescription(m.chat, text);

            // --- KIRIM HASIL (NATIVE STYLE) ---
            let caption = `✅ *DESCRIPTION UPDATED*\n\n*New Description:*\n${text}\n\nBerhasil diperbarui oleh Owner.`;

            await conn.sendMessage(m.chat, {
                image: { url: global.grup }, // Tetap pake image biar konsisten mewahnya
                caption: caption
            });

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                image: { url: global.grup },
                caption: `❌ *ERROR SETDESK*\n${e.message}`
            });
        }
    }
};
