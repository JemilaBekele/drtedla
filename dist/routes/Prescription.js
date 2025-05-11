"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Prescription_1 = require("../controllers/MedicalFinding/Prescription");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:id').post(Prescription_1.createPrescription); // Create a new bicycle
router.route('/:id').get(Prescription_1.getPrescriptions); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(Prescription_1.deletePrescription);
router.route('/:id').patch(Prescription_1.updatePrescription);
router.route('/').get(Prescription_1.getAllPrescriptions); // Delete a bicycle by ID
exports.default = router;
