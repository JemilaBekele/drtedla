"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lab_1 = require("../controllers/labratory/lab");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:id').post(lab_1.createLabTest); // Create a new bicycle
router.route('/:id').get(lab_1.getAllLabTests);
router.route('/dietail/:id').get(lab_1.getLabTestsByPatient); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(lab_1.deleteLabTest).patch(lab_1.updateLabTest);
router.route('/updateunit/:id').patch(lab_1.updateLabTestReferenceAndUnit);
router.route('/finish/:id').patch(lab_1.finishLabTest);
router.route('/unconfirmed/recep').get(lab_1.getLabTestsByunconfirm);
router.route('/labratory/labtests/finish').get(lab_1.getLabTestsFinishforlab);
router.route('/labratory/labtests/forlab').get(lab_1.getLabTestsByforlab);
// Delete a bicycle by ID
exports.default = router;
