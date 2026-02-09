import fs from 'fs';

/**
 * Pencatat Error Fitur/Plugin
 * Castorice System - Minimalist Error Monitoring
 */
export const logError = (command, err, m) => {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const cmdName = command?.toUpperCase() || 'SYSTEM';
    const reason = err.message || String(err);
    const sender = m?.sender ? `@${m.sender.split('@')[0]}` : 'INTERNAL';

    // 1. Stack Trace Cleaner
    let briefStack = 'Unknown Trace';
    if (err.stack) {
        const stackLines = err.stack.split('\n');
        // Ambil baris pertama yang merujuk ke file project (biasanya baris ke-1 atau ke-2)
        briefStack = stackLines.find(line => line.includes('.js') && !line.includes('node_modules'))?.trim() || stackLines[1]?.trim();
    }

    // 2. Terminal Output (Cyberpunk Style)
    console.error(`\x1b[31m\n┌─── [ ERROR REPORT ] ───┐\x1b[0m`);
    console.error(`│ Time   : ${time}`);
    console.error(`│ Cmd    : ${cmdName}`);
    console.error(`│ User   : ${sender}`);
    console.error(`│ Cause  : ${reason}`);
    console.error(`│ Trace  : \x1b[33m${briefStack}\x1b[0m`);
    console.error(`\x1b[31m└────────────────────────┘\n\x1b[0m`);

    // 3. RAM Logging (Quick Access)
    global.db = global.db || {};
    global.db.logs = global.db.logs || [];

    const logData = {
        command: cmdName,
        reason,
        time,
        sender: m?.sender || 'INTERNAL',
        trace: briefStack
    };

    global.db.logs.push(logData);
    if (global.db.logs.length > 30) global.db.logs.shift();

    // 4. Async File Logging (Non-Blocking)
    const logEntry = `[${time}] [${cmdName}] [${sender}] - ${reason} - ${briefStack}\n`;
    
    // Gunakan appendFile (async) agar engine tetap lancar jaya
    fs.appendFile('./error.log', logEntry, 'utf8', (fsErr) => {
        if (fsErr) console.error(`\x1b[31m[!] Gagal menulis ke error.log: ${fsErr.message}\x1b[0m`);
    });
};
