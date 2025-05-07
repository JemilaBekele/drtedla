import express from 'express';
import { createImage, deleteImage, getImagesByPatientId } from '../controllers/image/im';
import { upload } from '../controllers/labratory/ultra';

const router = express.Router();

// Define routes for Bicycle    createImage,
    // deleteImage,
    // getImagesByPatientId
router.route('/:id').post(upload,createImage);               // Create a new bicycle
router.route('/:id').get(getImagesByPatientId);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deleteImage);

export default router;
