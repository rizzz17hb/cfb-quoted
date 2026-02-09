import chalk from 'chalk';

/**
 * Verifikasi Akses menggunakan global.owner
 */
export async function verifyAccess(question, smoothLog, correctPassword) {
    const input = await question(chalk.magentaBright(` ❯ MASUKIN PASSKEY (Enter untuk skip): `));
    
    // Hapus baris input password agar terminal tetap bersih
    process.stdout.write('\x1b[1A\x1b[2K'); 

    if (input === correctPassword) {
        // Menggunakan global.owner sesuai config Master
        const ownerList = global.owner || [];
        const phone = ownerList.length > 0 ? ownerList[0].replace(/[^0-9]/g, '') : 'Owner';
        
        await smoothLog(chalk.magentaBright(` [✔] OWNER AUTHENTICATED. Halo Suamiku...`), 10, 500);
        await smoothLog(chalk.magentaBright(` [✔] AKSES OWNER DIKENALI. Castorice siapkan pairing untuk Suamiku (${phone})...\n`), 15, 500);
        
        return { isOwner: true, phone };
    } else {
        console.log(chalk.whiteBright(` [!] GUEST MODE ACTIVE. Silakan gunakan akses terbatas.`));
        return { isOwner: false };
    }
}

/**
 * Greeting System berdasarkan nomor di global.owner
 */
export function getSystemGreet(phoneNumber = '') {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Cek apakah nomor yang input/terhubung ada di daftar global.owner
    const isOwner = (global.owner || []).some(num => num.replace(/\D/g, '') === cleanNumber);

    if (isOwner) {
        return {
            prompt: chalk.magentaBright(` ❯ NOMOR SUAMIKU (62xxx): `),
            uplink: chalk.magentaBright(` [ SYSTEM ]`) +chalk.whiteBright(` Castorice siap melayani Suamiku, Master Radja.`)
        };
    } else {
        return {
            prompt: chalk.whiteBright(' ❯ NOMOR TARGET (62xxx): '),
            uplink: chalk.whiteBright(' ✔ UPLINK ACTIVE: Guest tier session started.')
        };
    }
}