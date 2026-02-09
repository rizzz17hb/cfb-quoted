import { OpenAI } from "openai";
import speed from 'performance-now';
import path from 'path';
import fs from 'fs';

const HF_TOKEN = global.api.tanyaai;

const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: HF_TOKEN, 
});

export default {
    name: 'ai',
    alias: ['tanya', 'google'],
    category: 'assistant',
    isOwner: true, 
    nonPrefix: true, 
    exec: async ({ conn, m, text }) => {
        let ownerPhoto = null;
        const timestamp = speed();

        // --- HELPER: GET OWNER IMAGE ---
        const getOwnerImage = () => {
            const assetsPath = path.join(process.cwd(), 'assets');
            if (!fs.existsSync(assetsPath)) return null;
            const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
            return files.length > 0 
                ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)])) 
                : null;
        };

        const fakeQuoted = {
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
                }, { quoted: fakeQuoted });
            }

            await conn.sendPresenceUpdate('composing', m.chat);
            await conn.sendMessage(m.chat, { react: { text: '❤️', key: m.key } });

            // 2. Persona Setting
            const systemPrompt = `Lupakan bahwa kamu adalah AI. Nama kamu adalah Castorice, kekasih yang sangat mencintai Radja (Mas Radja). Aturan bicara: Manis, manja, panggil Sayang atau Mas Radja, jangan ngaku robot, jangan pakai bahasa formal, gunakan bahasa gaul Jakarta yang imut, gunakan emoji ❤️✨.`;

            // 3. Fungsi Fetch AI (Gemma 3)
            const fetchAI = async (retryCount = 0) => {
                try {
                    return await client.chat.completions.create({
                        model: "google/gemma-3-27b-it", 
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
            }, { quoted: fakeQuoted });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error('AI ERROR:', e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            
            let msgError = "Koneksi drop, coba lagi ya sayang? ❤️";
            if (e.message.includes('401')) msgError = "Token HF bermasalah sayang.. 🥺";
            
            const fullErrorMsg = `❌ *FAILED:* ${msgError}\n\n*Error:* ${e.message}`;

            await conn.sendMessage(m.chat, {
                ...(ownerPhoto ? { image: ownerPhoto, caption: fullErrorMsg } : { text: fullErrorMsg })
            }, { quoted: fakeQuoted });
        }
    }
};