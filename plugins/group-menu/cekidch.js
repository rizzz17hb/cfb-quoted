import axios from "axios";

export default {
    name: 'cekidch',
    alias: ['cekchannel', 'idch'],
    category: 'grup',
    isOwner: true,
    isGroup: true,
    isBotAdmin: true,

    async exec({ conn, m, text, usedPrefix, command }) {

        // ── 1. VALIDASI INPUT
        const fake = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: "status@broadcast" },
            message: { conversation: command }
        };
        const fail = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: "❌failed" }
        };

        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
            return conn.sendMessage(m.chat, {
                image: { url: global.grup },
                caption: `⚠️ *Masukkan URL Channel WhatsApp!*\n\nContoh:\n${usedPrefix + command} https://whatsapp.com/channel/xxxxx`
            }, { quoted: fail });
        }

        // ── 2. REACT PROSES
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        try {
            // ── HANDLE REDIRECT
            const res = await axios.get(text, {
                maxRedirects: 5,
                validateStatus: () => true
            });
            const finalUrl = res.request?.res?.responseUrl || text;

            // ── EXTRACT INVITE CODE
            const inviteCode = finalUrl.split('/channel/')[1];
            if (!inviteCode) throw new Error('URL channel tidak valid');

            // ── STEP 1: INVITE → ID
            const metaInvite = await conn.newsletterMetadata('invite', inviteCode);
            if (!metaInvite?.id) throw new Error('Gagal mengambil ID channel');

            // ── STEP 2: ID → METADATA ASLI
            const meta = await conn.newsletterMetadata('jid', metaInvite.id);
            if (!meta) throw new Error('Gagal mengambil metadata channel');

            // ── 6. FORMAT OUTPUT
            let caption = `╭──── ❏ I N F O  C H A N E L ❏\n`;
            caption += `│ \`\`\` Nama       : ${meta.name || '-'}\`\`\`\n`;
            caption += `│ \`\`\` Follower   : ${meta.subscribersCount?.toLocaleString() || '0'}\`\`\`\n`;
            caption += `│ \`\`\` Status     : ${meta.isVerified ? 'Verified ✅' : 'Unverified'}\`\`\`\n`;
            caption += `╰── ❏\n\n`;
            caption += `❏ L I N K ❏\n`;
            caption += `https://whatsapp.com/channel/${inviteCode}\n\n`;
            caption += `❏ I D  C H A N E L ❏\n`;
            caption += `${meta.id}`;

            // ── 7. KIRIM HASIL
            await conn.sendMessage(m.chat, {
                image: { url: global.grup },
                caption
            }, { quoted: fake });

            // ── 8. REACT SUKSES
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);

            // ── ERROR RESPONSE
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(m.chat, {
                image: { url: global.grup },
                caption: `❏ K E S A L A H A N  S Y S T E M ❏\nPastikan:\n • Link valid\n • Channel bersifat publik\n • Bot terhubung dengan normal`
            }, { quoted: fail });
        }
    }
};
