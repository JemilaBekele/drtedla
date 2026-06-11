import express from 'express';
import { createPatient, getpatient, updatepatient, getAllpatient, searchPatients, getMe, changeMyPassword, updateMyProfile } from '../controllers/patient/patient';
import authPatient from '../middleware/authentication';
const router = express.Router();

// ─── /me routes (authenticated patient's own data) ──────────────────────────
router.route('/me').get(authPatient, getMe);
router.route('/me/change-password').patch(authPatient, changeMyPassword);
router.route('/me/update-profile').patch(authPatient, updateMyProfile);

// ─── General patient routes ─────────────────────────────────────────────────
router.route('/find/search').get(authPatient, searchPatients); // Search patients (protected)
router.route('/').get(authPatient, getAllpatient);   // Get all patients (protected)
router.route('/:id').get(authPatient, getpatient);   // Get a single patient by ID (protected)
router.route('/:id').patch(authPatient, updatepatient); // Update patient by ID (protected)

export default router;