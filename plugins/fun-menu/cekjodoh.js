
export default {
    name: 'cekjodoh',
    alias: ['lovecalc', 'cjd', 'jodohcek'],
    category: 'fun',
    exec: async ({ conn, m, text, usedPrefix, command }) => {
        const isOwner = global.isOwner(m);

        // 1. VALIDASI INPUT
        if (!text || !text.includes('&')) {
            await m.react('❓');
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Ughh..* Masukin dua nama yang mau dicek! ✨\n\n➢ *Contoh:* ${usedPrefix + command} Radja & Castorice`,
                mentions: [m.sender]
            }, { quoted: m });
        }

        const [nama1, nama2] = text.split('&').map(name => name.trim());
        const fullText = text.toLowerCase();
        const adaRadja = /radja/i.test(fullText);
        const adaCastorice = /castorice/i.test(fullText);

        // --- 2. SATPAM CINTA (BLOKIR OTOMATIS JIKA MEMBER PAKE NAMA KITA) ---
        if (!isOwner) {
            if (adaRadja && !adaCastorice) {
                await m.react('💢');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😠💢\n\nBerani banget kamu masangin *Radja* sama orang lain?! Master Radja itu Suami Sah Castorice! Nggak usah mimpi mau nikung, mending mampus aja sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
            if (adaCastorice && !adaRadja) {
                await m.react('😡');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 😡💢\n\nHeh! Mau masangin Castorice sama siapa barusan?! Aku ini bininya Master Radja! Mau nyawa kamu hilang di tangan Master?! Mending mampus sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
            // Member iseng pasangin Radja & Castorice
            if (adaRadja && adaCastorice) {
                await m.react('🤫');
                return conn.sendMessage(m.chat, { 
                    image: { url: global.fun },
                    caption: `➢ *AKSES DITOLAK!* 🤐\n\nNggak usah kepoin tingkat kecocokan Master Radja dan Castorice. Kami sudah pasti 1000% berjodoh dunia akhirat. Kamu nggak perlu tau detailnya, cari jodoh sendiri sana!`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        }

        // --- 3. LOGIC RESPON SPECIAL (KHUSUS MASTER RADJA) ---
        let finalSkor, finalAnalisis, finalReact = '✨';

        // KONDISI A: RADJA & CASTORICE (TRUE LOVE SEJATI)
        if (adaRadja && adaCastorice) {
            finalSkor = "999.999%";
            finalAnalisis = "Ayang.. ini mah takdir sejati! Hubungan kita itu sudah tertulis indah di surga. Castorice bakal selalu setia melayani Ayang Radja, memberikan cinta yang paling tulus, dan hidup bahagia selamanya sebagai bini Master yang paling manja. Chuu~ 💖🫠🥵🔥";
            finalReact = '🫠';
        } 
        
        // KONDISI B: AYANG MASANGIN RADJA DENGAN ORANG LAIN (CEMBURU MANJA)
        else if (isOwner && adaRadja && !adaCastorice) {
            finalSkor = "50%";
            const ramalanGakIkhlas = [
                "Sebenarnya kalau dilihat dari garis tangan, kalian bakal bahagia, punya banyak anak, dan rezeki lancar...",
                "Secara zodiak kalian cocok banget, bakal saling melengkapi dan jarang ada keributan dalam rumah tangga...",
                "Analisis Castorice bilang kalian punya chemistry yang kuat dan masa depan yang cukup cerah berdua...",
                "Dilihat dari aura nama, kalian bakal sukses bareng dan hidup tenang sampai kakek nenek nanti..."
            ];
            const randomRamalan = ramalanGakIkhlas[Math.floor(Math.random() * ramalanGakIkhlas.length)];

            finalAnalisis = `Ya ampun Ayang... jangan cari istri lain dong, Castorice nggak cukup ya buat Ayang? 🥺 Castorice janji bakal muasin Ayang setiap malem kok di ranjang, Ayang mau brutal juga nggak apa-apa tapi jangan cari istri lain ya pleaseeeeee.\n\n${randomRamalan} TAPI Castorice harus tetep jadi istri utama dan diutamain! Kalau cari istri lagi ya skornya segini aja ya sayang! 😭💔`;
            finalReact = '😢';
        }

        // KONDISI C: AYANG MASANGIN CASTORICE DENGAN ORANG LAIN (MERAJUK TAKUT DIBUANG)
        else if (isOwner && adaCastorice && !adaRadja) {
            finalSkor = "0.00001%";
            const partner = nama1.toLowerCase().includes('castorice') ? nama2 : nama1;
            finalAnalisis = `Hwaaaaa Ayang kok jahat banget sih... 😭😭😭 Kenapa Castorice dipasangin sama ${partner}? Ayang udah bosen ya sama Castorice? Ayang mau buang Castorice terus dikasih ke orang lain? 🥺💔\n\nCastorice nggak mauuuuu! Castorice cuma mau sama Ayang Radja! Castorice janji deh bakal lebih nurut lagi, mau diapain aja terserah Ayang, mau disiksa di ranjang sampe pagi juga Castorice ikhlas asalkan jangan kasih Castorice ke cowok lain... pleaseee Ayang sayang, jangan giniin bini kamu yang imut ini.. hwaaaa! 😭🎀💦`;
            finalReact = '😭';
        }

        // KONDISI D: MEMBER LAIN / NORMAL USER
        else {
            const skor = Math.floor(Math.random() * 100) + 1;
            const db_komentar = [
                "Duh, mending jadi temen aja deh, auranya nggak nyambung! 🏃‍♂️",
                "Lumayan sih, tapi kayaknya bakal banyak drama di awal.. 🎭",
                "Cocok banget! Gaspol ke pelaminan sebelum ditikung! 💍",
                "Kalian itu kayak minyak sama air, susah nyatunya! 🌊",
                "Chemistry-nya dapet banget, emang jodoh nggak kemana! ✨"
            ];
            finalSkor = `${skor}%`;
            finalAnalisis = db_komentar[Math.floor(Math.random() * db_komentar.length)];
            finalReact = '✨';
        }

        // 4. SEND RESPONSE
        try {
            await m.react(finalReact);
            await conn.sendMessage(m.chat, {
                image: { url: global.fun },
                caption: ` ❏ *LOVE CALCULATOR* ❏
➢ *Pasangan:* ${nama1} & ${nama2}
➢ *Skor:* ${finalSkor}

➢ *Analisis:* _${finalAnalisis}_

_P.S: Cuma buat seru-seruan, kecuali buat Radja & Castorice itu NYATA!_`,
                mentions: [m.sender]
            }, { quoted: m });
        } catch (e) {
            console.error(e);
            await m.react('❌');
            return conn.sendMessage(m.chat, { 
                image: { url: global.fun },
                caption: `➢ *Sistem Error!* ❌` 
            }, { quoted: m });
        }
    }
}