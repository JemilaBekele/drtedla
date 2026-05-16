import express from 'express';
import { createPatient, getpatient, updatepatient, getAllpatient, searchPatients } from '../controllers/patient/patient';
import authPatient from '../middleware/authentication';
const router = express.Router();

// Define routes for Patient
router.route('/:id').get(authPatient, getpatient);   // Get a single patient by ID (protected)
router.route('/').get(authPatient, getAllpatient);   // Get all patients (protected)
router.route('/find/search').get(authPatient, searchPatients); // Search patients (protected)
router.route('/:id').patch(authPatient, updatepatient); // Update patient by ID (protected)

export default router;