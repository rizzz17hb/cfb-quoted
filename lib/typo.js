import { cmdMap, plugins } from '../core/registry.js'; 

const getLevenshtein = (a, b) => {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) tmp[i] = [i];
    for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            tmp[i][j] = Math.min(
                tmp[i - 1][j] + 1, 
                tmp[i][j - 1] + 1, 
                tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return tmp[a.length][b.length];
};

export async function checkTypo(ctx) {
    const bodyRaw = (ctx.body || '').trim();
    if (!bodyRaw || bodyRaw.length <= 2) return null;

    let firstWord = bodyRaw.split(' ')[0].toLowerCase();
    const cleanInput = firstWord.replace(/^[^\w\s]/g, ''); 

    const fromMap = Array.from(cmdMap.keys());
    const fromPlugins = Array.from(plugins.values()).flatMap(p => {
        const pData = p.default || p;
        return [pData.name, ...(pData.alias || [])];
    });
    const allCommands = [...new Set([...fromMap, ...fromPlugins])].filter(v => !!v && v.length > 2);

    if (allCommands.length > 0 && !allCommands.includes(cleanInput)) {
        let bestMatch = null;
        let minDistance = 3; 

        for (const cmd of allCommands) {
            const distance = getLevenshtein(cleanInput, cmd);
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = cmd;
            }
        }

        if (bestMatch && minDistance <= 2) {
            // Kalkulasi Persentase Kemiripan
            const maxLength = Math.max(cleanInput.length, bestMatch.length);
            const confidence = Math.floor(((maxLength - minDistance) / maxLength) * 100);

            return {
                input: cleanInput,
                suggestion: bestMatch,
                confidence: confidence, // Data Persen
                isOwner: global.owner?.some(v => v.replace(/[^0-9]/g, '') === ctx.sender.split('@')[0]) || false
            };
        }
    }
    return null;
}
