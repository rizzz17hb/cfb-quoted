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
    name: 'searchmanga',
    alias: ['manga'],
    category: 'search',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            if (!text) {
                await m.react('❓');
                return conn.sendMessage(m.chat, {
                    image: { url: global.search },
                    caption: `*PENCARIAN INFO MANGA*\n\nContoh: ${usedPrefix + command} Solo Leveling`
                }, { quoted: m });
            }

            await m.react('🔍');
            const query = `query ($search: String) { Media (search: $search, type: MANGA) { title { romaji english native } type format status chapters volumes averageScore genres description coverImage { large } siteUrl } }`;

            const { data } = await axios.post('https://graphql.anilist.co', { query, variables: { search: text } });
            const manga = data.data.Media;
            if (!manga) throw new Error("Manga/Manhwa tidak ditemukan.");

            await m.react('🔎');
            const cleanDesc = manga.description ? manga.description.replace(/<br>|<i>|<\/i>|<b>|<\/b>/g, '') : '';
            const deskripsiIndo = await translateIndo(cleanDesc);

            const mainCaption = `*PENCARIAN INFO MANGA*

\`\`\`➢ Judul    : ${(manga.title.romaji || manga.title.english).toUpperCase()}\`\`\`
\`\`\`➢ Type     : ${manga.type} (${manga.format})\`\`\`
\`\`\`➢ Status   : ${manga.status}\`\`\`
\`\`\`➢ Chapters : ${manga.chapters || 'Ongoing'}\`\`\`
\`\`\`➢ Rating   : ⭐ ${manga.averageScore || 'N/A'}%\`\`\`
\`\`\`➢ Genre    : ${manga.genres.slice(0, 3).join(', ')}\`\`\`

➢ *${toSmallCaps("sɪɴᴏᴘsɪs")} (ɪᴅ):*
${deskripsiIndo.slice(0, 800)}...

➢ *Link Source:* ${manga.siteUrl}`;

            await conn.sendMessage(m.chat, { image: { url: manga.coverImage.large }, caption: mainCaption }, { quoted: m });
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
