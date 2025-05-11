"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const countpatient_1 = require("../controllers/patient/countpatient");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/month').get(countpatient_1.getMonthlyPatientCount);
router.route('/total').get(countpatient_1.getTotalPatients);
exports.default = router;
