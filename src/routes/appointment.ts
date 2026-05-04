import express from 'express';
import { createAppointment, getAppointments, getAppointment, updateAppointment, getAppointmentsschejule } from '../controllers/appointment/appoint';

const router = express.Router();

// Define routes for Bicycle
router.route('/:patientId').post(createAppointment);  
router.route('/schedule').get(getAppointmentsschejule);  // Get all scheduled appointments
router.route('/:patientId').get(getAppointments);  
router.route('/detail/:appointmentId').get(getAppointment);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:appointmentId').patch(updateAppointment);           // Delete a bicycle by ID

export default router;
