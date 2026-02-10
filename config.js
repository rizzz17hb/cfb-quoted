import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import 'dotenv/config'; // Tambahan wajib untuk baca .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= [ IDENTITAS BOT ] =================
global.pairing = true;
global.pairingNumber = "6283146092848"; 
global.pairingKode = "C4STADJ4";

// Nomor Owner
global.owner = [
  "6283146092848", // Castorice (Bot)
  "6285169432892", // Radja Iblis (Main)
  "40674011381811"  // ID Master di Private Chat (Daftar Putih)
];

global.namaOwner = "Radja Iblis";
global.namaBot = "Castorice Assistant";
global.chatowner = "https://wa.me/6285169432892"
global.saluran = "https://whatsapp.com/channel/0029Vb6hwcUBA1f6rtoBaB2x" // Tambahan agar menu.js tidak error
global.prefix = /^[./!#]/;

// ================= [ PENGATURAN API KEYS ] =================
global.api = {
    castorice: process.env.CASTORICE_KEY,
    gpt: process.env.GPT_KEY,
    groq: process.env.GROQ_KEY,
    meta: process.env.META_KEY,
    qwen: process.env.QWEN_KEY,
    tanyaai: process.env.TANYAAI_KEY,
    zai: process.env.ZAI_KEY,
    convert: process.env.CONVERT_KEY
};

// ================= [ FUNGSI DETEKSI OWNER ] =================
global.isOwner = (m) => {
    if (!m.sender) return false;
    const number = m.sender.replace(/[^0-9]/g, '');
    return global.owner.includes(number) || m.fromMe;
};

// ================= [ PENGATURAN SISTEM ] =================
global.opts = {
    self: false,
    autoread: false,
    pconly: false,
    gconly: false,
    autotyping: true,
    autoreactstatus: true
};

global.limitDefault = 20;

// ================= [ PESAN SISTEM ] =================
global.mess = {
    owner: '❌ *AKSES DITOLAK:* Fitur ini khusus Owner Radja!',
    admin: '❌ *ADMIN ONLY:* Fitur ini hanya untuk Admin Grup!',
    botAdmin: '❌ *ERROR:* Castorice harus menjadi Admin!',
    group: '❌ *GRUP ONLY:* Fitur ini hanya untuk penggunaan di Grup!',
    premium: '❌ *UPGRADE PREMIUM:* Fitur ini khusus user Premium!',
    wait: '⏱️ Sedang diproses, mohon tunggu...',
    error: '❌ Terjadi kesalahan pada sistem!',
    done: '✅ Berhasil!'
};

// ================= [ FUNGSI AUTO-SCAN ASSETS ] =================
const getAsset = (fileName) => {
    const assetsDir = path.join(process.cwd(), 'assets');
    const exts = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG']; 
    
    for (let ext of exts) {
        const fullPath = path.join(assetsDir, `${fileName}.${ext}`);
        if (fs.existsSync(fullPath)) return fullPath;
    }
    return ''; 
};

// ================= [ SALURAN & MEDIA ] =================
global.idChannel = "120363421216268618@newsletter";
global.password = 'RADJA'

global.url       = getAsset('thumbnail');
global.fake      = getAsset('fake');
global.sosmed    = getAsset('sosmed');
global.download  = getAsset('download');
global.tools     = getAsset('tools');
global.nsfw      = getAsset('nsfw');
global.premium   = getAsset('premium');
global.stalking  = getAsset('stalking');
global.sticker   = getAsset('sticker');
global.search    = getAsset('search');
global.anime     = getAsset('anime');
global.grup      = getAsset('grup');
global.quotes    = getAsset('quotes');
global.fun       = getAsset('fun');
global.allmenu   = getAsset('allmenu');
global.assistant = getAsset('assistant');
global.doc       = getAsset('doc');
global.ai        = getAsset('ai');
global.ownerImages = [
    path.join(process.cwd(), 'assets', 'owner1.jpg'),
    path.join(process.cwd(), 'assets', 'owner2.jpg'),
    path.join(process.cwd(), 'assets', 'owner3.jpg')
];


global.foto = global.url;
global.footer = `© 2026 ${global.namaBot} By ${global.namaOwner}`;

// ================= [ AUTO RELOAD ] =================
let file = fileURLToPath(import.meta.url);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(`\x1b[33m\n[ UPDATE ] config.js has been modified! Reloading...\x1b[0m`);
    import(pathToFileURL(file).href + `?update=${Date.now()}`);
});

export default global;