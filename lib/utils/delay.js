/**
 * Utility Delay - Castorice System
 * Menjaga bot tetap aman dari banned dengan simulasi jeda manusia
 */

/**
 * Delay standar berbasis Promise
 * @param {number} ms - Milidetik
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Delay dengan rentang waktu acak
 * @param {number} min - Minimal milidetik
 * @param {number} max - Maksimal milidetik
 */
export const randomDelay = (min, max) => {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return delay(ms);
};

/**
 * Simulasi jeda berpikir (Thinking Jitter)
 * Memberikan jeda singkat 500ms - 1500ms
 */
export const jitter = () => randomDelay(500, 1500);

/**
 * Simulasi Mengetik Otomatis (Typing...)
 * @param {object} conn - Socket connection
 * @param {string} jid - Target JID
 * @param {number} ms - Durasi mengetik (opsional)
 */
export const simulateTyping = async (conn, jid, ms = 0) => {
    // Jika ms tidak ditentukan, kasih random antara 1.5s - 3s
    const duration = ms > 0 ? ms : Math.floor(Math.random() * 1500) + 1500;
    
    await conn.sendPresenceUpdate('composing', jid);
    await delay(duration);
    await conn.sendPresenceUpdate('paused', jid);
};

/**
 * Simulasi Merekam Audio (Recording...)
 * @param {object} conn - Socket connection
 * @param {string} jid - Target JID
 * @param {number} ms - Durasi merekam
 */
export const simulateRecording = async (conn, jid, ms = 3000) => {
    await conn.sendPresenceUpdate('recording', jid);
    await delay(ms);
    await conn.sendPresenceUpdate('paused', jid);
};
