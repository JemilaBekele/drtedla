import { promises as fsPromises } from 'fs';
import path from 'path';

export const uploadImage = async (imageFile: Express.Multer.File): Promise<string> => {
    const uploadsDir = path.join(process.cwd(), 'public/uploads');

    // Check if directory exists asynchronously
    try {
        await fsPromises.access(uploadsDir);
    } catch (error) {
        await fsPromises.mkdir(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${imageFile.originalname}`;
    const filePath = path.join(uploadsDir, filename);

    // Save the file asynchronously
    await fsPromises.writeFile(filePath, imageFile.buffer);

    return `/uploads/${filename}`; // Return relative path
};
