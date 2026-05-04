import express from 'express';
import {  createPatient, getpatient ,updatepatient, getAllpatient, searchPatients  } from '../controllers/patient/patient';
const router = express.Router();

// Define routes for Bicycle
router.route('/').post(createPatient);               // Create a new bicycle
router.route('/:id').get(getpatient);                   // Get a single bicycle by ID
router.route('/').get(getAllpatient);    

router.route('/find/search').get(searchPatients);
router.route('/:id').patch(updatepatient);           // Delete a bicycle by ID


export default router;
