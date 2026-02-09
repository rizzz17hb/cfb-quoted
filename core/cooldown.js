const cooldowns = new Map();
let lastCleanup = Date.now();

/**
 * Cek apakah user sedang dalam masa cooldown
 * Castorice System - Smart Interval Cleanup
 */
export const isCooling = (sender, command, delay = 3000) => {
    // 1. Key Optimization
    const key = `${sender.split('@')[0]}-${command}`;
    const now = Date.now();

    // 2. Cek Masa Berlaku
    if (cooldowns.has(key)) {
        const data = cooldowns.get(key);
        // Pastikan kita cek terhadap delay yang spesifik untuk command ini
        const expirationTime = data.time + data.delay; 
        
        if (now < expirationTime) {
            return Math.ceil((expirationTime - now) / 1000); // Sisa detik
        }
    }

    // 3. Set Cooldown Baru (Simpan delay-nya juga agar cleanup akurat)
    cooldowns.set(key, { time: now, delay });

    // 4. V1 Tech: Smart Cleanup (Interval 5 Menit atau Overload Size)
    if (now - lastCleanup > 300000 || cooldowns.size > 500) {
        setImmediate(() => {
            const cleanupNow = Date.now();
            for (let [k, data] of cooldowns) {
                // Hapus hanya jika sudah benar-benar melewati delay masing-masing
                if (cleanupNow - data.time > data.delay) {
                    cooldowns.delete(k);
                }
            }
            lastCleanup = cleanupNow;
        });
    }

    return false;
};
