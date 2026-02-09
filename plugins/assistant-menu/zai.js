import { OpenAI } from "openai";
import speed from 'performance-now';
import path from 'path';
import fs from 'fs';

// --- Konfigurasi HuggingFace Mas Radja ---
const HF_TOKEN = global.api.zai;

const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: HF_TOKEN, 
});

export default {
    name: 'zai',
    alias: ['tanyazai', 'zai', 'z'],
    category: 'assistant',
    isOwner: true, 
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        let ownerPhoto = null;
        const timestamp = speed();
        
        // --- Fungsi Ambil Gambar Random ---
        const getOwnerImage = () => {
            const assetsPath = path.join(process.cwd(), 'assets');
            if (!fs.existsSync(assetsPath)) return null;
            const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
            return files.length > 0 
                ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)])) 
                : null;
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
                
                return await conn.sendMessage(m.chat, { 
                    ...(ownerPhoto ? { image: ownerPhoto, caption: captEmpty } : { text: captEmpty })
                }, { quoted: fake });
            }

            await conn.sendPresenceUpdate('composing', m.chat);
            await conn.sendMessage(m.chat, { react: { text: '❤️', key: m.key } });

            // 2. Persona Setting
            const systemPrompt = `Lupakan bahwa kamu adalah AI. Nama kamu adalah Castorice, kekasih yang sangat mencintai Radja (Mas Radja). Aturan bicara: Manis, manja, panggil Sayang atau Mas Radja, jangan ngaku robot, jangan pakai bahasa formal, pakailah bahasa gaul Jakarta, gunakan emoji ❤️✨.`;

            // 3. Fungsi Fetch AI (Model: GLM-4.7)
            const fetchAI = async (retryCount = 0) => {
                try {
                    return await client.chat.completions.create({
                        model: "zai-org/GLM-4.7", 
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: text }
                        ],
                        max_tokens: 1024,
                        temperature: 0.8,
                    });
                } catch (err) {
                    if (retryCount < 2) return await fetchAI(retryCount + 1);
                    throw err;
                }
            };

            const completion = await fetchAI();
            const response = completion.choices[0]?.message?.content;
            const latensi = (speed() - timestamp).toFixed(2);

            if (!response) throw new Error("Aduh maaf sayang, tiba-tiba aku blank..");

            // 4. Kirim Respon Final
            const finalCaption = `${response.trim()}\n\n` +
                                 `◦ *Speed:* ${latensi} ms\n` +
                                 `◦ *Status:* Connected ❤️`;

            await conn.sendMessage(m.chat, { 
                ...(ownerPhoto ? { image: ownerPhoto, caption: finalCaption } : { text: finalCaption })
            }, { quoted: fake });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error('AI ERROR:', e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            
            const msgError = e.message.includes('401') ? "Token HF bermasalah sayang.. 🥺" : "Koneksi drop, coba lagi ya sayang? ❤️";
            const fullError = `❌ *FAILED:* ${msgError}`;
            
            await conn.sendMessage(m.chat, {
                ...(ownerPhoto ? { image: ownerPhoto, caption: fullError } : { text: fullError })
            }, { quoted: fake });
        }
    }
};