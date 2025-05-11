"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nurse_1 = require("../controllers/nurse/nurse");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:id').post(nurse_1.createNursingProcess);
router.route('/:id').get(nurse_1.getNursingProcess);
router.route('/:id').delete(nurse_1.deleteNursingProcess).patch(nurse_1.updateNursingProcess);
router.route('/Sheet/recent').get(nurse_1.getRecentNursingPatients);
router.route('/Progress/:id').post(nurse_1.createNursingProgressNote);
router.route('/Progress/:id').get(nurse_1.getNursingProgressNote);
router.route('/Progress/:recordId').delete(nurse_1.deleteNursingProgressNote).patch(nurse_1.updateNursingProgressNote);
router.route('/Sheet/:id').post(nurse_1.createMedicalSheet);
router.route('/Sheet/:id').get(nurse_1.getMedicalSheet);
router.route('/Sheet/:id').delete(nurse_1.deleteMedicalSheet).patch(nurse_1.updateMedicalSheet);
exports.default = router;
