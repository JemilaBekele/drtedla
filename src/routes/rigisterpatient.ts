import express from 'express';
import { 
    createPatient, 
    login, 
    refreshAccessToken,
    verifyEmail,
    resendVerificationCode,
    logout,forgotPassword,resetPassword
} from '../controllers/patient/patient';

const router = express.Router();

// Public routes (no authentication required)
router.route('/patient/register').post(createPatient); // Register new patient
router.route('/login').post(login); // Login patient
router.route('/verify-email').post(verifyEmail); // Verify email with code
router.route('/resend-verification').post(resendVerificationCode); // Resend verification code
router.route('/refresh-token').post(refreshAccessToken); // Refresh access token
router.route('/logout').post(logout); // Logout patient

router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
// Optional: Add route to check verification status

export default router;