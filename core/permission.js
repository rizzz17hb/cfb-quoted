const adminCache = new Map();
const fake = {
    key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
    message: { conversation: "🛡️permission system" }
}

export const checkPermission = async (m, plugin, conn) => {
    // 0. Mode Self (Khusus Owner)
    if (global.opts?.['self'] && !m.isOwner && !m.fromMe) return false;

    // Pastikan database user ada
    const user = global.db.users[m.sender];
    if (!user && !m.isOwner) return false;

    // --- LOGIKA DETEKSI ADMIN GRUP (CACHE OPTIMIZED) ---
    if (m.isGroup && (plugin.isAdmin || plugin.isBotAdmin)) {
        try {
            const now = Date.now();
            const cached = adminCache.get(m.chat);
            const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

            if (cached && (now - cached.time < 60000)) {
                m.isAdmin = cached.admins.includes(m.sender);
                m.isBotAdmin = cached.admins.includes(botId);
            } else {
                const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null);
                if (groupMetadata) {
                    const participants = groupMetadata.participants || [];
                    const admins = participants
                        .filter(v => v.admin !== null)
                        .map(v => v.id);

                    m.isAdmin = admins.includes(m.sender);
                    m.isBotAdmin = admins.includes(botId);

                    adminCache.set(m.chat, { admins, time: now });
                }
            }
        } catch (e) {
            console.error(`\x1b[31m[ PERMISSION ERROR ]:\x1b[0m`, e.message);
        }
    }

    // --- VALIDASI PERIZINAN (UX OPTIMIZED) ---

    // 1. Owner Only
    if (plugin.isOwner && !m.isOwner) {
        await conn.sendMessage(m.chat, {
                image: { url: global.url },
                caption: `⚠️ *AKSES DITOLAK:* Fitur ini hanya untuk Owner bot.`
            }, { quoted: fake });
        return false;
    }

    // 2. Group Only
    if (plugin.isGroup && !m.isGroup) {
        await conn.sendMessage(m.chat, {
                image: { url: global.url },
                caption: `⚠️ *CHAT GRUP:* Fitur ini hanya dapat digunakan di dalam grup.`
            }, { quoted: fake });
        return false;
    }

    // 3. Admin Only (Owner Bypass)
    if (plugin.isAdmin && !m.isAdmin && !m.isOwner) {
        await conn.sendMessage(m.chat, {
                image: { url: global.url },
                caption: `⚠️ *ADMIN ONLY:* Perintah ini khusus untuk Admin grup.`
            }, { quoted: fake });
        return false;
    }

    // 4. Bot Admin Only
    if (plugin.isBotAdmin && !m.isBotAdmin) {
        await conn.sendMessage(m.chat, {
                image: { url: global.url },
                caption: `⚠️ *BOT BUKAN ADMIN:* Jadikan bot sebagai Admin agar fitur ini berfungsi.`
            }, { quoted: fake });
        return false;
    }

    // 5. Premium Only (Owner Bypass)
    if (plugin.isPremium && !user?.premium && !m.isOwner) {
        await conn.sendMessage(m.chat, {
                image: { url: global.url },
                caption: `⚠️ *PREMIUM ONLY:* Member premium saja yang bisa akses. Ketik .owner untuk beli.`
            }, { quoted: fake });
        return false;
    }

    // 6. Limit Check
    if (plugin.limit && !m.isOwner && !user?.premium) {
        if (user.limit <= 0) {
            await conn.sendMessage(m.chat, {
                image: { url: global.url },
                caption: `❌ *LIMIT HABIS:* Limit harian kamu habis. Tunggu jam 00:00 atau beli Premium.`
            }, { quoted: fake });
            return false;
        }
    }

    // 7. NSFW Check
    if (plugin.isNSFW && m.isGroup) {
        const chat = global.db.chats[m.chat];
        if (!chat?.nsfw) {
            await conn.sendMessage(m.chat, {
                image: { url: global.url },
                caption: `🔞 *NSFW ALERT:* Fitur dewasa (NSFW) dinonaktifkan di grup ini.`
            }, { quoted: fake });
            return false;
        }
    }

    return true;
};
