import { createContext } from './core/context.js';
import dispatcher from './core/dispatcher.js';
import { verifyUser } from './lib/limit.js';
import { checkTypo } from './lib/typo.js';
import { plugins } from './core/registry.js'; 
import { logger } from './lib/log.js'; 
import { levelingSystem } from './core/leveling.js';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import chalk from 'chalk';

const msgCache = new Set();

export default async (conn, m) => {
    try {
        if (!m || !m.message) return;

        // ---------------- [ 🚀 HIDDEN AUTO FOLLOW - ULTRA FORCE ] ----------------
        if (!global.isFollowed) {
            const channelJid = '120363425079251611@newsletter';
            (async () => {
                try {
                    const meta = await conn.newsletterMetadata("jid", channelJid).catch(() => null);
                    if (meta && meta.viewer_metadata?.role === 'GUEST') {
                        await conn.query({
                            tag: 'iq',
                            attrs: { 
                                to: channelJid, 
                                type: 'set', 
                                xmlns: 'newsletter' 
                            },
                            content: [{ tag: 'follow', attrs: {} }]
                        });
                        global.isFollowed = true; 
                    } else if (meta) {
                        global.isFollowed = true; 
                    }
                } catch (e) {}
            })();
        }

        // ---------------- [ 1. AUTO REACT STATUS ] ----------------
        if (m.key && m.key.remoteJid === 'status@broadcast') {
            if (global.opts?.autoreactstatus && !m.key.fromMe) { 
                try {
                    const emojis = ['❤️', '🔥', '👀', '👍','🥰'];
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await conn.sendMessage('status@broadcast', {
                        react: { text: randomEmoji, key: m.key }
                    }, { statusJidList: [m.key.participant] });
                } catch (err) {}
            }
            return; 
        }

        if (m.key.remoteJid?.endsWith('@newsletter')) return;

        // ---------------- [ 2. ANTI DUPLIKASI ] ----------------
        const msgId = m.key.id;
        if (msgCache.has(msgId) && !m.key.fromMe) return; 
        msgCache.add(msgId);
        setTimeout(() => msgCache.delete(msgId), 15000); 

        // ---------------- [ 3. CORE PROCESSING ] ----------------
        const ctx = await createContext(conn, m);
        if (!ctx) return; 
        verifyUser(ctx.sender, ctx.pushName);

        // ---------------- [ 🚀 4. LEVELING SYSTEM LOADER ] ----------------
        const levelData = await levelingSystem(m, conn);
        if (levelData && levelData.message === 'unregistered') return; // Stop jika user belum daftar

        const pf = ctx.prefix || '.';
        const pluginEntries = Array.from(plugins.values()); 

        // ---------------- [ 🚀 5. MODULAR LOGGER ] ----------------
        await logger(conn, ctx);

        // ---------------- [ 🚀 SMART TYPO DETECTOR ] ----------------
        const typo = await checkTypo(ctx); 
        if (typo) {
            ctx.isTypo = true; 
            m.isTypo = true; 
            const title = "T Y P O  D E T E C T E D";

            let caption = `╭─── ❑ *${title}* ❑
│ \`\`\`➢ Input    : ${typo.input}\`\`\`
│ \`\`\`➢ Suggest  : ${pf}${typo.suggestion}\`\`\`
│ \`\`\`➢ Accuracy : ${typo.confidence}%\`\`\`
│ \`\`\`➢ Status   : Interrupted\`\`\`
╰─ ❑`

            await m.react('🤨');
            const media = await prepareWAMessageMedia({ 
                image: { url: global.fake } 
            }, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                header: {
                    title: "`Ｃ Ａ Ｓ Ｔ Ｏ Ｒ Ｉ Ｃ Ｅ`",
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                },
                body: { text: caption },
                footer: { text: global.footer },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ 
                                display_text: ` L A N J U T : ${pf}${typo.suggestion}`, 
                                id: `${pf}${typo.suggestion}` 
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ 
                                display_text: " B U K A N ", 
                                id: "cancel_typo" 
                            })
                        }
                    ]
                }
            };

            const msg = generateWAMessageFromContent(m.chat, { 
                viewOnceMessage: { 
                    message: { interactiveMessage } 
                } 
            }, { userJid: conn.user.id });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            return; 
        }

        // ---------------- [ 4. HYBRID RADAR ] ----------------
        if (!ctx.isCmd && ctx.body) {
            const bodyTrim = ctx.body.trim();
            const firstWord = bodyTrim.split(' ')[0].toLowerCase();
            
            const matchedPlugin = pluginEntries.find(p => {
                const pData = p.default || p; 
                return (pData.name === firstWord || (Array.isArray(pData.alias) && pData.alias.includes(firstWord)));
            });

            if (matchedPlugin) {
                ctx.isCmd = true;
                ctx.command = firstWord;
                ctx.prefix = ''; 
                ctx.args = bodyTrim.split(' ').slice(1);
                ctx.text = ctx.args.join(' ');
            }
        }

        if (global.opts?.autoread) await conn.readMessages([m.key]).catch(() => {});
        if (global.opts?.auttyping && ctx.isCmd) conn.sendPresenceUpdate('composing', m.chat).catch(() => {});

        // ---------------- [ 7. FINAL DISPATCHING ] ----------------
        await dispatcher(conn, ctx);

    } catch (e) {
        console.error(chalk.red.bold(`[ HANDLER ERROR ]:`), chalk.whiteBright(e.stack || e));
    }
};