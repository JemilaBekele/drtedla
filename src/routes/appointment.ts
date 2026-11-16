import express from 'express';
import { createAppointment, getAppointments, getAppointment, updateAppointment, getAppointmentsschejule, getBookedSlots } from '../controllers/appointment/appoint';

const router = express.Router();

router.route('/booked-slots').get(getBookedSlots);  // Booked times for a date (?date=YYYY-MM-DD&doctorId=...)
// Define routes for Bicycle
router.route('/:patientId').post(createAppointment);  
router.route('/schedule').get(getAppointmentsschejule);  // Get all scheduled appointments
router.route('/:patientId').get(getAppointments);  
router.route('/detail/:appointmentId').get(getAppointment);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:appointmentId').patch(updateAppointment);           // Delete a bicycle by ID

export default router;
