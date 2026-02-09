import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';

export default {
    name: 'setpp',
    alias: ['setppbot', 'setpppanjang'],
    category: 'settings',
    isOwner: true,
    exec: async ({ conn, m, usedPrefix, command }) => {
        // Helper SmallCaps untuk branding
        const toSmallCaps = (str) => {
            const fonts = {
                'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
            };
            return str.toLowerCase().split('').map(c => fonts[c] || c).join('');
        };

        // Fungsi Ambil Gambar dari folder assets (sticker.jpg/png)
        const getBrandingImage = () => {
            const assetsPath = path.join(process.cwd(), 'assets');
            const targetFiles = ['sticker.jpg', 'sticker.jpeg', 'sticker.png'];
            
            for (const file of targetFiles) {
                const fullPath = path.join(assetsPath, file);
                if (fs.existsSync(fullPath)) return fs.readFileSync(fullPath);
            }
            return null;
        };

        const brandingImg = getBrandingImage();

        const sendResponse = async (chatId, content, quoted) => {
            if (brandingImg) {
                await conn.sendMessage(chatId, { image: brandingImg, caption: content }, { quoted });
            } else {
                await conn.sendMessage(chatId, { text: content }, { quoted });
            }
        };

        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';

            // 1. Validasi Input (Castorice Error Style)
            if (!/image/.test(mime)) {
                await m.react('🦦');
                const helpInfo = `╭── 🦦 *${toSmallCaps("ᴄᴀsᴛᴏʀɪᴄᴇ ᴄᴏɴꜰɪɢ")}* 🦦
│ \`\`\`➢ Task   : Change Identity\`\`\`
│ \`\`\`➢ Status : Media Missing\`\`\`
╰───────────────➣

_Silakan reply gambar dengan ketik:_
*${usedPrefix + command}*`;
                return sendResponse(m.chat, helpInfo, m);
            }

            await m.react('⏳');

            // 2. Download Media
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

            if (!media) throw new Error("Gagal mengunduh media dari server.");

            // 3. Update Profile Picture
            await conn.updateProfilePicture(conn.user.id, media);

            // 4. Final Branding Response
            const successInfo = `╭── 🦦 *${toSmallCaps("ᴄᴀsᴛᴏʀɪᴄᴇ ᴜᴘᴅᴀᴛᴇᴅ")}* 🦦
│ \`\`\`➢ System : Engine Avatar\`\`\`
│ \`\`\`➢ Status : Online & Synced\`\`\`
│ \`\`\`➢ Result : Success\`\`\`
╰───────────────➣

_Identitas visual Castorice Engine_
_telah berhasil diperbarui._`;

            await conn.sendMessage(m.chat, { 
                image: media, 
                caption: successInfo 
            }, { quoted: m });
            
            await m.react('✅');

        } catch (e) {
            await m.react('❌');
            const errorMsg = `*「 CASTORICE ERROR 」*\n\nTerjadi kesalahan fatal:\n_${e.message}_`;
            await sendResponse(m.chat, errorMsg, m);
        }
    }
};