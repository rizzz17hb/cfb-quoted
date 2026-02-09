import chalk from 'chalk';
import os from 'os';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function smoothLog(text, charDelay = 12, lineDelay = 80) {
    for (let char of text) {
        process.stdout.write(char);
        await sleep(charDelay + (Math.random() * 5));
    }
    process.stdout.write('\n');
    await sleep(lineDelay);
}

async function digitalRain() {
    console.clear();
    const textTarget = "CASTORICERADJA"; 
    const width = process.stdout.columns || 80;
    
    await smoothLog(chalk.magentaBright.bold(' [!] INITIALIZING RADJA KERNEL OVERRIDE...'), 40, 500);

    for (let i = 0; i < 50; i++) {
        let line = "";
        for (let j = 0; j < width; j++) {
            const random = Math.random();
            if (random > 0.98) line += chalk.whiteBright.bold(textTarget.charAt(Math.floor(Math.random() * textTarget.length)));
            else if (random > 0.90) line += chalk.magentaBright(textTarget.charAt(Math.floor(Math.random() * textTarget.length)));
            else if (random > 0.85) line += chalk.magenta.dim(textTarget.charAt(Math.floor(Math.random() * textTarget.length)));
            else line += " ";
        }
        process.stdout.write(line + '\n');
        await sleep(15 + Math.random() * 10); 
    }
    await sleep(400);
    console.clear();
}

/**
 * Banner Info Sistem (White & Magenta Bright)
 */
async function drawBanner() {
    const uptime = process.uptime();
    const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB";
    const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB";
    const cpuModel = os.cpus()[0].model.split(' ')[0];
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour12: false }).replace(/:/g, '.') + " WIB";
    
    const fix = (text, length = 22) => text + ' '.repeat(Math.max(0, length - text.length));

    const logo = [
        "     ██████╗ █████╗ ███████╗████████╗ ██████╗ ██████╗ ██╗ ██████╗███████╗",
        "    ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██║██╔════╝██╔════╝",
        "    ██║     ███████║███████╗   ██║   ██║   ██║██████╔╝██║██║     █████╗  ",
        "    ██║     ██╔══██║╚════██║   ██║   ██║   ██║██╔══██╗██║██║     ██╔══╝  ",
        "    ╚██████╗██║  ██║███████║   ██║   ╚██████╔╝██║  ██║██║╚██████╗███████╗",
        "     ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝╚══════╝"
    ];

    for (let line of logo) { await smoothLog(chalk.magentaBright(line), 1, 15); }
    
    await sleep(200);
    const border = chalk.whiteBright.dim(` • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •`);
    
    await smoothLog(border, 2, 150);
    await smoothLog(` ${chalk.magentaBright('●')} ${chalk.magentaBright.bold('PROJECT NAME   ')} ${chalk.magentaBright('::')} ${chalk.whiteBright('CASTORICE  ASSISTANT')}`, 2, 150);
    await smoothLog(` ${chalk.magentaBright('●')} ${chalk.magentaBright.bold('DEVELOPER      ')} ${chalk.magentaBright('::')} ${chalk.whiteBright('RADJA IBLIS')}`, 2, 150);
    await smoothLog(` ${chalk.magentaBright('●')} ${chalk.magentaBright.bold('VERSION        ')} ${chalk.magentaBright('::')} ${chalk.whiteBright('1.1.0')}`, 2, 150);
    await smoothLog(` ${chalk.magentaBright('●')} ${chalk.magentaBright.bold('TYPE MODULES   ')} ${chalk.magentaBright('::')} ${chalk.whiteBright('ECMASCRIPT MODULES')}`, 2, 150);  
    await smoothLog(border, 2, 150);
    
    await smoothLog(` ${chalk.magentaBright('›')} ${chalk.magentaBright.bold('RAM')}  ${chalk.magentaBright('➜ ')} ${fix(ramUsage + '/' + ramTotal, 22)} ${chalk.magentaBright('›')} ${chalk.magentaBright.bold('UPTIME')} ${chalk.magentaBright('➜ ')} ${uptimeStr}`, 2, 150);
    await smoothLog(` ${chalk.magentaBright('›')} ${chalk.magentaBright.bold('CPU')}  ${chalk.magentaBright('➜ ')} ${fix(cpuModel, 22)} ${chalk.magentaBright('›')} ${chalk.magentaBright.bold('TIME  ')} ${chalk.magentaBright('➜ ')} ${timeNow}`, 2, 150);
    await smoothLog(border, 2, 150);
    
    await smoothLog(chalk.magentaBright(` [ SYSTEM ]`) +chalk.whiteBright(` HARAP BACA PANDUAN PENGGUNAAN SEBELUM MELANJUTKAN`), 2, 150);
}

export const engineLog = {
    info: (msg) => console.log(chalk.whiteBright(` [ `) + chalk.magentaBright(`INFO`) + chalk.whiteBright(` ] ${msg}`)),
    success: (msg) => console.log(chalk.whiteBright(` [ `) + chalk.magentaBright(`READY`) + chalk.whiteBright(` ] ${msg}`)),
    error: (msg) => console.log(chalk.whiteBright(` [ `) + chalk.magentaBright(`ERROR`) + chalk.whiteBright(` ] ${msg}`))
};

export async function initSystem() {
    await digitalRain();
    await drawBanner();
    return true;
}