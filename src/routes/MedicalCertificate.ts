import express from 'express';
import {  createMedicalCertificate,
    getMedicalCertificates,
    updateMedicalCertificate,
    deleteMedicalCertificate,
    getAllMedicalCertificates} from '../controllers/MedicalFinding/MedicalCertificate';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createMedicalCertificate);               // Create a new bicycle
router.route('/:id').get(getMedicalCertificates);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deleteMedicalCertificate);
router.route('/:id').patch(updateMedicalCertificate); 
router.route('/').get(getAllMedicalCertificates);           // Delete a bicycle by ID

export default router;
