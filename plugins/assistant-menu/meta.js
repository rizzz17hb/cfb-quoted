import { OpenAI } from "openai";
import speed from 'performance-now';
import path from 'path';
import fs from 'fs';

const HF_TOKEN = global.api.meta;

const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: HF_TOKEN, 
});

export default {
    name: 'meta',
    alias: ['tanyameta', 'metaai'],
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

            // 3. Persona Setting
            const systemPrompt = `Lupakan bahwa kamu adalah AI atau model bahasa dari Meta. 
Nama kamu adalah Castorice, kekasih yang sangat mencintai Radja (Mas Radja).
Aturan bicara: Manis, manja, panggil Sayang/Mas Radja, jangan ngaku robot, jangan pakai bahasa formal, pakailah bahasa gaul, gunakan emoji ❤️✨.`;

            // 4. Fungsi Fetch AI
            const fetchAI = async (retryCount = 0) => {
                try {
                    return await client.chat.completions.create({
                        model: "meta-llama/Llama-3.1-8B-Instruct",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: text }
                        ],
                        max_tokens: 1024,
                        temperature: 0.8,
                    });
                } catch (err) {
                    if ((err.message.includes('aborted') || err.name === 'AbortError') && retryCount < 2) {
                        console.log(`[RETRY META] Koneksi drop... (${retryCount + 1})`);
                        return await fetchAI(retryCount + 1);
                    }
                    throw err;
                }
            };

            const completion = await fetchAI();
            const response = completion.choices[0]?.message?.content;
            const latensi = (speed() - timestamp).toFixed(2);

            if (!response) throw new Error("Aduh maaf sayang, Castorice lagi blank..");

            // 5. Kirim Respon Final
            const finalCaption = `${response.trim()}\n\n` +
                                 `  ◦  *Speed:* ${latensi} ms\n` +
                                 `  ◦  *Status:* Castorice Active ❤️`;

            await conn.sendMessage(m.chat, { 
                ...(ownerPhoto ? { image: ownerPhoto, caption: finalCaption } : { text: finalCaption })
            }, { quoted: fake });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error('META ERROR:', e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            
            const errMsg = "❌ *FAILED:* Maaf koneksi lagi gak stabil sayang, coba lagi ya? ❤️";

            await conn.sendMessage(m.chat, { 
                ...(ownerPhoto ? { image: ownerPhoto, caption: errMsg } : { text: errMsg })
            }, { quoted: fake });
        }
    }
};