export default {
    name: 'tourl3',
    alias: ['upload3'],
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
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';

            // 1. Validasi Input (No Reply)
            if (!mime.startsWith('image/')) {
                await m.react('❌')
                return await conn.sendMessage(m.chat, { 
                    image: { url: global.tools }, 
                    caption: `*${toSmallCaps("ᴜᴘʟᴏᴀᴅ ᴍᴇᴅɪᴀ ᴠ𝟹")}* 📤\n\n` +
                             `Silakan reply gambar untuk diupload menggunakan Engine Catbox Manual.` 
                })
            }

            await m.react('⏱️')

            // 2. Download Buffer
            let buffer = await q.download();

            // 3. Persiapan Multipart Manual
            let boundary = '----WebKitFormBoundary' + Date.now();
            let body = '';
            body += `--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n`;
            body += `--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="time"\r\n\r\n${Date.now() / 1000 | 0}\r\n`;
            body += `--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="fileToUpload"; filename="radja_${Date.now()}.jpg"\r\n`;
            body += `Content-Type: ${mime}\r\n\r\n`;

            let pre = Buffer.from(body, 'utf8');
            let post = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
            let finalBuffer = Buffer.concat([pre, buffer, post]);

            // 4. Upload ke Catbox menggunakan Fetch
            let res = await fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary },
                body: finalBuffer
            });

            let url = await res.text();
            if (!url.startsWith('http')) throw new Error('Server Catbox tidak merespon dengan benar.');

            // 5. Kirim Hasil Mewah (TANPA REPLY / TANPA QUOTED)
            await m.react('✅')
            
            const size = (buffer.length / 1024 / 1024).toFixed(2);
            let caption = `🚀 *${toSmallCaps("ᴜᴘʟᴏᴀᴅ sᴜᴄᴄᴇssғᴜʟ")}*\n\n` +
                          `➢  ◦  *Engine:* Catbox Manual\n` +
                          `➢  ◦  *Type:* IMAGE\n` +
                          `➢  ◦  *Size:* ${size} MB\n` +
                          `➢  ◦  *Link:* ${url.trim()}\n\n` +
                          `*${toSmallCaps("ʀᴀᴅᴊᴀ ᴇɴɢɪɴᴇ ᴄʟᴇᴀɴ ᴍᴏᴅᴇ")}*`;

            await conn.sendMessage(m.chat, { 
                image: buffer, 
                caption: caption 
            });

        } catch (e) {
            console.error(e);
            await m.react('❌')
            // Error handling mewah tanpa reply
            await conn.sendMessage(m.chat, { 
                image: { url: global.tools }, 
                caption: `❌ *${toSmallCaps("ᴜᴘʟᴏᴀᴅ ғᴀɪʟᴇᴅ")}*\n\nReason: ${e.message}` 
            })
        }
    }
}