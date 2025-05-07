import express from 'express';
import {   getMonthlyPatientCount , getTotalPatients} from '../controllers/patient/countpatient';

const router = express.Router();

// Define routes for Bicycle


router.route('/month').get(getMonthlyPatientCount);  
router.route('/total').get(getTotalPatients);  

export default router;
