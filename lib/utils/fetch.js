import axios from 'axios';

// Default Headers (Bypass bot detection)
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
};

/**
 * Tarik JSON (GET/POST)
 */
export const getJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: options.method || 'GET',
            url,
            headers: { ...headers, ...options.headers },
            timeout: 15000,
            ...options
        });
        return res.data;
    } catch (err) {
        return {
            error: true,
            status: err.response?.status || 500,
            message: err.response?.data?.message || err.message
        };
    }
};

/**
 * Tarik Buffer (Gambar/Video/Audio)
 */
export const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url,
            headers: { ...headers, ...options.headers },
            responseType: 'arraybuffer',
            timeout: 60000, // 1 Menit (Pas buat download video)
            ...options
        });
        return Buffer.from(res.data);
    } catch (err) {
        console.error(`\x1b[31m[ FETCH BUFFER ERR ]\x1b[0m ${url}:`, err.message);
        return null;
    }
};

/**
 * Cek Metadata URL (Tanpa Download - Hemat Bandwidth)
 */
export const getInfo = async (url) => {
    try {
        const res = await axios({ method: 'HEAD', url, headers, timeout: 10000 });
        const size = parseInt(res.headers['content-length'] || 0);

        // Format size ke string (MB/KB)
        let formattedSize = '0 B';
        if (size > 0) {
            const i = Math.floor(Math.log(size) / Math.log(1024));
            const sizes = ['B', 'KB', 'MB', 'GB'];
            formattedSize = `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
        }

        return {
            size,
            formattedSize,
            mime: res.headers['content-type'],
            name: url.split('/').pop().split('?')[0] || 'file',
            isTooLarge: size > 100 * 1024 * 1024 // Flag jika > 100MB
        };
    } catch (err) {
        return { size: 0, formattedSize: '0 B', mime: null, name: null, isTooLarge: false };
    }
};
