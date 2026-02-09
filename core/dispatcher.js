import fs from 'fs';
import util from 'util';
import { exec } from 'child_process';
import { plugins, cmdMap } from './registry.js';
import { checkPermission } from './permission.js';
import { isCooling } from './cooldown.js';
import { logError } from './error.js';
import { logger } from './logger.js';

const processedMessages = new Set();

export default async (conn, m) => {
    try {
        if (!m.key || !m.key.id) return;
        
        if (processedMessages.has(m.key.id)) return;
        processedMessages.add(m.key.id);
        if (processedMessages.size > 1000) processedMessages.clear();
        setTimeout(() => processedMessages.delete(m.key.id), 15000);

        global.db = global.db || { users: {}, chats: {}, settings: {} };
        global.opts = global.opts || {};

        if (m.sender && !global.db.users[m.sender]) {
            global.db.users[m.sender] = {
                name: m.pushName || 'User',
                limit: 20,
                premium: false,
                premiumTime: 0,
                lastSeen: Date.now(),
                totalChat: 0,
                banned: false,
                warn: 0 
            };
        }

        if (m.isGroup && !global.db.chats[m.chat]) {
            global.db.chats[m.chat] = {
                name: m.pushName || 'Group Chat',
                mute: false,
                welcome: true,
                nsfw: false,
                antidelete: true,
                antilink: false
            };
        }

        const user = global.db.users[m.sender];
        const chat = m.isGroup ? global.db.chats[m.chat] : null;
        const fake = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "😉reminder" }
        };

        if (global.opts['self'] && !m.isOwner && !m.fromMe) return;
        if (user?.banned && !m.isOwner) return;

        if (user?.premium && user.premiumTime > 0 && Date.now() > user.premiumTime) {
            user.premium = false;
            user.premiumTime = 0;
            user.limit = 20;
            await conn.sendMessage(m.chat, {
                image: { url: global.premium },
                caption: `🚀 *INFO:* Masa premium kamu telah habis. Kembali ke status Free.`
            }, { quoted: fake });
        }

        if (user) {
            user.lastSeen = Date.now();
            user.totalChat += 1;
            if (m.isOwner) {
                user.premium = true;
                user.limit = 999999;
            }
        }

        const budy = typeof m.body === 'string' ? m.body : '';

        // >>> A. ANTI-LINK HANDLER <<<
        const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})|(https?:\/\/|www\.)\S+/gi;
        if (m.isGroup && chat?.antilink && linkRegex.test(budy)) {
            const antilinkPlugin = plugins.get('antilink.js'); 
            if (antilinkPlugin) {
                await antilinkPlugin.exec({ conn, m, chat, user, plugins });
                if (!m.isOwner && !m.isAdmin) return;
            }
        }

        // ---------------------------------------------------------
        // --- [ 4. EXECUTION ENGINE (RADJA HYBRID CORE) ] ---
        // ---------------------------------------------------------
        
        let targetPlugin = null;
        let usedCommand = m.command;

        // 1. Cek via Command Map (Prefix)
        if (m.isCmd) {
            const pluginName = cmdMap.get(m.command);
            targetPlugin = plugins.get(pluginName);
        } 
        
        // 2. Cek via Mapping Otomatis (Non-Prefix / Hybrid)
        if (!targetPlugin && budy) {
            const lowerBudy = budy.toLowerCase().trim();
            const firstWord = lowerBudy.split(' ')[0];
            for (const [file, plugin] of plugins.entries()) {
                if (plugin.name === firstWord || (plugin.alias && plugin.alias.includes(firstWord))) {
                    targetPlugin = plugin;
                    usedCommand = firstWord;
                    // Update m context agar plugin menerima data yang benar
                    m.args = budy.trim().split(/ +/).slice(1);
                    m.text = m.args.join(' ');
                    break;
                }
            }
        }

        // 3. Eksekusi Jika Plugin Ditemukan (Baik prefix maupun non-prefix)
        if (targetPlugin) {
            if (chat?.mute && !m.isOwner && !m.isAdmin) return;
            if (!await checkPermission(m, targetPlugin, conn)) return;

            const cooldownTime = isCooling(m.sender, usedCommand);
            if (cooldownTime && !m.isOwner) {
                return conn.sendMessage(m.chat, { 
                image: { url: global.url },
                caption: "⏱️ Slow down... Tunggu *${cooldownTime}s* lagi." 
            }, { quoted: fake });
            }

            if (targetPlugin.limit && user.limit <= 0 && !user.premium && !m.isOwner) {
                return conn.sendMessage(m.chat, { 
                image: { url: global.url },
                caption: "❌ Limit harian kamu habis!" 
            }, { quoted: fake });
            }

            try {
                // Logger
                const usedRAM = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
                logger.info(`EXEC: ${usedCommand} | Method: ${m.isCmd ? 'Prefix' : 'Hybrid'} | RAM: ${usedRAM}MB`);

                await targetPlugin.exec({
                    conn, m,
                    prefix: m.prefix || '',
                    usedPrefix: m.prefix || '',
                    command: usedCommand,
                    args: m.args || [],
                    text: m.text || '',
                    user, chat, plugins,
                    isOwner: m.isOwner,
                    isAdmin: m.isAdmin
                });

                if (targetPlugin.limit && !m.isOwner && !user.premium) {
                    user.limit = Math.max(0, user.limit - 1);
                }
                return;
            } catch (err) {
                logger.error(`Plugin Failure: ${usedCommand}`, err);
                logError(usedCommand, err, m);
                m.reply(`❌ Terjadi kesalahan pada fitur *${usedCommand}*`);
                return;
            }
        }

        // 4. JALUR AI (Jika bukan command & bukan fitur yang terdaftar)
        if (!m.fromMe && budy && !m.isCmd) {
            try {
                const aiPath = process.cwd() + '/plugins/ai-menu/tanyaAI.js';
                if (fs.existsSync(aiPath)) {
                    const { default: aiPlugin } = await import(`file://${aiPath}`);
                    const execAI = aiPlugin.default?.exec || aiPlugin.exec;
                    if (execAI) {
                        await execAI({ conn, m, body: budy, user, chat, plugins, text: budy });
                        return;
                    }
                }
            } catch (err) {
                // AI Silent error
            }
        }

        // --- [ 5. OWNER TOOLS (Eval & Exec) ] ---
        if (m.isOwner && budy) {
            if (budy.startsWith('>> ')) {
                try {
                    let evaled = await eval(`(async () => { ${budy.slice(3).trim()} })()`);
                    if (typeof evaled !== 'string') evaled = util.inspect(evaled);
                    m.reply(evaled);
                } catch (e) { m.reply(util.format(e)); }
            }
            if (budy.startsWith('$ ')) {
                exec(budy.slice(2).trim(), (err, stdout) => {
                    if (err) return m.reply(util.format(err));
                    if (stdout) m.reply(stdout);
                });
            }
        }

    } catch (e) {
        if (logger) logger.error('FATAL DISPATCHER ERROR', e);
        else console.error(e);
    }
};