import fs from 'fs';
import path from 'path';

// Daftar folder yang benar-benar tidak ingin ditampilkan sama sekali
const EXCLUDE_DIRS = ['node_modules', '.git', '.github']; 

// Daftar folder yang ditampilkan namanya saja, tapi tidak di-scan isinya
const HIDE_CONTENT_DIRS = ['plugins', 'session'];

function generateTree(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    let structure = '';

    files.forEach((file, index) => {
        const filePath = path.join(dir, file);
        const isLast = index === files.length - 1;
        const stats = fs.statSync(filePath);
        
        if (EXCLUDE_DIRS.includes(file)) return;

        const connector = isLast ? '└── ' : '├── ';
        const isDirectory = stats.isDirectory();
        
        structure += `${prefix}${connector}${file}${isDirectory ? '/' : ''}\n`;

        // REKURSIF:
        // Lanjut scan isi folder hanya jika itu folder DAN bukan termasuk folder yang mau disembunyikan isinya
        if (isDirectory && !HIDE_CONTENT_DIRS.includes(file)) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            structure += generateTree(filePath, newPrefix);
        }
    });

    return structure;
}

const rootDir = process.cwd();
const rootName = path.basename(rootDir) + '/\n';
const fullTree = rootName + generateTree(rootDir);

try {
    fs.writeFileSync('tolol.txt', fullTree, 'utf8');
    console.log('✅ Selesai! session/ dan plugins/ sekarang tampil lebih ringkas.');
} catch (err) {
    console.error('❌ Gagal:', err);
}