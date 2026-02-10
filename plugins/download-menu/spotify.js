import axios from "axios";
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

async function spotifyCreds() {
   try {
      // URL Spotify asli menggunakan accounts.spotify.com
      const json = await axios.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
         headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + Buffer.from("4c4fc8c3496243cbba99b39826e2841f:d598f89aba0946e2b85fb8aefa9ae4c8").toString("base64") 
         }
      });
      return { status: true, data: json.data };
   } catch (e) { 
      console.error(e);
      return { status: false }; 
   }
}

export default {
   name: 'spotify',
   alias: ['spplay'],
   category: 'download',
   exec: async ({ conn, m, text, usedPrefix, command }) => {
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌ Error" }
        };
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };

      if (!text) {
         await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
         return conn.sendMessage(m.chat, { 
               image: { url: global.download },
               caption: `Masukkan judul lagunya!\nContoh: ${usedPrefix + command} Lathi` 
            }, { quoted: fake });
      }
            
      await m.react('⏱️');

      const creds = await spotifyCreds();
      if (!creds.status) return m.reply("Gagal mendapatkan akses token Spotify.");

      // Perbaikan URL Search dan template string
      const search = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(text)}&type=track&limit=1`, {
         headers: { Authorization: "Bearer " + creds.data.access_token }
      });

      const v = search.data.tracks.items[0];
      if (!v) return conn.sendMessage(m.chat, { 
                caption: "Lagu tidak ditemukan. Coba judul lain." 
            }, { quoted: fail });

      const trackUrl = v.external_urls.spotify;
      const thumb = v.album.images[0].url;

      // Persiapkan Media
      const media = await prepareWAMessageMedia({ image: { url: thumb } }, { upload: conn.waUploadToServer });
      
      const interactiveMessage = {
         header: { 
            title: "ＳＰＯＴＩＦＹ  ＰＬＡＹ", 
            hasMediaAttachment: true, 
            imageMessage: media.imageMessage 
         },
         body: { 
            text: `🎵 *Title:* ${v.name}\n👤 *Artist:* ${v.artists.map(a => a.name).join(', ')}\n💿 *Album:* ${v.album.name}\n🔗 *Link:* ${trackUrl}` 
         },
         footer: { text: "Klik tombol di bawah untuk mengambil audio" },
         nativeFlowMessage: {
            buttons: [{
               name: "quick_reply",
               buttonParamsJson: JSON.stringify({ 
                  display_text: "🎵 AMBIL AUDIO", 
                  id: `${usedPrefix}spotifyaudio ${trackUrl}` 
               })
            }]
         }
      };

      const msg = generateWAMessageFromContent(m.chat, { 
         viewOnceMessage: { 
            message: { 
               interactiveMessage 
            } 
         } 
      }, { quoted: fail });

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
   }
};