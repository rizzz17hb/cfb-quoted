import fetch from 'node-fetch';
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'gachaanime',
    alias: ['gacha', 'animegacha'],
    category: 'anime',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        
        const listKarakter = [
            'akira', 'akiyama', 'anna', 'asuna', 'ayuzawa', 'boruto', 'chitanda', 'chitoge', 
            'deidara', 'doraemon', 'emilia', 'erza', 'gremory', 'hestia', 'hinata', 'inori', 
            'itachi', 'isuzu', 'itori', 'kaga', 'kagura', 'kakasih', 'kaori', 'kaneki', 
            'kosaki', 'kotori', 'kuriyama', 'kuroha', 'kurumi', 'madara', 'mikasa', 'miku', 
            'minato', 'naruto', 'natsukawa', 'neko2', 'nekohime', 'nezuko', 'nishimiya', 
            'onepiece', 'pokemon', 'rem', 'rize', 'sagiri', 'sakura', 'sasuke', 'shina', 
            'shinka', 'shizuka', 'shota', 'tomori', 'toukachan', 'tsunade', 'yatogami', 'yuki'
        ];
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        // 1. Validasi Input Karakter
        let karakter = text ? text.toLowerCase().trim() : 'random';
        if (karakter === 'random') karakter = listKarakter[Math.floor(Math.random() * listKarakter.length)];

        if (!listKarakter.includes(karakter)) {
            return conn.sendMessage(m.chat, { 
                image: { url: global.anime },
                caption: `Mohon maaf, karakter tersebut tidak ditemukan.\n\n*Daftar Karakter:* ${listKarakter.join(', ')}`
            }, { quoted: fake });
        }

        await conn.sendMessage(m.chat, { react: { text: '🎰', key: m.key } });

        try {
            // 2. Pengambilan Data
            let endpoint = karakter === 'anna' ? 'ana' : (karakter === 'neko2' ? 'neko' : karakter);
            const res = await fetch(`https://raw.githubusercontent.com/KazukoGans/database/main/anime/${endpoint}.json`);
            if (!res.ok) throw new Error("Gagal terhubung ke database.");
            
            const data = await res.json();
            const imageUrl = data[Math.floor(Math.random() * data.length)];

            // 3. Persiapan Media (Buffer)
            const response = await fetch(imageUrl);
            const buffer = await response.buffer();
            const media = await prepareWAMessageMedia({ image: buffer }, { upload: conn.waUploadToServer });

            // 4. Struktur Pesan Interaktif (Satu Tombol)
            const interactiveMessage = {
                header: {
                    title: `G A C H A  A N I M E`,
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                },
                body: { text: `Berikut adalah hasil gacha  @${m.sender.split('@')[0]}. Semoga kamu menyukainya.` },
                footer: { text: "Castorice Assistant • Anime Gacha" },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ 
                                display_text: "🔁 Gᗩᑕᕼᗩ ᒪᗩGI", 
                                id: `${usedPrefix}${command} ${karakter}` 
                            })
                        }
                    ]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id, quoted: fake });
            
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            return conn.sendMessage(m.chat, { 
                image: { url: global.anime },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nAlasan: ❌${e.message}` 
            }, { quoted: fail });
        } 
    }
}