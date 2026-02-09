import axios from "axios"
import FormData from "form-data"

/* --------------------------------
    🔧 UGUU UPLOAD ENGINE
----------------------------------*/
async function Uguu(buffer, filename) {
  const form = new FormData()
  form.append("files[]", buffer, { filename })

  const { data } = await axios.post("https://uguu.se/upload.php", form, {
    headers: form.getHeaders()
  })

  if (!data.files || !data.files[0]) throw new Error("Upload gagal.")

  return data.files[0].url
}

export default {
    name: 'tourl2',
    alias: ['upload2'],
    category: 'tools',
    exec: async ({ conn, m }) => {
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
            const q = m.quoted ? m.quoted : m
            const mime = (q.msg || q).mimetype || ""

            // 1. Validasi Input (No Quoted/Reply)
            if (!mime || (!mime.startsWith("image/") && !mime.startsWith("video/") && !mime.startsWith("audio/"))) {
                await m.react('❌')
                return await conn.sendMessage(m.chat, { 
                    image: { url: global.tools }, 
                    caption: `*${toSmallCaps("ᴜᴘʟᴏᴀᴅ ᴍᴇᴅɪᴀ ᴠ𝟸")}* 📤\n\n` +
                             `Silakan kirim atau reply media dengan perintah:\n` +
                             `╰─➣ *tourl2*`
                })
            }

            await m.react('⏱️')

            // 2. Download Media
            const buffer = await q.download()
            const ext = mime.split("/")[1]
            const filename = `radja_engine_${Date.now()}.${ext}`

            // 3. Upload ke Uguu
            const link = await Uguu(buffer, filename)

            // 4. Kirim Hasil Mewah (TANPA REPLY / TANPA QUOTED)
            await m.react('✅')
            
            const size = (buffer.length / 1024 / 1024).toFixed(2);
            let caption = `🚀 *${toSmallCaps("ᴜᴘʟᴏᴀᴅ sᴜᴄᴄᴇssғᴜʟ")}*\n\n` +
                          `➢  ◦  *Engine:* Uguu.se\n` +
                          `➢  ◦  *Type:* ${mime.split("/")[0].toUpperCase()}\n` +
                          `➢  ◦  *Size:* ${size} MB\n` +
                          `➢  ◦  *Link:* ${link.trim()}\n\n` +
                          `*${toSmallCaps("ʀᴀᴅᴊᴀ ᴇɴɢɪɴᴇ ᴄʟᴇᴀɴ ᴍᴏᴅᴇ")}*`;

            await conn.sendMessage(m.chat, { 
                image: /image/i.test(mime) ? buffer : { url: global.tools }, 
                caption: caption 
            })

        } catch (e) {
            console.error(e)
            await m.react('❌')
            // Error tetap tanpa reply, tetap pakai gambar agar tidak sepi
            await conn.sendMessage(m.chat, { 
                image: { url: global.tools }, 
                caption: `❌ *${toSmallCaps("ᴜᴘʟᴏᴀᴅ ғᴀɪʟᴇᴅ")}*\n\nReason: ${e.message}` 
            })
        }
    }
}