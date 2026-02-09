/**
 * Plugin Generator Template
 * Castorice System - Clean Structure
 */

export default {
    name: 'template',
    alias: ['tp', 'template_plugin', 'gettemplate'],
    category: 'owner',
    isOwner: true,
    exec: async ({ conn, m, usedPrefix, command }) => {
        // --- START REACT DOCUMENT ---
        await conn.sendMessage(m.chat, { react: { text: '📄', key: m.key } });

        const templateCode = `export default {
    name: 'nama_fitur',
    alias: [],
    category: 'main',
    limit: true,
    isGroup: false,
    isAdmin: false,
    isOwner: false,
    exec: async ({ conn, m, args, text, usedPrefix, command }) => {
        try {
            // 1. Validasi input (Contoh)
            // if (!text) return m.reply(\`💡 *FORMAT SALAH*\\nContoh: \${usedPrefix + command} hello\`);

            // 2. React Proses
            // await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

            // 3. Logika Utama
            let response = 'Fitur Radja Engine Berhasil Dijalankan!';

            // 4. Kirim Respon
            m.reply(response);

        } catch (e) {
            console.error(e);
            m.reply('❌ *SYSTEM ERROR:* ' + e.message);
        }
    }
};`;

        let caption = `📄 *RADJA ENGINE TEMPLATE*\n\n` +
                      `Silahkan salin kode di bawah ini untuk membuat plugin baru. Pastikan simpan di folder kategori yang sesuai.\n\n` +
                      `─────────────────────────\n` +
                      `💡 *TIPS:* Gunakan command \`${usedPrefix}addplugin\` untuk memasang file ini secara otomatis.`;

        await m.reply(caption);

        // Bungkus pake triple backtick biar bisa di-copy satu klik di WA
        await m.reply("```javascript\n" + templateCode + "\n```");

        // --- FINISH REACT SUCCESS ---
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
};
