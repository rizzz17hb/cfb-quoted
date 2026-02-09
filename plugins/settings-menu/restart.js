import fs from 'fs';
import path from 'path';

export default {
    name: 'restart',
    alias: ['reset', 'reboot'],
    category: 'settings',
    isOwner: true,
    // isOwner: true, // Kadang plugin system lo gak detect ini, kita handle manual aja di bawah
    exec: async ({ conn, m, isOwner }) => {
        // --- CEK APAKAH BENERAN OWNER ---
        // Jika isOwner dari parameter gak jalan, kita cek manual ke nomor lo
        const ownerNomor = ['6285169432892', '6283146092848']; // Ganti dengan nomor lo tanpa @s.whatsapp.net
        const siapaDia = m.sender.split('@')[0];
        
        if (!isOwner && !ownerNomor.includes(siapaDia)) {
            return conn.sendMessage(m.chat, { 
                image: imageBuffer,
                caption: `❌ *Akses Ditolak!*\nFitur ini hanya untuk Radja Iblis (Owner).` 
            }, { quoted: m });
        }

        // --- LANJUT KODINGAN RESTART ---
        await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        const getOwnerImage = () => {
            try {
                const assetsPath = path.join(process.cwd(), 'assets');
                const files = fs.readdirSync(assetsPath).filter(f =>
                    /^(owner1|owner2|owner3)\.(jpe?g|png)$/i.test(f)
                );
                if (files.length === 0) return null;
                const randomFile = files[Math.floor(Math.random() * files.length)];
                return fs.readFileSync(path.join(assetsPath, randomFile));
            } catch (e) { return null; }
        };

        const imageBuffer = getOwnerImage();
        const caption = `🔄 *C A S T O R I C E  R E B O O T*\n\n` +
                        `Sistem sedang dimuat ulang oleh Administrator.\n` +
                        `• *Status:* Cleaning Session & Database...\n` +
                        `• *Estimasi:* 5-10 Detik Online Kembali.\n\n` +
                        `_Castorice Assistant akan segera kembali._`;

        try {
            if (imageBuffer) {
                await conn.sendMessage(m.chat, { image: imageBuffer, caption: caption }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
            }

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            if (global.db && global.saveDb) await global.saveDb();

            console.log('[ SYSTEM ] Rebooting...');
            
            // Beri jeda 3 detik biar gak corrupt
            setTimeout(() => {
                // Bersihkan session sebelum exit
                const sessionPath = './session'; 
                if (fs.existsSync(sessionPath)) {
                    fs.readdirSync(sessionPath).forEach(file => {
                        if (file !== 'creds.json') {
                            try { fs.unlinkSync(path.join(sessionPath, file)); } catch (e) {}
                        }
                    });
                }
                process.exit();
            }, 3000);

        } catch (e) {
            console.error("[ RESTART ERROR ]:", e);
            process.exit();
        }
    }
}
