import axios from "axios";
import * as cheerio from "cheerio";
import FormData from "form-data";

const TIKTOK_REGEX = /(tiktok\.com|vt\.tiktok\.com|douyin\.com|v\.douyin\.com)/i;

/* =====================================================
 * TT — TIKWM (video + slide)
 * source: plugin tt
 * ===================================================== */
export async function tt(url) {
    if (!url || !TIKTOK_REGEX.test(url)) return null;

    try {
        const form = new FormData();
        form.append("url", url);
        form.append("hd", "1");

        const { data } = await axios.post("https://tikwm.com/api/", form, {
            headers: {
                ...form.getHeaders(),
                "User-Agent": "Mozilla/5.0"
            },
            timeout: 20000
        });

        if (data.code !== 0 || !data.data) return null;

        const res = data.data;

        return {
            source: "tikwm",
            video: res.hdplay || res.play || null,
            images: Array.isArray(res.images) ? res.images : [],
            audio: res.music_info?.play || res.music || null,
            raw: res
        };
    } catch (err) {
        console.error("TT Error:", err.message);
        return null;
    }
}

/* =====================================================
 * TTV2 — FAA API (video + metadata)
 * source: plugin ttv2
 * ===================================================== */
export async function ttv2(url) {
    if (!url || !TIKTOK_REGEX.test(url)) return null;

    try {
        const { data } = await axios.get(
            `https://api-faa.my.id/faa/tiktok?url=${encodeURIComponent(url)}`
        );

        if (!data?.status || !data?.result) return null;
        
        const res = data.result;

        return {
            type: res.type, // "video" atau "image"
            title: res.title,
            video: res.type === "video" ? res.data : null,
            images: res.type === "image" ? res.data : [],
            audio: res.music_info?.url || null,
            author: res.author?.nickname || res.author?.fullname || 'Unknown',
            raw: res // Kita simpan full data untuk cadangan di plugin
        };
    } catch (err) {
        console.error("TTV2 API Error:", err.message);
        return null;
    }
}
/* =====================================================
 * TTV3  (video + metadata)
 * source: plugin ttv3 non image /ttaudiov2
 * ===================================================== */

export async function ttv3(url) {
    if (!url || !TIKTOK_REGEX.test(url)) return null;

    try {
        const { data: html } = await axios.post('https://ttsave.app/download', {
            language_id: '1',
            query: url
        }, {
            headers: {
                'origin': 'https://ttsave.app',
                'referer': 'https://ttsave.app/en',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);
        const $div = $('div.flex');
        
        // Ekstraksi data persis seperti logika yang kamu kasih
        const nickname = $div.find('h2').text().trim();
        const username = $div.find('a.font-extrabold').text().trim();
        const avatar = $div.find('a > img').attr('src');
        const description = $div.find('p').text().trim();
        const $span = $div.find('div.flex > div.flex > span');
        
        const $a = $('#button-download-ready > a');

        return {
            source: "ttsave",
            nickname,
            username,
            avatar,
            description,
            stats: {
                played: $span.eq(0).text().trim(),
                commented: $span.eq(1).text().trim(),
                saved: $span.eq(2).text().trim(),
                shared: $span.eq(3).text().trim(),
            },
            song: $div.find('div.flex > span').eq(4).text().trim(),
            video: $a.eq(0).attr('href'), // No Watermark
            video_wm: $a.eq(1).attr('href'), // With Watermark
            audio: $a.eq(2).attr('href'),
            thumbnail: $a.eq(4).attr('href')
        };
    } catch (err) {
        console.error("TTV3 (TTSave) Error:", err.message);
        return null;
    }
}

/* =====================================================
 * TTAUDIO — TIKWM AUDIO ONLY
 * source: plugin ttaudio
 * ===================================================== */
export async function ttaudio(url) {
    if (!url || !TIKTOK_REGEX.test(url)) return null;

    try {
        const form = new FormData();
        form.append("url", url);
        form.append("hd", "1");

        const { data } = await axios.post("https://tikwm.com/api/", form, {
            headers: {
                ...form.getHeaders(),
                "User-Agent": "Mozilla/5.0"
            },
            timeout: 20000
        });

        if (data.code !== 0 || !data.data) return null;

        const res = data.data;
        const audioUrl = res.music_info?.play || res.music;
        if (!audioUrl) return null;

        return {
            source: "tikwm",
            audio: audioUrl,
            raw: res
        };
    } catch (err) {
        console.error("TTAUDIO Error:", err.message);
        return null;
    }
}
