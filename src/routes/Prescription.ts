import express from 'express';
import {   createPrescription,
    getPrescriptions,
    updatePrescription,
    deletePrescription,
    getAllPrescriptions} from '../controllers/MedicalFinding/Prescription';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createPrescription);               // Create a new bicycle
router.route('/:id').get(getPrescriptions);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deletePrescription);
router.route('/:id').patch(updatePrescription); 
router.route('/').get(getAllPrescriptions);           // Delete a bicycle by ID

export default router;
