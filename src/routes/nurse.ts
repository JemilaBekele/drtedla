


import express from 'express';
import {createNursingProcess, getNursingProcess, updateNursingProcess, deleteNursingProcess, 
    createNursingProgressNote, getNursingProgressNote, deleteNursingProgressNote,updateNursingProgressNote,
    createMedicalSheet, getMedicalSheet ,updateMedicalSheet , deleteMedicalSheet,getRecentNursingPatients} from '../controllers/nurse/nurse';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createNursingProcess);               
router.route('/:id').get(getNursingProcess);                              
router.route('/:id').delete(deleteNursingProcess).patch(updateNursingProcess);  

router.route('/Sheet/recent').get(getRecentNursingPatients); 
router.route('/Progress/:id').post(createNursingProgressNote);              
router.route('/Progress/:id').get(getNursingProgressNote);                                
router.route('/Progress/:recordId').delete(deleteNursingProgressNote).patch(updateNursingProgressNote);  


router.route('/Sheet/:id').post(createMedicalSheet);               
router.route('/Sheet/:id').get(getMedicalSheet);                 
router.route('/Sheet/:id').delete(deleteMedicalSheet).patch(updateMedicalSheet);  



export default router;
