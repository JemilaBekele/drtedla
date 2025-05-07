import express from 'express';
import {  createPatient, getpatient ,updatepatient, getAllpatient, deletepatient,getoutpatient, searchPatients ,getAllRecentPatients } from '../controllers/patient/patient';
import {  getMedicalFindingsForUser } from '../controllers/patient/report';
const router = express.Router();

// Define routes for Bicycle
router.route('/').post(createPatient);               // Create a new bicycle
router.route('/:id').get(getpatient);                   // Get a single bicycle by ID
router.route('/').get(getAllpatient);    
router.route('/lastsixmonth/get').get(getAllRecentPatients);    

router.route('/find/search').get(searchPatients);
router.route('/data/out').get(getoutpatient);// Get all bicycles
router.route('/:id').delete(deletepatient);
router.route('/:id').patch(updatepatient);           // Delete a bicycle by ID


router.route('/medicalhistory').get(getMedicalFindingsForUser); 
export default router;
