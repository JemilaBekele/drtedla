"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const filter_1 = require("../controllers/appointment/filter"); // Update with actual file path
const report_1 = require("../controllers/invoice/report");
const router = express_1.default.Router();
// Route for getting today's appointments for a doctor
router.get('/doctor/today', filter_1.getTodayDocAppointments);
// Route for getting all scheduled appointments for a doctor
router.get('/doctor/appointments', filter_1.getDoctorAppointments);
// Route for filtering appointments by date
router.post('/appointments/filterdate', filter_1.filterAppointmentsByDate);
router.get('/appointments/Appointments', filter_1.Appointments);
// Route for filtering appointments by doctor and date 
router.post('/appointments/filterdoctor', filter_1.filterAppointmentsByDoctorAndDate);
// Route for getting today's general appointments reception
router.get('/appointments/today', filter_1.getTodayAppointments);
router.route('/range/agecount').get(report_1.getPatientGenderCount);
exports.default = router;
