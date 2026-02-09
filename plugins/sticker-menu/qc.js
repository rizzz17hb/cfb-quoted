import axios from "axios";

export default {
    name: 'qc',
    alias: ['quotly'],
    category: 'sticker',
    exec: async ({ conn, m, args }) => {
        try {
            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || "";
            
            let text;
            if (args.length >= 1) {
                text = args.join(" ");
            } else if (m.quoted) {
                text = m.quoted.text || "";
            } else {
                await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
                await conn.sendMessage(m.chat, { 
                image: global.sticker,
                caption: `*• Example :* .qc *[text or reply message]*` 
            }, { quoted: m });
            }

            await m.react('⏱️');

            // Set data reply
            let reply = {};
            if (m.quoted) {
                reply = {
                    name: q.name,
                    text: q.text || "",
                    chatId: q.chat.split("@")[0],
                };
            }

            // Ambil Foto Profil
            const pp = await conn.profilePictureUrl(q.sender, "image")
                .catch((_) => "https://telegra.ph/file/320b066dc81928b782c7b.png");

            // Build objek Quotly
            const obj = {
                type: "quote",
                format: "png",
                backgroundColor: "#161616",
                width: 512,
                height: 768,
                scale: 2,
                messages: [{
                    entities: [],
                    avatar: true,
                    from: {
                        id: q.sender.split("@")[0],
                        name: q.name || "User",
                        photo: { url: pp },
                    },
                    text: text || "",
                    replyMessage: reply,
                }],
            };

            // Hit API Quotly
            const response = await axios.post("https://quotly.netorare.codes/generate", obj, {
                headers: { "Content-Type": "application/json" }
            });

            // Hasilnya berupa Base64
            const buffer = Buffer.from(response.data.result.image, "base64");

            // KIRIM SEBAGAI STIKER (Pake cara internal bot lo)
            // Kalo bot lo support conn.sendFile otomatis jadi stiker buat file .webp:
            await conn.sendFile(m.chat, buffer, 'qc.webp', '', m, false, { asSticker: true });
            
            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            await conn.sendMessage(m.chat, { 
                image: global.sticker,
                caption: `❌ *QC ERROR:* ${e.message}` 
            }, { quoted: m });
        }
    }
};
