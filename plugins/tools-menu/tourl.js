import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    name: 'tourl',
    alias: ['tourl', 'up'],
    category: 'tools',
    exec: async ({ conn, m, command, usedPrefix }) => {
        // --- HELPER: SMALL CAPS ---
        const toSmallCaps = (text) => {
            const latin = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            const smallCaps = "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
            return text.split('').map(c => {
                const i = latin.indexOf(c);
                return i !== -1 ? smallCaps[i] : c;
            }).join('');
        };

        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || q.mediaType || "";

            // 1. Validasi Media
            if (!/image|video|audio|webp|pdf/i.test(mime)) {
                await m.react('❌');
                return await conn.sendMessage(m.chat, {
                    image: { url: global.tools },
                    caption: `*${toSmallCaps("ᴜᴘʟᴏᴀᴅ ᴍᴇᴅɪᴀ ᴛᴏ ᴜʀʟ")}* 📤\n\n` +
                             `Silakan kirim atau reply media dengan perintah:\n` +
                             `╰─➣ *${usedPrefix + command}*`
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

            if (!media) throw new Error("Gagal mengunduh media.");

            // --- UPLOAD KE CATBOX ---
            const ft = await fileTypeFromBuffer(media);
            const ext = ft ? ft.ext : 'bin';
            const tmpPath = `./tmp/${Date.now()}.${ext}`;

            if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
            fs.writeFileSync(tmpPath, media);

            const form = new FormData();
            form.append("reqtype", "fileupload");
            form.append("userhash", "2dbb92f6b9f3c8cd14d75ea05");
            form.append("fileToUpload", fs.createReadStream(tmpPath));

            const { data } = await axios.post("https://catbox.moe/user/api.php", form, {
                headers: { ...form.getHeaders() }
            });

            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);

            // --- KIRIM HASIL (NO REPLY, NO QUOTED, NO ADREPLY) ---
            const size = (media.length / 1024 / 1024).toFixed(2);
            let caption = `🚀 *${toSmallCaps("ᴜᴘʟᴏᴀᴅ sᴜᴄᴄᴇssғᴜʟ")}*\n\n` +
                          `➢  ◦  *Type:* ${mime.split("/")[0].toUpperCase()}\n` +
                          `➢  ◦  *Size:* ${size} MB\n` +
                          `➢  ◦  *Link:* ${data.trim()}\n\n` +
                          `*${toSmallCaps("ʀᴀᴅᴊᴀ ᴇɴɢɪɴᴇ ᴄʟᴇᴀɴ ᴍᴏᴅᴇ")}*`;

            // Kirim sebagai pesan baru yang berdiri sendiri
            await conn.sendMessage(m.chat, {
                image: /image/i.test(mime) ? media : { url: global.tools },
                caption: caption
            });

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, {
                image: { url: global.tools },
                caption: `❌ *${toSmallCaps("ᴜᴘʟᴏᴀᴅ ғᴀɪʟᴇᴅ")}*\n\nReason: ${e.message}`
            });
        }
    }
};