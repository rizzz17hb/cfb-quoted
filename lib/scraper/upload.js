import axios from 'axios';
import BodyForm from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Upload Buffer to Catbox.moe
 * Optimized by Castorice 🎀
 */
export async function catbox(buffer) {
    try {
        const type = await fileTypeFromBuffer(buffer);
        const ext = type ? type.ext : 'png';
        const mime = type ? type.mime : 'image/png';

        const formData = new BodyForm();
        formData.append('reqtype', 'fileupload');
        formData.append('userhash', '2dbb92f6b9f3c8cd14d75ea05');
        
        formData.append('fileToUpload', buffer, {
            filename: `file.${ext}`,
            contentType: mime
        });

        const response = await axios.post('https://catbox.moe/user/api.php', formData, {
            headers: {
                ...formData.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        return response.data.trim();
        
    } catch (error) {
        console.error("Error at Catbox uploader:", error.message);
        return null; // Balikin null aja biar gak bikin bot crash
    }
}