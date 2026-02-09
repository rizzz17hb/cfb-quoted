import chalk from 'chalk';

/**
 * Radja Engine Logger - Full Integrated Version
 * Fixed: Ultimate Owner Recognition
 */
export const logger = async (conn, ctx) => {
    // --- [ 🛠️ UTILS ] ---
    const runtime = (seconds) => {
        seconds = Number(seconds);
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    };

    const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + ' MB';
    
    // --- [ 🔐 MASTER RECOGNITION ] ---
    const senderNumber = ctx.sender.split('@')[0];
    const masterNumber = "6285169432892"; // Nomor Abadi Master Radja
    const ownerList = (global.owner || []).map(num => num.replace(/\D/g, ''));
    
    // Cek apakah sender adalah Master (by Number atau by Global List)
    const isOwner = senderNumber === masterNumber || ownerList.includes(senderNumber);
    const isPremium = global.db?.data?.users?.[ctx.sender]?.premium || false;
    const role = isOwner ? 'Owner' : (isPremium ? 'Premium' : 'Free');

    // --- [ 🎨 THEME CONFIG ] ---
    const c = {
        w: chalk.whiteBright,         // Putih (Garis, Simbol, Label)
        m: chalk.magentaBright, // Ungu (Isi Data, Header)
        wb: chalk.whiteBright.bold
    };

    // --- [ 🚀 RENDER TERMINAL ] ---
    console.log(c.w(`╭── ❑ `) + c.m(`Castorice Assistant`) + c.w(` ❑`));
    
    const printRow = (label, value) => {
        console.log(`${c.w('│')} ${c.w('✦')} ${c.w(label.padEnd(11))} ${c.w(':')} ${c.m(value)}`);
    };

    // Row 1: Role Pengirim (Sekarang Dijamin 'Owner' buat Master!)
    printRow('From', role);

    // Row 2: Identitas
    const identity = ctx.isGroup ? ctx.chat : senderNumber;
    printRow('Id / Jid', identity);

    // Row 3: Uptime
    printRow('Uptime', runtime(process.uptime()));
    
    // Row 4: Status
    printRow('Status', ctx.isCmd ? 'Executing' : 'Active');

    // Row 5: Logic Command & Typo
    let displayCommand;
    if (ctx.isCmd) {
        displayCommand = ctx.command;
    } else if (ctx.isTypo) {
        displayCommand = `${ctx.command || ctx.body} ${c.w('(Typo Detected)')}`;
    } else {
        displayCommand = ctx.body ? (ctx.body.length > 20 ? ctx.body.substring(0, 20) + '...' : ctx.body) : 'Media Content';
    }
    printRow('Command', displayCommand);
    
    // Row 6: RAM
    printRow('Ram', ram);

    // Row 7: Tipe Chat
    if (ctx.isGroup) {
        printRow('Group', 'True');
    } else {
        printRow('Privat', 'True');
    }
    
    console.log(c.w(`╰── ❑`));
};