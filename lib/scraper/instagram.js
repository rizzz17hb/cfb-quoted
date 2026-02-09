import axios from "axios";

const cleanIgUrl = (input) => {
    if (!input) return null;
    const match = input.match(/https?:\/\/(?:www\.)?instagram\.com\/(p|reel|reels|tv|stories)\/[^\s/?#]+\/?/i);
    return match ? match[0] : null;
};

const COMMON_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

/* =====================================================
 * IG MEDIA – FAA API (ig)
 * ===================================================== */
export async function ig(url) {
    try {
        const res = await axios.get(`https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`);
        if (!res.data?.status || !res.data?.result) return null;

        const { result } = res.data;
        return {
            source: "faa",
            urls: result.url || [],
            caption: result.metadata?.caption || "No Caption",
            username: result.metadata?.username || "Unknown",
            like: result.metadata?.like !== -1 ? result.metadata.like : "Hidden/Private",
            comment: result.metadata?.comment || 0
        };
    } catch (e) {
        console.error("Scraper Error:", e);
        return null;
    }
}

/* =====================================================
 * IG MEDIA – VDraw (igv2)
 * ===================================================== */
export async function igv2(url) {
    try {
        const res = await axios.post("https://vdraw.ai/api/v1/instagram/ins-info", 
            { url, type: "video" }, 
            {
                headers: {
                    ...COMMON_HEADERS,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = res.data?.data;
        if (!data || data.error) return null;

        return {
            source: "vdraw",
            info: data.info || []
        };
    } catch (e) {
        return null;
    }
}

/* =====================================================
 * IG AUDIO – reelsvideo.io + FAA fallback (igaudio)
 * ===================================================== */
export async function igaudio(inputUrl) {
    const url = cleanIgUrl(inputUrl);
    if (!url) return null;

    // --- PRIMARY: reelsvideo.io ---
    try {
        const processUrl = "https://reelsvideo.io/id/download-instagram-mp3";
        const { data } = await axios.post(processUrl, new URLSearchParams({ url }), {
            headers: {
                ...COMMON_HEADERS,
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": processUrl,
                "Origin": "https://reelsvideo.io",
                "Accept": "*/*"
            },
            timeout: 15000
        });

        const match = data.match(/(https?:\/\/[^"'\\s]+\.mp3(?:\?[^"'\\s]*)?)/i) || 
                      data.match(/href="([^"]+\.mp3[^"]*)"/i);

        if (match) {
            return {
                source: "reelsvideo",
                audio: match[1].replace(/&amp;/g, "&")
            };
        }
        throw new Error("SCRAPE_FAIL");
    } catch {
        // --- FALLBACK: FAA ---
        try {
            const res = await axios.get(`https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`);
            const audio = res.data?.result?.metadata?.music_url || res.data?.result?.url?.[0];

            return audio ? { source: "faa", audio } : null;
        } catch {
            return null;
        }
    }
}

/* =====================================================
 * IG AUDIO – VDraw dari video (igaudiov2)
 * ===================================================== */
export async function igaudiov2(inputUrl) {
    const url = cleanIgUrl(inputUrl);
    if (!url) return null;

    try {
        const res = await axios.post("https://vdraw.ai/api/v1/instagram/ins-info", 
            { url, type: "video" }, 
            {
                headers: {
                    ...COMMON_HEADERS,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = res.data?.data;
        if (!data || data.error) return null;

        const video = (data.info || []).find(v => v.type === "video" || v.url?.includes(".mp4"));
        return video?.url ? { source: "vdraw", audio: video.url } : null;
    } catch {
        return null;
    }
}