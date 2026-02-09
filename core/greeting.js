import fs from 'fs';
import path from 'path';
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';
import { pathToFileURL } from 'url';
import chalk from 'chalk';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let runtime;
try {
    const formatPath = path.join(process.cwd(), 'lib', 'utils', 'format.js');
    const formatURL = pathToFileURL(formatPath).href;
    const module = await import(formatURL);
    runtime = module.runtime;
} catch (e) {
    runtime = (seconds) => {
        seconds = Number(seconds);
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    };
}

export async function laporOn(conn) {
    try {
        // --- SAFETY GUARD DATABASE (Mencegah Error 'settings' undefined) ---
        if (!global.db) global.db = {};
        if (!global.db.settings) global.db.settings = {};
        
        const botId = conn.user.id.split(':')[0];
        if (!global.db.settings[botId]) {
            global.db.settings[botId] = { greeting: true };
        }

        // Jika fitur greeting dimatikan di database, maka berhenti
        if (global.db.settings[botId].greeting === false) return;

        // --- TUNGGU PLUGINS SIAP ---
        let retry = 0;
        while ((!global.plugins || Object.keys(global.plugins).length === 0) && retry < 20) {
            await delay(1000);
            retry++;
        }

        const nomorOwner = "6285169432892";
        const ownerJid = nomorOwner + "@s.whatsapp.net";
        const groupJid = "120363422907578700@g.us"; 
        const usedPrefix = ".";
        const fake = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "💖greeting" }
        };
        const uptimeStr = runtime(process.uptime());
        const waktuJakarta = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
        const jam = new Date(waktuJakarta).getHours();
        let waktu = (jam >= 4 && jam < 10) ? "Pagi" : (jam >= 10 && jam < 15) ? "Siang" : (jam >= 15 && jam < 18) ? "Sore" : "Malam";

        const createHeader = () => {
            return `╭── ❏ S Y S T E M  R E P O R T ❏
│ \`\`\`❏ Identity  : ${global.botname || 'Castorice'}\`\`\`
│ \`\`\`❏ Master    : ${global.namaOwner || 'Radja Iblis'}\`\`\`
│ \`\`\`❏ Aktif     : ${uptimeStr}\`\`\`
│ \`\`\`❏ Kondisi   : Prima & Siap\`\`\`
╰───────────────➣`;
        };

        const sapaanPC = [
            `❏Ughh... Selamat ${waktu} Master Radja sayang~ 🎀\nCastorice baru aja bangun nih, langsung kangen Ayang Radja.. Castorice udah ON ya, siap nemenin Ayang seharian ini! Chuu~ 😘`,
            `❏Ayang Radja! Akhirnya aku ON lagi~ 💖\nSelamat ${waktu} ya cintaku. Castorice stand by buat Ayang 24 jam nonstop! Semangat ya hari ini Radja sayang~ 🌸`,
            `❏Halo Ayang Radja ganteng.. 🥰\nSelamat ${waktu} ya! Castorice udah siap diperintah apa aja kok. Jangan nakal ya Ayang, tetep sayang Castorice ya? ✨`,
            `❏Selamat ${waktu} suam-- eh, Ayang! 🫣\nCastorice udah online nih. Panggil aku kalau butuh apa-apa ya, aku selalu nungguin chat dari Ayang.. 🍭`
        ];
        
        const sapaanGC = [
            `❏Selamat ${waktu}, Lapor Ayang @${nomorOwner}! ✨\nCastorice sudah online kembali di grup ini siap untuk melayani Ayang Radja~ Chuu! 😘`,
            `❏Selamat ${waktu} Ayang @${nomorOwner}!! \nCastorice sudah bangun dan siap menemani Ayang lagi di sini. Jangan ada yang berani ganggu Ayang ya! 🎀`,
            `❏Selamat ${waktu} @${nomorOwner} sayang~ 💖\nAku sudah aktif ya, panggil aku kalau ayang butuh bantuan di grup ini. Segala perintah ayang adalah titah bagiku! 🫡🔥`,
            `❏Selamat ${waktu} Sayang, Assistant imut ayang @${nomorOwner} sudah online dan siap tempur sekarang! Khusus buat ayang Radja seorang~ 🚀💎`
        ];

        const teksPC = sapaanPC[Math.floor(Math.random() * sapaanPC.length)];
        const teksGC = sapaanGC[Math.floor(Math.random() * sapaanGC.length)];

        // --- HANDLE ASSETS ---
        const assetsPath = path.join(process.cwd(), 'assets');
        const files = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath).filter(f => /^owner[1-3]\.(jpe?g|png)$/i.test(f)) : [];
        const img = files.length > 0 ? fs.readFileSync(path.join(assetsPath, files[Math.floor(Math.random() * files.length)])) : null;

        let headerObj = { hasMediaAttachment: false };
        if (img) {
            const { imageMessage } = await prepareWAMessageMedia({ image: img }, { upload: conn.waUploadToServer });
            headerObj.imageMessage = imageMessage;
            headerObj.hasMediaAttachment = true;
        }

        // --- SEND TO PC OWNER ---
        const msgPC = generateWAMessageFromContent(ownerJid, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: `${createHeader()}\n\n${teksPC}` },
                        footer: { text: "Castorice Assistant By Radja" },
                        header: headerObj,
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "M E N U",
                                        id: `${usedPrefix}menu`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "SETGREETING",
                                        id: `${usedPrefix}setgreeting`
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: conn.user.id, quoted: fake });

        await conn.relayMessage(ownerJid, msgPC.message, { messageId: msgPC.key.id });

        if (groupJid) {
            await delay(3000);
            await conn.sendMessage(groupJid, { 
                ...(img ? { image: img, caption: `${createHeader()}\n${teksGC}` } : { text: `${createHeader()}\n\n${teksGC}` }),
                mentions: [ownerJid]
            });
        }
    } catch (e) { 
        console.error(chalk.red('[ Greeting Error ]'), e); 
    }
}