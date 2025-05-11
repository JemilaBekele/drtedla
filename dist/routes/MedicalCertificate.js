"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MedicalCertificate_1 = require("../controllers/MedicalFinding/MedicalCertificate");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:id').post(MedicalCertificate_1.createMedicalCertificate); // Create a new bicycle
router.route('/:id').get(MedicalCertificate_1.getMedicalCertificates); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(MedicalCertificate_1.deleteMedicalCertificate);
router.route('/:id').patch(MedicalCertificate_1.updateMedicalCertificate);
router.route('/').get(MedicalCertificate_1.getAllMedicalCertificates); // Delete a bicycle by ID
exports.default = router;
