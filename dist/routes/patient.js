"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patient_1 = require("../controllers/patient/patient");
const report_1 = require("../controllers/patient/report");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/').post(patient_1.createPatient); // Create a new bicycle
router.route('/:id').get(patient_1.getpatient); // Get a single bicycle by ID
router.route('/').get(patient_1.getAllpatient);
router.route('/lastsixmonth/get').get(patient_1.getAllRecentPatients);
router.route('/find/search').get(patient_1.searchPatients);
router.route('/data/out').get(patient_1.getoutpatient); // Get all bicycles
router.route('/:id').delete(patient_1.deletepatient);
router.route('/:id').patch(patient_1.updatepatient); // Delete a bicycle by ID
router.route('/medicalhistory').get(report_1.getMedicalFindingsForUser);
exports.default = router;
