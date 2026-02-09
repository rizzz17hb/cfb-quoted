import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export const plugins = new Map();
export const cmdMap = new Map();

/**
 * Load semua plugins secara rekursif
 * Castorice System - Smart Loader & Fast Mapping
 */
export async function loadPlugins(directory) {
    try {
        if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
        const items = fs.readdirSync(directory);

        for (const item of items) {
            const fullPath = path.join(directory, item);
            const stat = fs.lstatSync(fullPath);

            if (stat.isDirectory()) {
                await loadPlugins(fullPath); // Rekursif ke sub-folder
            }
            else if (fullPath.endsWith('.js') && !item.startsWith('.') && !item.startsWith('_')) {
                await registerPlugin(fullPath);
            }
        }
        return { plugins: plugins.size, commands: cmdMap.size };
    } catch (err) {
        console.error(`\x1b[31m[ REGISTRY ERROR ]\x1b[0m`, err.message);
    }
}

/**
 * Fungsi Internal untuk Registrasi Plugin
 */
async function registerPlugin(filePath) {
    try {
        // Cache busting agar import selalu membaca file terbaru di disk
        const fileUrl = `${pathToFileURL(filePath).href}?u=${Date.now()}`;
        const module = await import(fileUrl);
        const pluginData = module.default || module.plugin;

        if (pluginData && pluginData.name) {
            pluginData.filePath = filePath;

            // Simpan plugin ke Map utama (Key: Nama Unik)
            plugins.set(pluginData.name, pluginData);

            // 1. Mapping Nama Utama ke cmdMap
            cmdMap.set(pluginData.name.toLowerCase(), pluginData.name);

            // 2. Mapping Alias
            if (Array.isArray(pluginData.alias)) {
                pluginData.alias.forEach(alias => {
                    if (alias) cmdMap.set(alias.toLowerCase(), pluginData.name);
                });
            }

            // 3. Mapping Command (Array support)
            if (Array.isArray(pluginData.command)) {
                pluginData.command.forEach(cmd => {
                    if (cmd) cmdMap.set(cmd.toLowerCase(), pluginData.name);
                });
            } else if (typeof pluginData.command === 'string') {
                cmdMap.set(pluginData.command.toLowerCase(), pluginData.name);
            }

            return pluginData.name;
        }
    } catch (e) {
        console.error(`\x1b[31m[ ERROR ]\x1b[0m Gagal registrasi ${path.basename(filePath)}:`, e.message);
    }
    return null;
}

/**
 * Reload satu plugin spesifik (Hot Reload dengan Cleanup)
 */
export async function reloadPlugin(filePath) {
    try {
        // 1. Cari data plugin lama berdasarkan filePath
        const oldPlugin = Array.from(plugins.values()).find(p => p.filePath === filePath);

        // 2. Jika ditemukan, bersihkan semua jejak command lama
        if (oldPlugin) {
            const name = oldPlugin.name.toLowerCase();
            
            // Hapus semua key di cmdMap yang mengarah ke plugin ini
            for (let [cmd, targetName] of cmdMap.entries()) {
                if (targetName === oldPlugin.name) {
                    cmdMap.delete(cmd);
                }
            }
            plugins.delete(oldPlugin.name);
        }

        // 3. Register ulang dengan data terbaru dari file
        const newName = await registerPlugin(filePath);
        return !!newName;
    } catch (e) {
        console.error(`\x1b[31m[ RELOAD ERROR ]\x1b[0m`, e.message);
        return false;
    }
}
