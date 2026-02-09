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
    name: 'searchdonghua',
    alias: ['donghua', 'infodonghua'],
    category: 'search',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            if (!text) {
                await m.react('❓');
                return conn.sendMessage(m.chat, {
                    image: { url: global.search },
                    caption: `*PENCARIAN INFO DONGHUA*\n\nContoh: ${usedPrefix + command} Soul Land`
                }, { quoted: m });
            }

            await m.react('🔍');
            const query = `query ($search: String) { Media (search: $search, type: ANIME) { title { romaji english native } format status episodes averageScore studios(isMain: true) { nodes { name } } genres description coverImage { large } siteUrl countryOfOrigin } }`;

            const { data } = await axios.post('https://graphql.anilist.co', { query, variables: { search: text } });
            const dh = data.data.Media;
            if (!dh) throw new Error("Donghua tidak ditemukan.");

            await m.react('🔎');
            const cleanDesc = dh.description ? dh.description.replace(/<br>|<i>|<\/i>/g, '') : '';
            const sinopsisIndo = await translateIndo(cleanDesc);

            const mainCaption = `*PENCARIAN INFO DONGHUA*

\`\`\`➢ Judul    : ${(dh.title.romaji || dh.title.english).toUpperCase()}\`\`\`
\`\`\`➢ Asal     : ${dh.countryOfOrigin === 'CN' ? 'China 🇨🇳' : dh.countryOfOrigin}\`\`\`
\`\`\`➢ Format   : ${dh.format || 'N/A'}\`\`\`
\`\`\`➢ Status   : ${dh.status || 'N/A'}\`\`\`
\`\`\`➢ Episodes : ${dh.episodes || 'N/A'}\`\`\`
\`\`\`➢ Rating   : ⭐ ${dh.averageScore || 'N/A'}%\`\`\`

➢ *${toSmallCaps("sɪɴᴏᴘsɪs")} (ɪᴅ):*
${sinopsisIndo.slice(0, 800)}...

➢ *Link Source:* ${dh.siteUrl}`;

            await conn.sendMessage(m.chat, { image: { url: dh.coverImage.large }, caption: mainCaption }, { quoted: m });
            await m.react('✅');
        } catch (e) {
            await m.react('❌');
           return conn.sendMessage(m.chat, { 
                    image: { url: global.search },
                    caption: `*KESALAHAN SISTEM*\n\nAlasan: ${e.message}}` 
                }, { quoted: m });
            }
    }
};
