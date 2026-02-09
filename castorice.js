import './config.js';
import baileys from "@whiskeysockets/baileys";
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import readline from 'readline';
import chalk from 'chalk';
import NodeCache from 'node-cache';
import now from 'performance-now';
import handler from './handler.js';
import { loadPlugins } from './core/registry.js';
import { loadDatabase } from './lib/database.js';
import { initSystem, smoothLog, engineLog } from './lib/start.js';
import { verifyAccess, getSystemGreet } from './core/rolehandling.js';
import { autoFollowNewsletter } from './core/newsletter.js';
import { laporOn } from './core/greeting.js'; 

const { 
    useMultiFileAuthState, 
    makeCacheableSignalKeyStore, 
    fetchLatestBaileysVersion, 
    DisconnectReason,
    Browsers 
} = baileys;

const makeWASocket = (baileys.default || baileys);
const msgRetryCounterCache = new NodeCache();
global.pairingKode = "C4STADJ4";

async function startEngine() {
    await initSystem();
    await loadDatabase();
    
    const stats = await loadPlugins('./plugins');
    const statsMsg = chalk.magentaBright(' [ ') + 
                     chalk.magentaBright('SYSTEM') + 
                     chalk.magentaBright(' ] ') + 
                     chalk.whiteBright(`${stats.plugins} Plugins & ${stats.commands} Commands Ready!`);
    
    await smoothLog(statsMsg, 15, 0);

    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: Browsers.ubuntu("Chrome"),
        msgRetryCounterCache,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async () => ({ conversation: 'C4STADJ4 Engine' }),
    });

    conn.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jid.split(':');
            return decode[0] + '@' + decode[1].split('@')[1] || jid;
        }
        return jid;
    };

    // --- PAIRING SYSTEM ---
    if (!conn.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const question = (text) => new Promise((resolve) => rl.question(text, resolve));
        console.log("");
        const auth = await verifyAccess(question, smoothLog, global.password || "RADJA");
        let phone = auth.isOwner
            ? auth.phone
            : (await question(chalk.magentaBright(` ❯ NOMOR WA (62xxx): `))).replace(/[^0-9]/g, '');
        rl.close();

        if (phone) {
            setTimeout(async () => {
                let code = await conn.requestPairingCode(phone, global.pairingKode);
                code = code?.match(/.{1,4}/g)?.join('-') || code;

                const text = `CODE : ${code.toUpperCase()}`;
                const width = 44;
                const left = Math.floor((width - text.length) / 2);
                const right = width - text.length - left;

                console.log(chalk.magentaBright.bold(`\n ╔${'═'.repeat(width)}╗`));
                console.log(chalk.magentaBright.bold(
                    ` ║${' '.repeat(left)}${text}${' '.repeat(right)}║`
                ));
                console.log(chalk.magentaBright.bold(` ╚${'═'.repeat(width)}╝\n`));
            }, 3000);
        }
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                startEngine();
            } else {
                fs.rmSync('./session', { recursive: true, force: true });
                process.exit(0);
            }

        } else if (connection === 'open') {
            autoFollowNewsletter(conn);

            import('./core/limiter.js').then(m => m.initLimiter(conn));
            setTimeout(async () => { 
                await laporOn(conn); 
            }, 5000);
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m || !m.message) return;
            m.startTime = now();
            await handler(conn, m);
        } catch (e) {}
    });

    return conn;
}

startEngine().catch(e => {});
