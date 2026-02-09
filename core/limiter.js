import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { smoothLog } from '../lib/start.js';

/**
 * Reset Limit System - White & MagentaBright Edition
 */
export const resetLimit = async (conn = null) => {
    if (!global.db?.users) {
        const errMsg = chalk.whiteBright(' [ ') + chalk.magentaBright('SYSTEM') + chalk.whiteBright(' ] Gagal reset limit: Database Users kosong.');
        await smoothLog(errMsg, 15, 0);
        return;
    }

    const users = global.db.users;
    let count = 0;
    let userList = [];

    Object.keys(users).forEach(jid => {
        const user = users[jid];
        if (!user.premium) {
            user.limit = global.limitDefault || 20; 
            count++;
            if (userList.length < 10) userList.push(`   ◦ @${jid.split('@')[0]}`);
        } else {
            user.limit = 100;
        }
    });

    global.db.settings = global.db.settings || {};
    global.db.settings.lastReset = new Date().toDateString();

    const timeString = new Date().toLocaleString('id-ID');
    
    // --- PENYUSUNAN LIST LAPORAN WHATSAPP ---
    let reportList = userList.join('\n');
    if (count > 10) reportList += `\n   ◦ ...dan ${count - 10} user lainnya.`;

    const statsText = `➢ *Status:* _Success_\n` +
                      `➢ *Total Reset:* _${count} Members_\n` +
                      `➢ *Clock:* _${timeString}_\n\n` +
                      `*LIST RESET SAMPEL:*\n${reportList}`;

    // Laporan ke Owner
    if (conn && global.owner?.[0]) {
        try {
            const ownerJid = global.owner[0].includes('@') ? global.owner[0] : `${global.owner[0]}@s.whatsapp.net`;
            const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import('@whiskeysockets/baileys')).default;

            const getOwnerImage = () => {
                const assetsPath = path.join(process.cwd(), 'assets');
                if (!fs.existsSync(assetsPath)) return null;
                const files = fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f));
                if (files.length === 0) return null;
                return fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)]));
            };

            const ownerBuffer = getOwnerImage();
            let headerConfig = { title: "ＳＹＳＴＥＭ  ＲＥＰＯＲＴ", hasMediaAttachment: false };

            if (ownerBuffer) {
                const media = await prepareWAMessageMedia({ image: ownerBuffer }, { upload: conn.waUploadToServer });
                headerConfig.hasMediaAttachment = true;
                headerConfig.imageMessage = media.imageMessage;
            }

            const interactiveMessage = {
                header: headerConfig,
                body: { text: `Halo Mas Radja, berikut rincian reset limit otomatis:\n\n${statsText}` },
                footer: { text: "Ｃａｓｔｏｒｉｃｅ  Ａｓｓｉｓｔａｎｔ" },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ display_text: "ᑕEK ᗪᗩTᗩᗷᗩᔕE", id: ".listuser" })
                    }]
                }
            };

            const msg = generateWAMessageFromContent(ownerJid, { 
                viewOnceMessage: { message: { interactiveMessage } } 
            }, { userJid: conn.user.id });

            await conn.relayMessage(ownerJid, msg.message, { messageId: msg.key.id });
        } catch (e) {
            console.log(chalk.red(`[ ERROR ] Laporan Gagal: ${e.message}`));
        }
    }
};

/**
 * Inisialisasi Penjadwalan Reset
 */
export const initLimiter = async (conn) => {
    const today = new Date().toDateString();
    const lastReset = global.db?.settings?.lastReset;

    if (lastReset !== today) {
        const detectMsg = chalk.whiteBright(' [ ') + chalk.magentaBright('SYSTEM') + chalk.whiteBright(' ] Mendeteksi limit belum direset. Running auto-reset...');
        await smoothLog(detectMsg, 15, 0);
        await resetLimit(conn);
    }

    const scheduleNextReset = async () => { 
        const now = new Date();
        const nextReset = new Date();

        nextReset.setDate(now.getDate() + 1);
        nextReset.setHours(0, 0, 1, 0); 

        const msToNextReset = nextReset.getTime() - now.getTime();

        setTimeout(async () => {
            await resetLimit(conn);
            await scheduleNextReset();
        }, msToNextReset);

        const hoursLeft = (msToNextReset / (1000 * 60 * 60)).toFixed(1);
        const limiterMsg = 
            chalk.magentaBright(' [ ') + 
            chalk.magentaBright('SYSTEM') + 
            chalk.magentaBright(' ]') + 
            chalk.whiteBright(' Limiter: ') +
            chalk.whiteBright('Active') + 
            chalk.magentaBright(' |') + 
            chalk.whiteBright(' Next Reset: ') + 
            chalk.whiteBright(`${hoursLeft}h`) + 
            chalk.magentaBright(` (${nextReset.toLocaleTimeString('id-ID').replace(/:/g, '.')})`);

        await smoothLog(limiterMsg, 15, 0);
    };

    await scheduleNextReset();
};