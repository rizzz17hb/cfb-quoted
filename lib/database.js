import fs from 'fs';
import path from 'path';
import util from 'util';
import { logger } from '../core/logger.js';

export const loadDatabase = () => {
    const folderPath = path.join(process.cwd(), 'data');
    const dbPath = path.join(folderPath, 'database.json');

    const defaultData = {
        users: {},
        chats: {},
        groups: {}, 
        stats: {
            totalCommand: 0,
            uptime: Date.now()
        },
        settings: {
            self: false,
            pconly: false,
            gconly: false,
            antispam: true,
            maintenance: false,
            greeting: true,
            leveling: true // Properti baru
        },
        logs: []
    };

    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    if (fs.existsSync(dbPath)) {
        try {
            const rawData = fs.readFileSync(dbPath, 'utf-8');
            const parsed = JSON.parse(rawData);

            // 1. Jalankan Deep Merge
            global.db = mergeDeep(defaultData, parsed);

            // 2. FORCE INJECTION (Agar properti baru di 'settings' wajib masuk)
            for (let key in defaultData.settings) {
                if (!(key in global.db.settings)) {
                    global.db.settings[key] = defaultData.settings[key];
                    logger.system(`New setting detected: ${key}. Applied default value.`);
                }
            }
            
        } catch (e) {
            logger.error(`Database rusak! Membuat backup...`, e);
            fs.renameSync(dbPath, `${dbPath}.corrupt_${Date.now()}`);
            global.db = defaultData;
        }
    } else {
        global.db = defaultData;
        saveDatabase(dbPath);
        logger.system(`Database baru diinisialisasi.`);
    }

    let lastHash = JSON.stringify(global.db);
    setInterval(() => {
        try {
            const currentHash = JSON.stringify(global.db);
            if (currentHash !== lastHash) {
                saveDatabase(dbPath);
                lastHash = currentHash;
            }
        } catch (e) {
            logger.error('Auto-save failed:', e);
        }
    }, 30000);

    global.saveDb = () => saveDatabase(dbPath);
};

function saveDatabase(dbPath) {
    try {
        if (!global.db) return;
        const data = JSON.stringify(global.db, null, 2);
        const tempPath = dbPath + '.tmp';
        fs.writeFileSync(tempPath, data);
        fs.renameSync(tempPath, dbPath);
    } catch (e) {
        logger.error(`Gagal menyimpan database!`, e);
    }
}

function mergeDeep(target, source) {
    const isObject = (obj) => obj && typeof obj === 'object';
    if (!isObject(target) || !isObject(source)) return source;

    Object.keys(source).forEach(key => {
        const targetValue = target[key];
        const sourceValue = source[key];

        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            target[key] = sourceValue;
        } else if (isObject(targetValue) && isObject(sourceValue)) {
            target[key] = mergeDeep({ ...targetValue }, sourceValue);
        } else {
            target[key] = sourceValue;
        }
    });
    return target;
}