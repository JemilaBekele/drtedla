import express from 'express';
import { createAppointment, getAppointments, getAppointment, updateAppointment, deleteAppointment } from '../controllers/appointment/appoint';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createAppointment);               // Create a new bicycle
router.route('/:id').get(getAppointments);  
router.route('/detial/:id').get(getAppointment);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deleteAppointment);
router.route('/:id').patch(updateAppointment);           // Delete a bicycle by ID

export default router;
