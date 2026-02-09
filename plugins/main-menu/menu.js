import fs from "fs";
import path from "path";
import speed from "performance-now";
import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";
import { pathToFileURL } from "url";

// --- LOGIKA AMBIL RUNTIME ---
let getRuntime;
try {
    const formatPath = path.join(process.cwd(), 'lib', 'utils', 'format.js');
    const formatURL = pathToFileURL(formatPath).href;
    const module = await import(formatURL);
    getRuntime = module.runtime;
} catch (e) {
    getRuntime = (seconds) => {
        seconds = Number(seconds);
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    };
}

export default {
    name: "menu",
    alias: ["help", "start"],
    category: "main",
    hidden: true,
    exec: async ({ conn, m, command, usedPrefix, plugins }) => {
        const timestamp = speed();
        
        await conn.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

        const fake = {
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
            message: { conversation: command || "Menu" }
        };

        const allPlugins = plugins || global.plugins || {};
        const pluginList = (allPlugins instanceof Map ? [...allPlugins.values()] : Object.values(allPlugins))
            .filter(p => p.name && !p.hidden);

        // Metadata
        const totalFitur = pluginList.length;
        const modeBot = global.opts?.self ? "Self" : "Public";
        const isOwner = global.owner?.some(v => v.replace(/\D/g, "") === m.sender.split("@")[0]);
        const userStatus = isOwner ? "Owner" : (global.db?.data?.users?.[m.sender]?.premium ? "Premium" : "Free");

        // --- PENGATURAN LATENCY BULAT ---
        const latensiHitung = (speed() - timestamp) / 1000;
        const latency = Math.ceil(latensiHitung); 
        const greeting = (() => {
            const jam = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
            ).getHours();

            let waktu;
            if (jam >= 0 && jam < 3) waktu = "malam";
            else if (jam >= 3 && jam < 11) waktu = "pagi";
            else if (jam >= 11 && jam < 15) waktu = "siang";
            else if (jam >= 15 && jam < 18) waktu = "sore";
            else waktu = "malam";

            if (userStatus === "Owner") {
                return {
                    pagi:  "Met pagi ownerku cayang",
                    siang: "Met siang ownerku cayang",
                    sore:  "Met sore ownerku cayang",
                    malam: "Met malam ownerku cayang"
                }[waktu];
            }

            return {
                pagi:  "Selamat Pagi user",
                siang: "Selamat Siang user",
                sore:  "Selamat Sore user",
                malam: "Selamat Malam user"
            }[waktu];})();

        // Helper Hitung & Deskripsi
        const getMenuData = (categoryName, description) => {
            const query = categoryName.toLowerCase();
            const count = pluginList.filter(p => {
                const cat = (p.category || "").toLowerCase();
                if (query === "grup") return cat.includes("grup") || cat.includes("group");
                return cat === query || cat === `${query}menu`;
            }).length;
            
            const featureCount = count > 0 ? `\n[ ${count} Fitur ]` : "\n[ Maintenance ]";
            return `${description}${featureCount}`;
        };

        const sections = [
            {
                title: "🏠 DASHBOARD UTAMA",
                rows: [
                    { title: "List Menu", id: `${usedPrefix}allmenu`, description: `📑 Semua perintah bot\n[ ${totalFitur} Fitur ]` },
                    { title: "Donate", id: `${usedPrefix}donate`, description: `🧧 Support owner agar lebih semangat update script` }
                ]
            },
            {
                title: "ARTIFICIAL INTELLIGENCE",
                rows: [
                    { title: "Ai Menu", id: `${usedPrefix}aimenu`, description: getMenuData("ai", "🤖 Assistant ai cerdas yang membantu sesuai kebutuhan.") },
                    { title: "Assistant Menu", id: `${usedPrefix}assistantmenu`, description: getMenuData("assistant", "🥰 Assistant AI pribadi khusus owner tamvan") }
                ]
            },
            {
                title: "INFORMATION",
                rows: [
                    { title: "Berita Menu", id: `${usedPrefix}beritamenu`, description: getMenuData("berita", "📰 Update berita terkini dari berbagai sumber.") },
                    { title: "Store Menu", id: `${usedPrefix}storemenu`, description: getMenuData("store", "🛒 Cek harga layanan toko digital.") }
                ]
            },
            {
                title: "SOSIAL MEDIA",
                rows: [
                    { title: "Grup Menu", id: `${usedPrefix}grupmenu`, description: getMenuData("grup", "👥 Kelola grup Master dengan fitur admin lengkap.") },
                    { title: "Stalking Menu", id: `${usedPrefix}stalkingmenu`, description: getMenuData("stalking", "🕵️ Pantau profil sosial media target Master.") },
                    { title: "Anonymous Menu", id: `${usedPrefix}anonymousmenu`, description: getMenuData("anonymous", "🎭 kirim pesan rahasia atau chat anonim") }
                ]
            },
            {
                title: "DOWNLOADER",
                rows: [
                    { title: "Download Menu", id: `${usedPrefix}downloadmenu`, description: getMenuData("download", "📥 Unduh media dari berbagai platform sosial.") }
                ]
            },
            {
                title: "SEARCHING & DATA",
                rows: [
                    { title: "Search Menu", id: `${usedPrefix}searchmenu`, description: getMenuData("search", "🔍 Cari informasi apa saja di internet.") },
                    { title: "Internet Menu", id: `${usedPrefix}internetmenu`, description: getMenuData("internet", "📈 cek semua yang berhubungan dengan internet") }
                ]
            },
            {
                title: "HIBURAN & FUN",
                rows: [
                    { title: "Anime Menu", id: `${usedPrefix}animemenu`, description: getMenuData("anime", "🌌 Informasi anime dan koleksi waifu Master.") },
                    { title: "Game Menu", id: `${usedPrefix}gamemenu`, description: getMenuData("game", "🎮 Mainkan game seru untuk mengisi waktu.") },
                    { title: "Fun Menu", id: `${usedPrefix}funmenu`, description: getMenuData("fun", "🎭 Fitur hiburan dan lucu-lucuan.") },
                    { title: "Quotes Menu", id: `${usedPrefix}quotesmenu`, description: getMenuData("quotes", "📝 Kumpulan kata bijak dan motivasi harian.") },
                    { title: "Music Menu", id: `${usedPrefix}musicmenu`, description: getMenuData("music", "🎵 putar musik favorit dan lirik yang tersedia") },
                    { title: "Primbon Menu", id: `${usedPrefix}primbonmenu`, description: getMenuData("primbon", "🔮 Ramalan nasib dan primbon jawa.") },
                    { title: "RPG Menu", id: `${usedPrefix}rpgmenu`, description: getMenuData("rpg", "⚔️ mulai petualangan, grinding, dan lawan yang menantang") }
                ]
            },
            {
                title: "RELIGIOUS & SPIRITUAL",
                rows: [
                    { title: "Islamic Menu", id: `${usedPrefix}islamicmenu`, description: getMenuData("islamic", "🕋 Fitur islami, jadwal sholat, dan Al-Quran.") }
                ]
            },
            {
                title: "LIFESTYLE & EDUCATION",
                rows: [
                    { title: "Lifestyle Menu", id: `${usedPrefix}lifestylemenu`, description: getMenuData("lifestyle", "🏠 tips kesehatan, resep makanan, dan gaya hidup.") },
                    { title: "Education Menu", id: `${usedPrefix}educationmenu`, description: getMenuData("education", "🎓 belajar hal baru dengan kursus dan materi edukasi") }
                ]
            },
            {
                title: "CREATIVITY",
                rows: [
                    { title: "Sticker Menu", id: `${usedPrefix}stickermenu`, description: getMenuData("sticker", "🎨 Ubah foto atau video Master menjadi stiker.") }
                ]
            },
            {
                title: "TOOLS & CONVERTER",
                rows: [
                    { title: "Tools Menu", id: `${usedPrefix}toolsmenu`, description: getMenuData("tools", "🛠️ Alat bantu praktis untuk keseharian Master.") },
                    { title: "Other Menu", id: `${usedPrefix}othermenu`, description: getMenuData("other", "📂 Fitur pelengkap sistem bot.") }
                ]
            },
            {
                title: "SETTING SYSTEM",
                rows: [
                    { title: "Settings Menu", id: `${usedPrefix}settingsmenu`, description: getMenuData("settings", "⚙️ custom settings for system castorice assistant") }
                ]
            },
            {
                title: "HIGH ACCESS",
                rows: [
                    { title: "Owner Menu", id: `${usedPrefix}ownermenu`, description: getMenuData("owner", "👑 Fitur eksklusif khusus untuk Master.") },
                    { title: "Bug Menu", id: `${usedPrefix}bugmenu`, description: getMenuData("bug", "👾 Payload testing dan keamanan sistem.") },
                    { title: "NSFW Menu", id: `${usedPrefix}nsfwmenu`, description: getMenuData("nsfw", "🔞 Konten khusus dewasa (18+).") },
                    { title: "Premium Menu", id: `${usedPrefix}premiummenu`, description: getMenuData("premium", "💎 Fitur khusus untuk member Sultan/Premium.") }
                ]
            }
        ];

        const detail = `❏ D E S C R I P T I O N ❏ \nCastorice Assistant by Radja adalah asisten virtual berbasis Node.js (Baileys Multi-Device) 
yang dirancang untuk memberikan kemudahan akses informasi, hiburan, dan alat bantu produktivitas secara otomatis melalui WhatsApp.`
        const headerInfo = `╭── ❏ I N F O R M A T I O N ❏
│ \`\`\`➢ Bot Name  : ${global.namaBot}\`\`\`
│ \`\`\`➢ Developer : ${global.namaOwner}\`\`\`
│ \`\`\`➢ Version   : 1.0.0\`\`\`
│ \`\`\`➢ Mode      : ${modeBot}\`\`\`
│ \`\`\`➢ Uptime    : ${getRuntime(process.uptime())}\`\`\`
│ \`\`\`➢ Status    : ${userStatus}\`\`\`
│ \`\`\`➢ Fitur     : ${totalFitur} Fitur\`\`\`
│ \`\`\`➢ Speed     : ${latency} Detik\`\`\`
╰───────────────➣`;

        const bodyText = `${greeting}\nJangan lupa baca aturan penggunaannya ya...\n\n${detail}\n\n${headerInfo}\n\n🥰 Silahkan pilih kategori menu dibawah!`;

        try {
            let headerObj = { hasMediaAttachment: false };
            const videoPath = path.join(process.cwd(), "assets", "menu.mp4");

            if (fs.existsSync(videoPath)) {
                if (!global.cacheMenuVid) {
                    const media = await prepareWAMessageMedia(
                        { video: fs.readFileSync(videoPath), gifPlayback: true },
                        { upload: conn.waUploadToServer }
                    );
                    global.cacheMenuVid = media.videoMessage;
                }
                headerObj.videoMessage = global.cacheMenuVid;
                headerObj.hasMediaAttachment = true;
            }

            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: bodyText },
                            footer: { text: global.footer },
                            header: headerObj,
                            nativeFlowMessage: {
                                buttons: [
                                    { name: "single_select", buttonParamsJson: JSON.stringify({ title: "BUKA MENU", sections }) },
                                    { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "CHAT OWNER", url: global.chatowner }) },
                                    { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "INFO SCRIPT", url: global.saluran }) }
                                ]
                            }
                        }
                    }
                }
            }, { quoted: fake });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            return conn.sendMessage(m.chat, { 
                image: { url: global.url }, 
                caption: "⚠️ Gagal memuat menu." 
            }, { quoted: fake });
        }
    }
};