"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Disease_1 = require("../controllers/MedicalFinding/Disease");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/').post(Disease_1.createDisease).get(Disease_1.getAllDiseases); // Create a new bicycle
router.route('/:id').get(Disease_1.getDiseaseById); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(Disease_1.deleteDisease);
router.route('/:id').patch(Disease_1.updateDisease);
router.route('/find/search').get(Disease_1.searchDiseases).post(Disease_1.getDiseaseStatistics);
router.route('/static/age').post(Disease_1.getPatientStatistics); // Delete a bicycle by ID
exports.default = router;
