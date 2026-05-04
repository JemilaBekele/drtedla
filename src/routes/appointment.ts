import express from 'express';
import { createAppointment, getAppointments, getAppointment, updateAppointment, getAppointmentsschejule } from '../controllers/appointment/appoint';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createAppointment);  
router.route('/schedule').get(getAppointmentsschejule);  // Get all scheduled appointments
router.route('/:id').get(getAppointments);  
router.route('/detail/:id').get(getAppointment);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').patch(updateAppointment);           // Delete a bicycle by ID

export default router;
