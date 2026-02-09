import axios from "axios";
import fetch from "node-fetch";
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

async function spotifyCreds() {
   try {
      const json = await axios.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
         headers: { Authorization: "Basic " + Buffer.from("4c4fc8c3496243cbba99b39826e2841f:d598f89aba0946e2b85fb8aefa9ae4c8").toString("base64") }
      });
      return { status: true, data: json.data };
   } catch (e) { return { status: false }; }
}

export default {
   name: 'spotify',
   alias: ['spplay'],
   category: 'download',
   exec: async ({ conn, m, text, usedPrefix }) => {
      if (!text) return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "Masukkan judul lagunya...." 
            }, { quoted: m });
      await m.react('⏱️');

      const creds = await spotifyCreds();
      const search = await axios.get(`https://api.spotify.com/v1/search?q=$${encodeURIComponent(text)}&type=track&limit=1`, {
         headers: { Authorization: "Bearer " + creds.data.access_token }
      });

      const v = search.data.tracks.items[0];
      if (!v) return conn.sendMessage(m.chat, { 
                image: { url: global.download },
                caption: "Judul lagu tidak ditemukan...." 
            }, { quoted: m });

      const trackUrl = v.external_urls.spotify;
      const thumb = v.album.images[0].url;

      const media = await prepareWAMessageMedia({ image: { url: thumb } }, { upload: conn.waUploadToServer });
      
      const interactiveMessage = {
         header: { title: "ＳＰＯＴＩＦＹ  ＰＬＡＹ", hasMediaAttachment: true, imageMessage: media.imageMessage },
         body: { text: `🎵 *Title:* ${v.name}\n👤 *Artist:* ${v.artists[0].name}\n💿 *Album:* ${v.album.name}` },
         footer: { text: "Klik tombol di bawah untuk ambil audio" },
         nativeFlowMessage: {
            buttons: [{
               name: "quick_reply",
               buttonParamsJson: JSON.stringify({ 
                  display_text: "🎵 ᗩᗰᗷIᒪ ᗩᑌᗪIO", 
                  id: `${usedPrefix}spotifyaudio ${trackUrl}` 
               })
            }]
         }
      };

      const msg = generateWAMessageFromContent(m.chat, { viewOnceMessage: { message: { interactiveMessage } } }, { quoted: m });
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
   }
};