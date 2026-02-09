export default {
    name: 'asupanvideo',
    alias: ['asupan', 'avid'],
    category: 'nsfw',
    isPremium: true,
    exec: async ({ conn, m }) => {
        try {
            await m.react('⏱️');

            // 1. Pilih Video Acak
            const videoUrl = asupan[Math.floor(asupan.length * Math.random())];

            // 2. Kirim Video dengan Caption Mewah
            await conn.sendMessage(m.chat, {
                video: { url: videoUrl },
                caption: `✨ *RADJA PREMIUM ASUPAN* ✨\n` +
                         `──────────────────────────\n` +
                         `👑 *Type:* Random Video\n` +
                         `🌀 *Status:* High Quality Stream\n` +
                         `💎 *Access:* Premium Member\n` +
                         `──────────────────────────\n` +
                         `_Enjoy your premium content, Kak!_`,
                mimetype: 'video/mp4'
            }, { quoted: m });

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            
            // --- ERROR HANDLING MEWAH (Kirim Gambar Banner + Teks Error) ---
            await conn.sendMessage(m.chat, {
                image: { url: global.nsfw },
                caption: `❌ *PREMIUM SYSTEM ERROR*\n\n` +
                         `Mohon maaf Kak, terjadi kesalahan saat memuat video asupan. Link mungkin telah kedaluwarsa atau server sedang sibuk.\n\n` +
                         `📝 *Log:* \`Link Timeout / 404\``
            }, { quoted: m });
        }
    }
};

