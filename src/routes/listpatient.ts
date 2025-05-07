import express from 'express';

import {  getMedicalFindingsForUser, patientSearchController } from '../controllers/patient/report';
const router = express.Router();
         // Delete a bicycle by ID


router.route('/medicalhistory').get(getMedicalFindingsForUser); 
router.route('/Filter').post(patientSearchController); 
export default router;
