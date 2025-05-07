import express from 'express';
import { createMedicalFinding, getMedicalFindings,getMedicalFinding,updateMedicalFinding,deleteMedicalFinding } from '../controllers/MedicalFinding/MedicalFinding';

const router = express.Router();

// Define routes for Bicycle
router.route('/Medicalfind/:id').post(createMedicalFinding).get(getMedicalFindings);  

router.route('/detail/:recordId').get(getMedicalFinding);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:recordId').delete(deleteMedicalFinding).patch(updateMedicalFinding); 


import { createGastrointestinalColonoscopy, deleteGastrointestinalColonoscopyRecord, getGastrointestinalColonoscopies, getGastrointestinalColonoscopyRecord, updateGastrointestinalColonoscopyRecord } from '../controllers/doctoor/Gastrointestinal';


import {
    createEchocardiography,
    getEchocardiographies,
    getEchocardiographyRecord,
    updateEchocardiographyRecord,
    deleteEchocardiographyRecord,
} from '../controllers/doctoor/Echocardiography'
router.route('/Gastrointestinal/:id').post(createGastrointestinalColonoscopy).get(getGastrointestinalColonoscopies);  

router.route('/Gastrointestinal/detail/:recordId').get(getGastrointestinalColonoscopyRecord);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/Gastrointestinal/:recordId').delete(deleteGastrointestinalColonoscopyRecord).patch(updateGastrointestinalColonoscopyRecord); 


// Define routes for Bicycle
router.route('/Echocardiography/:id').post(createEchocardiography).get(getEchocardiographies);  

router.route('/Echocardiography/detail/:recordId').get(getEchocardiographyRecord);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/Echocardiography/:recordId').delete(deleteEchocardiographyRecord).patch(updateEchocardiographyRecord); 
import { createECG, deleteECGRecord, getEcG, getECGRecord, updateECGRecord } from '../controllers/doctoor/Electrocardiography';


// Define routes for Bicycle
router.route('/ECG/:id').post(createECG).get(getEcG);  

router.route('/ECG/detail/:recordId').get(getECGRecord);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/ECG/:recordId').delete(deleteECGRecord).patch(updateECGRecord); 

import {
    createGastrointestinalEndoscopy,
    getGastrointestinalEndoscopies,
    getGastrointestinalEndoscopyRecord,
    updateGastrointestinalEndoscopyRecord,
    deleteGastrointestinalEndoscopyRecord,
  
} from '../controllers/doctoor/GastrointestinalEndoscopy'


// Define routes for Bicycle
router.route('/GastrointestinalEndoscopy/:id').post(createGastrointestinalEndoscopy).get(getGastrointestinalEndoscopies);  

router.route('/GastrointestinalEndoscopy/detail/:recordId').get(getGastrointestinalEndoscopyRecord);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/GastrointestinalEndoscopy/:recordId').delete(deleteGastrointestinalEndoscopyRecord).patch(updateGastrointestinalEndoscopyRecord); 

import { createMammography, deleteMammographyRecord, getMammographies, getMammographyRecord, updateMammographyRecord } from '../controllers/doctoor/Mammography';

// Define routes for Bicycle
router.route('/Mammography/:id').post(createMammography).get(getMammographies);  

router.route('/Mammography/detail/:patientId/record/:recordId').get(getMammographyRecord);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/Mammography/:id').delete(deleteMammographyRecord).patch(updateMammographyRecord); 

import {
    createPatientIntake,
    getPatientIntakes,
    getPatientIntakeRecord,
    updatePatientIntakeRecord,
    deletePatientIntakeRecord,
} from '../controllers/doctoor/PatientIntake'

// Define routes for Bicycle
router.route('/PatientIntake/:id').post(createPatientIntake).get(getPatientIntakes);  

router.route('/PatientIntake/detail/:recordId').get(getPatientIntakeRecord);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/PatientIntake/:recordId').delete(deletePatientIntakeRecord).patch(updatePatientIntakeRecord); 



import {
    createPhysicalExam, getPhysicalExams, 
    getPhysicalExamRecord, updatePhysicalExamRecord,
     deletePhysicalExamRecord
} from '../controllers/doctoor/PhysicalExam'


// Define routes for Bicycle
router.route('/PhysicalExam/:id').post(createPhysicalExam).get(getPhysicalExams);  

router.route('/PhysicalExam/detail/:recordId').get(getPhysicalExamRecord);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/PhysicalExam/:recordId').delete(deletePhysicalExamRecord).patch(updatePhysicalExamRecord); 


// appointment 


import {
    createROS, getROS, getROSRecord, 
  updateROSRecord, deleteROSRecord
} from '../controllers/doctoor/ROS'
// Define routes for Bicycle
router.route('/ROS/:id').post(createROS).get(getROS);  

router.route('/ROS/detail/:patientId/record/:recordId').get(getROSRecord);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/ROS/:id').delete(deleteROSRecord).patch(updateROSRecord); 



import {
    createVitalSign, getVitalSigns, 
  getVitalSignRecord, updateVitalSignRecord, 
  deleteVitalSignRecord
} from '../controllers/doctoor/Vitalsign'


// Define routes for Bicycle
router.route('/VitalSign/:id').post(createVitalSign).get(getVitalSigns);  

router.route('/VitalSign/detail/:recordId').get(getVitalSignRecord);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/VitalSign/:recordId').delete(deleteVitalSignRecord).patch(updateVitalSignRecord); 


import {
    createLaboratoryCertificate,
    getLaboratoryCertificates,
    getLaboratoryCertificate,
    updateLaboratoryCertificate,
    deleteLaboratoryCertificate,
  } from '../controllers/MedicalFinding/labceritificate';
  
  
  // Routes for Laboratory Certificate
  
  // Create a certificate and fetch all certificates for a patient
  router
    .route('/LaboratoryCertificate/:id')
    .post(createLaboratoryCertificate)
    .get(getLaboratoryCertificates);
  
  // Get a specific certificate by patient ID and record ID
  router
    .route('/LaboratoryCertificate/detail/:patientId/:recordId')
    .get(getLaboratoryCertificate);
  
  // Update or delete a specific certificate by record ID
  router
    .route('/LaboratoryCertificate/:recordId')
    .patch(updateLaboratoryCertificate)
    .delete(deleteLaboratoryCertificate);


export default router;