const asupan = [
    "https://b.top4top.io/m_1931yxodg0.mp4",
    "https://k.top4top.io/m_193161p380.mp4",
    "https://l.top4top.io/m_1931i4g3p1.mp4",
    "https://a.top4top.io/m_1931tjlio2.mp4",
    "https://g.top4top.io/m_1931z2mc40.mp4",
    "https://h.top4top.io/m_1931auyof1.mp4",
    "https://i.top4top.io/m_19315hrle2.mp4",
    "https://j.top4top.io/m_1931xul5a3.mp4",
    "https://l.top4top.io/m_1931o92nr0.mp4",
    "https://a.top4top.io/m_1931j1rh21.mp4",
    "https://b.top4top.io/m_1931iaqpg2.mp4",
    "https://c.top4top.io/m_1931s5zlj3.mp4",
    "https://d.top4top.io/m_1931x0g5a4.mp4",
    "https://i.top4top.io/m_1931oj76n0.mp4",
    "https://j.top4top.io/m_19319gl3d1.mp4",
    "https://k.top4top.io/m_1931u52cq2.mp4",
    "https://l.top4top.io/m_1931mvgj73.mp4",
    "https://a.top4top.io/m_1931u07oz4.mp4",
    "https://j.top4top.io/m_1931h1fo60.mp4",
    "https://k.top4top.io/m_1931mro3u1.mp4",
    "https://l.top4top.io/m_1931kx0ac2.mp4",
    "https://a.top4top.io/m_1931g9ezq3.mp4",
    "https://b.top4top.io/m_1931plin14.mp4",
    "https://c.top4top.io/m_1931aaxri5.mp4",
    "https://d.top4top.io/m_1931ijzzn6.mp4",
    "https://e.top4top.io/m_1931ugycd7.mp4",
    "https://f.top4top.io/m_1931l14nk8.mp4",
    "https://g.top4top.io/m_1931crgqt9.mp4",
    "https://l.top4top.io/m_1931ufrul0.mp4",
    "https://a.top4top.io/m_1931jbdpk1.mp4",
    "https://c.top4top.io/m_1931aj9nm2.mp4",
    "https://d.top4top.io/m_1931cnsal3.mp4",
    "https://e.top4top.io/m_1931d4kc74.mp4",
    "https://f.top4top.io/m_1931bih8q5.mp4",
    "https://g.top4top.io/m_1931xx7aa6.mp4",
    "https://h.top4top.io/m_1931g3zsq7.mp4",
    "https://a.top4top.io/m_1931m74wd0.mp4",
    "https://b.top4top.io/m_1931p8tfm1.mp4",
    "https://e.top4top.io/m_1931aj8iv0.mp4",
    "https://f.top4top.io/m_1931szguy1.mp4",
    "https://g.top4top.io/m_1931l73ry2.mp4",
    "https://h.top4top.io/m_1931yhznj3.mp4",
    "https://i.top4top.io/m_1931kmtp34.mp4",
    "https://j.top4top.io/m_1931snhdg5.mp4",
    "https://k.top4top.io/m_1931ay1jz6.mp4",
    "https://l.top4top.io/m_1931x70mk7.mp4",
    "https://a.top4top.io/m_19319mvvf8.mp4",
    "https://b.top4top.io/m_1931icmzd9.mp4",
    "https://h.top4top.io/m_19316oo0s0.mp4",
    "https://i.top4top.io/m_1931cvvpt1.mp4",
    "https://e.top4top.io/m_1930ns2zo0.mp4",
    "https://k.top4top.io/m_1930j9i810.mp4",
    "https://f.top4top.io/m_1930wtj580.mp4",
    "https://d.top4top.io/m_1930a2isv0.mp4",
    "https://e.top4top.io/m_1930wbgc41.mp4",
    "https://f.top4top.io/m_1930urbj02.mp4",
    "https://b.top4top.io/m_1930ceiqv0.mp4",
    "https://i.top4top.io/m_1931a0z6o0.mp4",
    "https://a.top4top.io/m_193190b500.mp4",
    "https://b.top4top.io/m_1931dcixz1.mp4",
    "https://g.top4top.io/m_19317gpjp0.mp4",
    "https://i.top4top.io/m_1931cc22w1.mp4",
    "https://j.top4top.io/m_1931xn6412.mp4",
    "https://g.top4top.io/m_1931silxz0.mp4",
    "https://h.top4top.io/m_1931as4mg1.mp4",
    "https://i.top4top.io/m_1931p9j5v0.mp4",
    "https://e.top4top.io/m_1931mgeuy0.mp4",
    "https://f.top4top.io/m_1931lw9381.mp4",
    "https://g.top4top.io/m_1931vm0dk2.mp4",
    "https://h.top4top.io/m_1931fiv8x3.mp4",
    "https://b.top4top.io/m_1931jm3dt0.mp4",
    "https://e.top4top.io/m_1931i7yag1.mp4",
    "https://f.top4top.io/m_1931dr5ya2.mp4",
    "https://g.top4top.io/m_193172kpg3.mp4",
    "https://h.top4top.io/m_1931j3b224.mp4",
    "https://j.top4top.io/m_19317ykt25.mp4",
    "https://k.top4top.io/m_1931o0vh16.mp4",
    "https://l.top4top.io/m_1931ssfbn7.mp4",
    "https://a.top4top.io/m_19318t7458.mp4",
    "https://b.top4top.io/m_1931vhu759.mp4",
    "https://e.top4top.io/m_1930wespy0.mp4",
    "https://e.top4top.io/m_19303zfi20.mp4",
    "https://j.top4top.io/m_1930t00kx0.mp4",
    "https://e.top4top.io/m_1930kx7hi0.mp4",
    "https://c.top4top.io/m_19307g6kd0.mp4",
    "https://f.top4top.io/m_19306yk4c0.mp4",
    "https://i.top4top.io/m_1930y1u780.mp4",
    "https://j.top4top.io/m_1930ilsyy0.mp4",
    "https://i.top4top.io/m_19301948b0.mp4",
    "https://d.top4top.io/m_1930zg8460.mp4",
    "https://i.top4top.io/m_19301yozl0.mp4",
    "https://g.top4top.io/m_1930qjr2q0.mp4",
    "https://l.top4top.io/m_1930x1wp50.mp4",
    "https://a.top4top.io/m_1930zr1041.mp4"
];
