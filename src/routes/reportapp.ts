import express from 'express';
import {
  getTodayDocAppointments,
  getDoctorAppointments,
  filterAppointmentsByDate,
  filterAppointmentsByDoctorAndDate,
  Appointments,
  getTodayAppointments,
} from '../controllers/appointment/filter'; // Update with actual file path
import { getPatientGenderCount } from '../controllers/invoice/report';

const router = express.Router();

// Route for getting today's appointments for a doctor
router.get('/doctor/today', getTodayDocAppointments);

// Route for getting all scheduled appointments for a doctor
router.get('/doctor/appointments', getDoctorAppointments);

// Route for filtering appointments by date
router.post('/appointments/filterdate', filterAppointmentsByDate);
router.get('/appointments/Appointments', Appointments);
// Route for filtering appointments by doctor and date 
router.post('/appointments/filterdoctor', filterAppointmentsByDoctorAndDate);



// Route for getting today's general appointments reception
router.get('/appointments/today', getTodayAppointments);


router.route('/range/agecount').get(getPatientGenderCount);
export default router;
