/**
 * Sistem Ekonomi Castorice System
 * Nama File: limit.js
 */

// Safety Net: Mastiin data user gak undefined & Cek masa berlaku premium
export const verifyUser = (jid, name = 'User') => {
    if (!global.db.users[jid]) {
        global.db.users[jid] = {
            name: name,
            limit: 20,
            pluginLimit: 0, 
            premium: false,
            premiumTime: 0,
            lastSeen: Date.now(),
            totalChat: 0,
            banned: false
        };
    }

    const user = global.db.users[jid];

    // --- AUTO EXPIRED CHECKER ---
    // Jika user premium dan punya batas waktu, cek apakah sudah lewat waktunya
    if (user.premium && user.premiumTime > 0 && Date.now() >= user.premiumTime) {
        user.premium = false;
        user.premiumTime = 0;
        user.limit = 20;
        user.pluginLimit = 0;
        console.log(`\x1b[33m[ SYSTEM ] Premium Expired: ${jid}\x1b[0m`);
    }

    return user;
};

/**
 * Cek apakah limit user habis
 * @returns {boolean}
 */
export const isLimit = (m, amount = 1) => {
    const user = verifyUser(m.sender, m.pushName);
    if (m.isOwner || m.fromMe || user.premium) return false;
    return user.limit < amount;
};

/**
 * Kurangi limit user (panggil pas fitur sukses)
 */
export const consumeLimit = (jid, amount = 1) => {
    const user = verifyUser(jid);
    if (user.premium) return;
    user.limit = Math.max(0, user.limit - amount);
};

/**
 * Tambah/Kurangi limit (Khusus Admin/Owner)
 */
export const addLimit = (jid, amount) => {
    const user = verifyUser(jid);
    const val = parseInt(amount) || 0;

    if (user.premium) {
        user.limit = 999999;
    } else {
        user.limit = Math.max(0, user.limit + val);
    }
    return user.limit;
};

/**
 * Atur status Premium & Waktunya
 */
export const setPremium = (jid, status = true, days = 0) => {
    const user = verifyUser(jid);
    user.premium = status;

    if (status) {
        // days * 24 jam * 60 mnt * 60 dtk * 1000 ms
        user.premiumTime = days > 0 ? Date.now() + (days * 86400000) : 0;
        user.limit = 999999;
        user.pluginLimit = 5; 
    } else {
        user.premiumTime = 0;
        user.limit = 20;
        user.pluginLimit = 0; 
    }
    return user;
};
