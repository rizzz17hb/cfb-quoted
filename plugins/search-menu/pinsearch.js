import axios from 'axios';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import('@whiskeysockets/baileys')).default;
export default {
    name: 'pinterestsc',
    alias: ['pinsc', 'pinterestsearch'],
    category: 'search',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        try {
            if (!text) {
                await m.react('❓');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.search },
                    caption: `*INPUT DIPERLUKAN*\n\nContoh: ${usedPrefix + command} anime aesthetic | 5` 
                }, { quoted: m });
            }

            // Parsing: query | count --- page
            let [rawArgs, rawPage] = text.split('---');
            let [query, countRaw] = rawArgs.split('|').map(v => v.trim());
            let count = Math.min(parseInt(countRaw) || 5, 10);
            let pageIndex = parseInt(rawPage) || 0;

            await m.react('🔍');

            // API Pinterest
            const suffixes = ['', 'wallpaper', 'hd', 'aesthetic', '4k', 'fanart'];
            let currentSuffix = suffixes[pageIndex % suffixes.length];
            let searchQuery = currentSuffix ? `${query} ${currentSuffix}` : query;
            
            const { data } = await axios.get(`https://api.deline.web.id/search/pinterest?q=${encodeURIComponent(searchQuery)}&nocache=${Date.now()}`);
            const results = Array.isArray(data?.data) ? data.data : [];

            if (!results.length) {
                await m.react('❌');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.search },
                    caption: `*KOSONG*\n\nTidak ditemukan hasil untuk: ${query}` 
                }, { quoted: m });
            }

             
            let selected = results.slice(0, count);
            let cards = [];

            for (const item of selected) {
                const media = await prepareWAMessageMedia(
                    { image: { url: item.image } }, 
                    { upload: conn.waUploadToServer }
                );

                cards.push({
                    header: {
                        title: (item.caption || 'Pinterest Result').substring(0, 30),
                        hasMediaAttachment: true,
                        imageMessage: media.imageMessage
                    },
                    body: { text: `Halaman: ${pageIndex + 1}` },
                    footer: { text: "Castorice Search" },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "ᗪOᗯᑎᒪOᗩᗪ ᕼᗪ",
                                    id: `${usedPrefix}pindl ${item.image}`
                                })
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "🌐 ᑎE᙭T ᑭᗩGE",
                                    id: `${usedPrefix + command} ${query} | ${count} --- ${pageIndex + 1}`
                                })
                            }
                        ]
                    }
                });
            }

            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: `Hasil: *${query.toUpperCase()}*` },
                            footer: { text: "Geser kesamping ➡️" },
                            carouselMessage: { cards }
                        }
                    }
                }
            }, { quoted: m, userJid: conn.user.id });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, { 
                image: { url: global.search },
                caption: `*FATAL ERROR*\n\nSistem gagal merender carousel.`
            }, { quoted: m });
        }
    }
};
