import fs from 'fs';
import path from 'path';
import util from 'util';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

/**
 * Helper untuk menulis log ke file secara Asynchronous (Non-Blocking)
 */
const saveToFile = (level, text) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString('id-ID');

    const cleanText = typeof text === 'object' ? util.format(text) : text;
    const fileName = path.join(logDir, `${date}.log`);
    const logContent = `[${time}] [${level.toUpperCase()}] ${cleanText}\n`;

    // Menggunakan appendFile (Async) agar engine tidak tertahan proses tulis disk
    fs.appendFile(fileName, logContent, 'utf8', (err) => {
        if (err) console.error('\x1b[31m[ LOGGER ERROR ]:\x1b[0m Gagal menulis log ke file.');
    });
};

/**
 * Castorice System - Professional Logging System
 */
export const logger = {
    info: (text) => {
        saveToFile('info', text);
    },
    success: (text) => {
        console.log(`\x1b[32m[ SUCCESS ]\x1b[0m ${text}`);
        saveToFile('success', text);
    },
    warn: (text) => {
        console.log(`\x1b[33m[ WARN ]\x1b[0m ${text}`);
        saveToFile('warn', text);
    },
    error: (text, err) => {
        const errMsg = err ? ` | ${err.message}` : '';
        console.error(`\x1b[31m[ ERROR ]\x1b[0m ${text}${errMsg}`);
        saveToFile('error', `${text}${errMsg}`);

        if (err && err.stack) {
            const stack = err.stack.split('\n').slice(1, 2).join('').trim();
            console.error(`   \x1b[2mTrace: ${stack}\x1b[0m`);
            saveToFile('error-trace', stack);
        }
    },
    system: (text) => {
        console.log(`\x1b[35m[ SYSTEM ]\x1b[0m ${text}`);
        saveToFile('system', text);
    }
};
