"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appoint_1 = require("../controllers/appointment/appoint");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:patientId').post(appoint_1.createAppointment);
router.route('/schedule').get(appoint_1.getAppointmentsschejule); // Get all scheduled appointments
router.route('/:patientId').get(appoint_1.getAppointments);
router.route('/detail/:appointmentId').get(appoint_1.getAppointment); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:appointmentId').patch(appoint_1.updateAppointment); // Delete a bicycle by ID
exports.default = router;
