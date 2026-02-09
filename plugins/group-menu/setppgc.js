import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    name: 'setppgc',
    alias: ['setppgroup', 'setppg'],
    category: 'grup',
    isOwner: true,
    isGroup: true,
    isBotAdmin: true,
    exec: async ({ conn, m, usedPrefix, command }) => {
        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || q.mediaType || "";

            // 1. Cek Media (Jika bukan gambar, kirim instruksi pake global.grup)
            if (!/image/i.test(mime)) {
                await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
                return await conn.sendMessage(m.chat, {
                    image: { url: global.grup },
                    caption: `*CHANGE GROUP PHOTO* 📸\n\nSilakan reply gambar dengan perintah:\n*${usedPrefix + command}*`
                });
            }

            await m.react('⏱️');

            // --- PROSES DOWNLOAD ---
            let downloadObj = {
                key: q.key || m.key,
                message: q.message || (m.quoted ? m.quoted : m.message)
            };

            if (m.quoted && !downloadObj.message) {
                downloadObj.message = { [q.type]: q.msg || q };
            }

            let media = await downloadMediaMessage(
                downloadObj,
                'buffer',
                {},
                { logger: console, reuploadRequest: conn.updateMediaMessage }
            );

            if (!media) throw new Error("Gagal mengunduh gambar.");

            // --- EKSEKUSI UPDATE PP GC ---
            await conn.updateProfilePicture(m.chat, media);

            // --- KIRIM HASIL (NATIVE STYLE) ---
            let caption = `✅ *PP GROUP UPDATED*\n\nBerhasil memperbarui foto profil grup oleh Owner.`;

            await conn.sendMessage(m.chat, {
                image: media,
                caption: caption
            });

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                image: { url: global.grup },
                caption: `❌ *ERROR SETPPGC*\n${e.message}`
            });
        }
    }
};
