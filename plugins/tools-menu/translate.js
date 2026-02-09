import axios from 'axios';

/**
 * RADJA ENGINE - MULTI LANGUAGE TRANSLATOR
 * Logika: Google Translate API (Smart Auto-Detect)
 * Style: Clean Mode (Identic with tourl2)
 */

export default {
    name: 'translate',
    alias: ['tr', 'terjemah'],
    category: 'tools',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
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
            let lang = 'id'; 
            let dataText = text;

            if (text && text.includes(' ')) {
                const parts = text.split(' ');
                if (parts[0].length === 2) {
                    lang = parts[0];
                    dataText = parts.slice(1).join(' ');
                }
            }

            const q = m.quoted ? m.quoted.text : dataText;

            // 1. Validasi Input
            if (!q) {
                await m.react('❓');
                return await conn.sendMessage(m.chat, { 
                    image: { url: global.tools }, 
                    caption: `*${toSmallCaps("ᴛʀᴀɴsʟᴀᴛᴇ ᴇɴɢɪɴᴇ")}* 🌐\n\n` +
                             `Gunakan format: *${usedPrefix + command} <iso_code> <teks>*\n` +
                             `Contoh: *${usedPrefix + command} en halo*\n\n` +
                             `Atau reply pesan teks dengan perintah tersebut.`
                });
            }

            await m.react('🌐');

            // 2. Proses Translate
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(q)}`);
            const result = res.data[0].map(item => item[0]).join('');
            const fromLang = res.data[2];

            await m.react('✅');

            // 3. Kirim Hasil (Clean Mode - No Quoted)
            const mainCaption = `*${toSmallCaps("ᴛʀᴀɴsʟᴀᴛᴇ sᴜᴄᴄᴇss")}* 🚀\n\n` +
                                `\`\`\`➢ Dari   : ${fromLang.toUpperCase()}\`\`\`\n` +
                                `\`\`\`➢ Ke     : ${lang.toUpperCase()}\`\`\`\n\n` +
                                `➢ *${toSmallCaps("ʜᴀsɪʟ")}:*\n${result}\n\n` +
                                `*${toSmallCaps("ʀᴀᴅᴊᴀ ᴇɴɢɪɴᴇ ᴄʟᴇᴀɴ ᴍᴏᴅᴇ")}*`;

            await conn.sendMessage(m.chat, { 
                image: { url: global.tools }, 
                caption: mainCaption 
            });

        } catch (e) {
            console.error(e);
            await m.react('❌');
            // Tetap kirim gambar saat error agar tidak sepi
            await conn.sendMessage(m.chat, { 
                image: { url: global.tools }, 
                caption: `❌ *${toSmallCaps("ᴛʀᴀɴsʟᴀᴛᴇ ғᴀɪʟᴇᴅ")}*\n\nReason: ${e.message}` 
            });
        }
    }
};