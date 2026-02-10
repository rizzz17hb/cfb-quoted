import Groq from "groq-sdk";
import fs from 'fs';
import path from 'path';

const API_KEY = global.api.convert;
const groq = new Groq({ apiKey: API_KEY });

global.tempConvert = global.tempConvert || {};

export default {
    name: 'convertplugin',
    alias: ['cp', 'convert', 'recode'],
    category: 'owner',
    isOwner: true,
    exec: async ({ conn, m, text, command, usedPrefix }) => {
        const pluginsPath = path.join(process.cwd(), 'plugins');

        const getOwnerImage = () => {
            try {
                const assetsPath = path.join(process.cwd(), 'assets');
                const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
                return files.length > 0 ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)])) : null;
            } catch { return null; }
        };

        const img = getOwnerImage();
        const input = text ? text.toLowerCase().trim() : '';

        try {
            // --- PHASE: TERMINATE ---
            if (input === 'stop') {
                if (!global.tempConvert[m.sender]) return m.reply('`[!]` No active session.');
                delete global.tempConvert[m.sender];
                return m.react('🗑️');
            }

            // --- PHASE: SAVE ---
            if (input.startsWith('save ') && global.tempConvert[m.sender]) {
                const target = text.split(/\s+/)[1]?.trim();
                if (!target) return m.reply(`*Usage:* ${usedPrefix + command} save folder/filename.js`);

                const { code } = global.tempConvert[m.sender];
                const fileName = target.endsWith('.js') ? target : target + '.js';
                const filePath = path.join(pluginsPath, fileName);
                const dir = path.dirname(filePath);

                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(filePath, code);
                delete global.tempConvert[m.sender];

                const successTeks = `╭── ❏ *("sʏsᴛᴇᴍ sᴛᴏʀᴀɢᴇ")* ❏
│ \`\`\`❏ Path    :\`\`\` plugins/${fileName}
│ \`\`\`❏ Status  :\`\`\` Successfully Saved
╰───────────────➣`;
                await m.react('✅');
                return img ? conn.sendMessage(m.chat, { image: img, caption: successTeks }, { quoted: m }) : m.reply(successTeks);
            }

            // --- PHASE: LANJUT ---
            if (input === 'lanjut' && global.tempConvert[m.sender]) {
                const emojies = {
                    'berita': '📰', 'download': '📥', 'search': '🔍', 'tools': '🛠️', 'other': '📁', 
                    'anime': '🌸', 'game': '🎮', 'fun': '🎡', 'genshin': '🧭', 'quotes': '💬', 
                    'grup': '👥', 'sticker': '✨', 'stalking': '🕵️', 'store': '🏪', 'islamic': '🌙', 
                    'primbon': '🔮', 'owner': '👑', 'premium': '💎', 'bug': '👾', 'nsfw': '🔞', 
                    'ai': '🤖', 'test': '🧪'
                };

                const folders = fs.readdirSync(pluginsPath, { withFileTypes: true })
                    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
                    .map(d => {
                        const lowName = d.name.toLowerCase();
                        let emoji = '📁';
                        for (let key in emojies) { if (lowName.includes(key)) { emoji = emojies[key]; break; } }
                        return `│ ◦ ➢ ${emoji} ${toSmallCaps(d.name)}`;
                    }).sort().join('\n');

                const listTeks = `╭── ❏ *${toSmallCaps("sᴇʟᴇᴄᴛ ᴅɪʀᴇᴄᴛᴏʀʏ")}* ❏
${folders}
╰───────────────➣
*COMMAND:* \`${usedPrefix + command} save folder/name.js\``;
                
                return img ? conn.sendMessage(m.chat, { image: img, caption: listTeks }, { quoted: m }) : m.reply(listTeks);
            }

            // --- PHASE: CONVERT (THE V3.1 ARCHITECT) ---
            const q = m.quoted ? m.quoted : m;
            if (!q.text) return m.reply(`*REPLY* a script to reconstruct.`);

            await m.react('⚡');

            const prompt = `You are the Radja Engine Core Architect, a world-class Software Engineer. 
Your task is to RECONSTRUCT (not just translate) the provided script into a high-performance Radja Engine Plugin.

### ⚙️ CORE ARCHITECTURAL RULES:
1. MODULE SYSTEM: Strict ES Modules (ESM). Use 'import ... from ...'. NO 'require' or 'module.exports'.
2. PLUGIN STRUCTURE:
   - Use: export default { name, alias, category, isOwner, isPremium, exec: async ({ conn, m, args, text, usedPrefix, command }) => { ... } }
   - Mandatory: Wrap the entire 'exec' body in a try-catch block.
3. VISUAL PROTOCOL (RADJA UI):
   - Every success response MUST use: ╭── ❏ *TITLE IN SMALLCAPS* ❏
   - Label alignment: │ \`\`\`❏ Label    :\`\`\` Result
   - Integrate a 'toSmallCaps' helper inside the plugin.
4. LOGIC RECONSTRUCTION:
   - Validation First: Check for text/quoted media.
   - Interactive Feedback: START: ⏱️ | SUCCESS: ✅ | ERROR: ❌
   - Optimization: Convert callbacks to async/await.
5. CLEANING: Remove help, tags, limit. Ensure MonoSpace symbols (❏) are aligned.

### 🚫 OUTPUT RESTRICTIONS:
- Provide ONLY raw JavaScript. NO Markdown blocks. NO preamble. Start IMMEDIATELY with 'import ...'.`;

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: q.text }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.1 // Lower temperature for higher structural stability
            });

            let convertedCode = completion.choices[0].message.content.trim()
                .replace(/^```javascript/gi, '').replace(/^```/gi, '').replace(/```$/gi, '').trim();

            global.tempConvert[m.sender] = { code: convertedCode };

            // Preview Raw Code
            await conn.sendMessage(m.chat, { text: `\`\`\`javascript\n${convertedCode}\n\`\`\`` });

            const nextTeks = `╭── ❏ *${toSmallCaps("ʀᴇᴄᴏᴅᴇ ꜰɪɴɪsʜᴇᴅ")}* ❏
│ \`\`\`❏ Status   :\`\`\` Optimized v3.1
│ \`\`\`❏ Model    :\`\`\` Llama 3.3 70B
╰───────────────➣
*NEXT:* Ketik \`${usedPrefix + command} lanjut\``;

            await (img ? conn.sendMessage(m.chat, { image: img, caption: nextTeks }, { quoted: m }) : m.reply(nextTeks));
            await m.react('✅');

        } catch (error) {
            await m.react('❌');
            await conn.sendMessage(m.chat, { 
                image: img,
                caption: `*ENGINE ERROR:* ${error.message}` 
            }, { quoted: m });
        }
    }
};