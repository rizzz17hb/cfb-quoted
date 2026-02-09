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
    name: 'searchcharacter',
    alias: ['character', 'char'],
    category: 'search',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            if (!text) {
                await m.react('❓');
                return conn.sendMessage(m.chat, {
                    image: { url: global.search },
                    caption: `*PENCARIAN INFO KARAKTER*\n\nContoh: ${usedPrefix + command} Luffy`
                }, { quoted: m });
            }

            await m.react('🔍');
            const query = `query ($search: String) { Character (search: $search) { name { full native alternative } image { large } description siteUrl gender dateOfBirth { year month day } media(type: ANIME, sort: START_DATE_DESC) { nodes { title { romaji english } } } } }`;

            const { data } = await axios.post('https://graphql.anilist.co', { query, variables: { search: text } });
            const char = data.data.Character;
            if (!char) throw new Error("Karakter tidak ditemukan.");

            await m.react('🔎');
            const cleanDesc = char.description ? char.description.replace(/__|_|!~|~!|<br>|<i>|<\/i>/g, '') : '';
            const deskripsiIndo = await translateIndo(cleanDesc);

            const animeAsal = char.media.nodes[0] ? (char.media.nodes[0].title.romaji || char.media.nodes[0].title.english) : 'N/A';

            const mainCaption = `*PENCARIAN INFO KARAKTER*

\`\`\`➢ Nama    : ${char.name.full.toUpperCase()}\`\`\`
\`\`\`➢ Native  : ${char.name.native || '-'}\`\`\`
\`\`\`➢ Anime   : ${animeAsal}\`\`\`
\`\`\`➢ Gender  : ${char.gender || 'N/A'}\`\`\`
\`\`\`➢ Ultah   : ${char.dateOfBirth.day ? char.dateOfBirth.day + '/' + char.dateOfBirth.month : 'N/A'}\`\`\`

➢ *${toSmallCaps("ᴅᴇsᴋʀɪᴘsɪ")} (ɪᴅ):*
${deskripsiIndo.slice(0, 800)}...

➢ *Link Source:* ${char.siteUrl}`;

            await conn.sendMessage(m.chat, { image: { url: char.image.large }, caption: mainCaption }, { quoted: m });
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
