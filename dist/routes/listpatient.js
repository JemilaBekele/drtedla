"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_1 = require("../controllers/patient/report");
const router = express_1.default.Router();
// Delete a bicycle by ID
router.route('/medicalhistory').get(report_1.getMedicalFindingsForUser);
router.route('/Filter').post(report_1.patientSearchController);
exports.default = router;
