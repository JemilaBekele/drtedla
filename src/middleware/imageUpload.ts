import multer from 'multer';

const storage = multer.memoryStorage(); // Store image in memory before processing
const upload = multer({ storage });

export default upload.single('image'); // Single file upload middleware
