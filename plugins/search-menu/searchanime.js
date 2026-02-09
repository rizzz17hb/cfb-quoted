import axios from 'axios';
const toSmallCaps = (str) => {
    const fonts = { 'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ' };
    return str.toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const translateIndo = async (text) => {
    try {
        const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`);
        return res.data[0].map(item => item[0]).join('');
    } catch { return text; }
};

export default {
    name: 'searchanime',
    alias: ['anime', 'infonime'],
    category: 'search',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            if (!text) {
                await m.react('❓');
                return conn.sendMessage(m.chat, {
                    image: { url: global.search },
                    caption: `*PENCARIAN INFO ANIME*\n\nContoh: ${usedPrefix + command} Naruto`
                }, { quoted: m });
            }

            await m.react('🔍');
            const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`);
            const anime = data.data[0];
            if (!anime) throw new Error("Anime tidak ditemukan.");

            await m.react('🔎');
            const sinopsisIndo = await translateIndo(anime.synopsis || '');

            const mainCaption = `*PENCARIAN INFO ANIME*

\`\`\`➢ Judul    : ${anime.title.toUpperCase()}\`\`\`
\`\`\`➢ Type     : ${anime.type || 'N/A'}\`\`\`
\`\`\`➢ Status   : ${anime.status || 'N/A'}\`\`\`
\`\`\`➢ Episodes : ${anime.episodes || 'N/A'}\`\`\`
\`\`\`➢ Rating   : ⭐ ${anime.score || 'N/A'}\`\`\`
\`\`\`➢ Studio   : ${anime.studios.map(s => s.name).join(', ') || 'N/A'}\`\`\`

➢ *${toSmallCaps("sɪɴᴏᴘsɪs")} (ɪᴅ):*
${sinopsisIndo.slice(0, 800)}...

➢ *Link MAL:* ${anime.url}`;

            await conn.sendMessage(m.chat, { image: { url: anime.images.jpg.large_image_url }, caption: mainCaption }, { quoted: m });
            await m.react('✅');
        } catch (e) {
            await m.react('❌');
            return conn.sendMessage(m.chat, { 
                    image: { url: global.search },
                    caption: `*KESALAHAN SISTEM*\n\nAlasan: ${e.message}` 
                }, { quoted: m });
            }
    }
};
