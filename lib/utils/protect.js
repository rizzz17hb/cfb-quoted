export const validateAccess = (category, isOwner, isPremium = false) => {
    const cat = category.toLowerCase();

    // 1. DAFTAR KHUSUS OWNER (Owner Only)
    // Hapus 'ai' dari sini kalau mau orang lain bisa buka
    const ownerOnly = ['owner', 'settings', 'ai', 'assistant-owner']; 
    if (ownerOnly.includes(cat)) {
        return { 
            allowed: isOwner, 
            msg: "Akses Ditolak! Kategori ini bersifat rahasia dan hanya dapat diakses oleh Master Radja." 
        };
    }

    // 2. DAFTAR KHUSUS PREMIUM (Owner tetep bisa akses)
    const premiumOnly = ['nsfw', 'premium'];
    if (premiumOnly.includes(cat)) {
        return { 
            allowed: isOwner || isPremium, 
            msg: "Fitur ini khusus untuk User Premium. Silakan hubungi Owner untuk upgrade status!" 
        };
    }

    // 3. KATEGORI UMUM (AI, Download, dll otomatis ke sini)
    return { allowed: true };
};

export default { validateAccess };
