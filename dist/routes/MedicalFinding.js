"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MedicalFinding_1 = require("../controllers/MedicalFinding/MedicalFinding");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/Medicalfind/:id').post(MedicalFinding_1.createMedicalFinding).get(MedicalFinding_1.getMedicalFindings);
router.route('/detail/:recordId').get(MedicalFinding_1.getMedicalFinding); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:recordId').delete(MedicalFinding_1.deleteMedicalFinding).patch(MedicalFinding_1.updateMedicalFinding);
const Gastrointestinal_1 = require("../controllers/doctoor/Gastrointestinal");
const Echocardiography_1 = require("../controllers/doctoor/Echocardiography");
router.route('/Gastrointestinal/:id').post(Gastrointestinal_1.createGastrointestinalColonoscopy).get(Gastrointestinal_1.getGastrointestinalColonoscopies);
router.route('/Gastrointestinal/detail/:recordId').get(Gastrointestinal_1.getGastrointestinalColonoscopyRecord); // Get a single bicycle by ID                 // Get all bicycles
router.route('/Gastrointestinal/:recordId').delete(Gastrointestinal_1.deleteGastrointestinalColonoscopyRecord).patch(Gastrointestinal_1.updateGastrointestinalColonoscopyRecord);
// Define routes for Bicycle
router.route('/Echocardiography/:id').post(Echocardiography_1.createEchocardiography).get(Echocardiography_1.getEchocardiographies);
router.route('/Echocardiography/detail/:recordId').get(Echocardiography_1.getEchocardiographyRecord); // Get a single bicycle by ID                 // Get all bicycles
router.route('/Echocardiography/:recordId').delete(Echocardiography_1.deleteEchocardiographyRecord).patch(Echocardiography_1.updateEchocardiographyRecord);
const Electrocardiography_1 = require("../controllers/doctoor/Electrocardiography");
// Define routes for Bicycle
router.route('/ECG/:id').post(Electrocardiography_1.createECG).get(Electrocardiography_1.getEcG);
router.route('/ECG/detail/:recordId').get(Electrocardiography_1.getECGRecord); // Get a single bicycle by ID                 // Get all bicycles
router.route('/ECG/:recordId').delete(Electrocardiography_1.deleteECGRecord).patch(Electrocardiography_1.updateECGRecord);
const GastrointestinalEndoscopy_1 = require("../controllers/doctoor/GastrointestinalEndoscopy");
// Define routes for Bicycle
router.route('/GastrointestinalEndoscopy/:id').post(GastrointestinalEndoscopy_1.createGastrointestinalEndoscopy).get(GastrointestinalEndoscopy_1.getGastrointestinalEndoscopies);
router.route('/GastrointestinalEndoscopy/detail/:recordId').get(GastrointestinalEndoscopy_1.getGastrointestinalEndoscopyRecord); // Get a single bicycle by ID                 // Get all bicycles
router.route('/GastrointestinalEndoscopy/:recordId').delete(GastrointestinalEndoscopy_1.deleteGastrointestinalEndoscopyRecord).patch(GastrointestinalEndoscopy_1.updateGastrointestinalEndoscopyRecord);
const Mammography_1 = require("../controllers/doctoor/Mammography");
// Define routes for Bicycle
router.route('/Mammography/:id').post(Mammography_1.createMammography).get(Mammography_1.getMammographies);
router.route('/Mammography/detail/:patientId/record/:recordId').get(Mammography_1.getMammographyRecord); // Get a single bicycle by ID                 // Get all bicycles
router.route('/Mammography/:id').delete(Mammography_1.deleteMammographyRecord).patch(Mammography_1.updateMammographyRecord);
const PatientIntake_1 = require("../controllers/doctoor/PatientIntake");
// Define routes for Bicycle
router.route('/PatientIntake/:id').post(PatientIntake_1.createPatientIntake).get(PatientIntake_1.getPatientIntakes);
router.route('/PatientIntake/detail/:recordId').get(PatientIntake_1.getPatientIntakeRecord); // Get a single bicycle by ID                 // Get all bicycles
router.route('/PatientIntake/:recordId').delete(PatientIntake_1.deletePatientIntakeRecord).patch(PatientIntake_1.updatePatientIntakeRecord);
const PhysicalExam_1 = require("../controllers/doctoor/PhysicalExam");
// Define routes for Bicycle
router.route('/PhysicalExam/:id').post(PhysicalExam_1.createPhysicalExam).get(PhysicalExam_1.getPhysicalExams);
router.route('/PhysicalExam/detail/:recordId').get(PhysicalExam_1.getPhysicalExamRecord); // Get a single bicycle by ID                 // Get all bicycles
router.route('/PhysicalExam/:recordId').delete(PhysicalExam_1.deletePhysicalExamRecord).patch(PhysicalExam_1.updatePhysicalExamRecord);
// appointment 
const ROS_1 = require("../controllers/doctoor/ROS");
// Define routes for Bicycle
router.route('/ROS/:id').post(ROS_1.createROS).get(ROS_1.getROS);
router.route('/ROS/detail/:patientId/record/:recordId').get(ROS_1.getROSRecord); // Get a single bicycle by ID                 // Get all bicycles
router.route('/ROS/:id').delete(ROS_1.deleteROSRecord).patch(ROS_1.updateROSRecord);
const Vitalsign_1 = require("../controllers/doctoor/Vitalsign");
// Define routes for Bicycle
router.route('/VitalSign/:id').post(Vitalsign_1.createVitalSign).get(Vitalsign_1.getVitalSigns);
router.route('/VitalSign/detail/:recordId').get(Vitalsign_1.getVitalSignRecord); // Get a single bicycle by ID                 // Get all bicycles
router.route('/VitalSign/:recordId').delete(Vitalsign_1.deleteVitalSignRecord).patch(Vitalsign_1.updateVitalSignRecord);
const labceritificate_1 = require("../controllers/MedicalFinding/labceritificate");
// Routes for Laboratory Certificate
// Create a certificate and fetch all certificates for a patient
router
    .route('/LaboratoryCertificate/:id')
    .post(labceritificate_1.createLaboratoryCertificate)
    .get(labceritificate_1.getLaboratoryCertificates);
// Get a specific certificate by patient ID and record ID
router
    .route('/LaboratoryCertificate/detail/:patientId/:recordId')
    .get(labceritificate_1.getLaboratoryCertificate);
// Update or delete a specific certificate by record ID
router
    .route('/LaboratoryCertificate/:recordId')
    .patch(labceritificate_1.updateLaboratoryCertificate)
    .delete(labceritificate_1.deleteLaboratoryCertificate);
exports.default = router;
