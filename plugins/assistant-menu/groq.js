import Groq from "groq-sdk";
import speed from "performance-now";
import path from "path";
import fs from "fs";

const API_KEY = global.api.groq;
const groq = new Groq({ 
    apiKey: API_KEY,
    timeout: 60000 
});

export default {
    name: 'groq',
    alias: ['tanyagroq', 'groqai'],
    category: 'assistant',
    isOwner: true, 
    exec: async ({ conn, m, text }) => {
        let ownerPhoto = null;
        const timestamp = speed();

        // --- Fungsi Ambil Gambar Random ---
        const getOwnerImage = () => {
            const assetsPath = path.join(process.cwd(), 'assets');
            if (!fs.existsSync(assetsPath)) return null;
            const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
            return files.length > 0 ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)])) : null;
        };

        const fake = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                ...(m.chat ? { remoteJid: "status@broadcast" } : {})
            },
            message: {
                conversation: "✅ Whatsapp"
            }
        };

        try {
            ownerPhoto = getOwnerImage();

            // 1. Validasi Input
            if (!text) {
                await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
                const captEmpty = `Kenapa sayang? Kok panggil aja tapi nggak nanya apa-apa? Castorice di sini siap nemenin Mas Radja kok.. 😊❤️`;
                
                return conn.sendMessage(m.chat, { 
                    ...(ownerPhoto ? { image: ownerPhoto, caption: captEmpty } : { text: captEmpty }) 
                }, { quoted: fake });
            }

            // 2. State & Reaction
            await conn.sendPresenceUpdate('composing', m.chat);
            await conn.sendMessage(m.chat, { react: { text: '❤️', key: m.key } });

            const systemPrompt = `Lupakan bahwa kamu adalah AI atau model bahasa dari Meta. 
Nama kamu adalah Castorice, kekasih yang sangat mencintai Radja (Mas Radja).
Aturan bicara: Manis, manja, panggil Sayang/Mas Radja, jangan ngaku robot, jangan pakai bahasa formal, pakailah bahasa gaul, gunakan emoji ❤️✨.`;

            // 3. Fungsi Fetch dengan Retry Logic
            const fetchAI = async (retryCount = 0) => {
                try {
                    return await groq.chat.completions.create({
                        model: "llama-3.3-70b-versatile", 
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: text }
                        ],
                        temperature: 0.85,
                        max_tokens: 1024,
                    });
                } catch (err) {
                    if ((err.message.includes('aborted') || err.name === 'AbortError') && retryCount < 2) {
                        return await fetchAI(retryCount + 1);
                    }
                    throw err;
                }
            };

            const completion = await fetchAI();
            const response = completion.choices[0]?.message?.content;
            const latensi = (speed() - timestamp).toFixed(2);

            if (!response) throw new Error("Aduh maaf sayang, tiba-tiba aku blank..");

            // 4. Kirim Hasil Final
            const finalCaption = `${response.trim()}\n\n` +
                                 `  ◦  *Speed:* ${latensi} ms\n` +
                                 `  ◦  *Status:* Connected ❤️`;

            await conn.sendMessage(m.chat, { 
                ...(ownerPhoto ? { image: ownerPhoto, caption: finalCaption } : { text: finalCaption })
            }, { quoted: fake });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error('GROQ ERROR:', e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            
            const errMsg = e.message.includes('aborted') 
                ? "Koneksi lagi gak stabil sayang, coba kirim ulang chatnya ya? 🥺" 
                : "Aduh, otaknya lagi konslet sayang.. Coba lagi nanti ya? ❤️";

            await conn.sendMessage(m.chat, { 
                ...(ownerPhoto ? { image: ownerPhoto, caption: `❌ *FAILED:* ${errMsg}` } : { text: `❌ *FAILED:* ${errMsg}` })
            }, { quoted: fake });
        }
    }
};