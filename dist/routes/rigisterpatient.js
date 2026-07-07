"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patient_1 = require("../controllers/patient/patient");
const router = express_1.default.Router();
// Public routes (no authentication required)
router.route('/patient/register').post(patient_1.createPatient); // Register new patient
router.route('/login').post(patient_1.login); // Login patient
router.route('/verify-email').post(patient_1.verifyEmail); // Verify email with code
router.route('/resend-verification').post(patient_1.resendVerificationCode); // Resend verification code
router.route('/refresh-token').post(patient_1.refreshAccessToken); // Refresh access token
router.route('/logout').post(patient_1.logout); // Logout patient
router.route('/forgot-password').post(patient_1.forgotPassword);
router.route('/reset-password').post(patient_1.resetPassword);
// Optional: Add route to check verification status
exports.default = router;
