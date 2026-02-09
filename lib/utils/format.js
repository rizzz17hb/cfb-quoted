/**
 * Utility Format - Castorice System
 * Tempat ngerapihin teks, angka, dan waktu
 */

// 1. Format Ukuran File (B, KB, MB, GB)
export const formatSize = (bytes) => {
    if (isNaN(bytes) || bytes < 0) return "0 bytes";
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes > 1) return bytes + " bytes";
    if (bytes == 1) return bytes + " byte";
    return "0 bytes";
};

// 2. Format Waktu Jalan (Uptime)
export const runtime = (seconds) => {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay = d > 0 ? d + "d " : "";
    const hDisplay = h > 0 ? h + "h " : "";
    const mDisplay = m > 0 ? m + "m " : "";
    const sDisplay = s > 0 ? s + "s" : (d == 0 && h == 0 && m == 0 ? "0s" : "");
    return (dDisplay + hDisplay + mDisplay + sDisplay).trim();
};

// 3. Format Ribuan (Titik) - Contoh: 1.000.000
export const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// 4. Format Angka Ringkas (1K, 1M)
export const compactNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
};

// 5. Format Huruf Kapital Depan (Proper Case)
export const capitalize = (str) => {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// 6. Hitung Mundur (Countdown Premium / Fitur)
export const msToDate = (ms) => {
    if (!ms || ms <= 0) return 'Expired';
    const temp = Date.now();
    const distance = ms - temp;

    if (distance <= 0) return 'Expired';

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (days > 0) return `${days} Hari ${hours} Jam`;
    if (hours > 0) return `${hours} Jam ${minutes} Menit`;
    if (minutes > 0) return `${minutes} Menit ${seconds} Detik`;
    return `${seconds} Detik`;
};
