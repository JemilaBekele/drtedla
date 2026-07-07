"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patient_1 = require("../controllers/patient/patient");
const authentication_1 = __importDefault(require("../middleware/authentication"));
const router = express_1.default.Router();
// ─── /me routes (authenticated patient's own data) ──────────────────────────
router.route('/me').get(authentication_1.default, patient_1.getMe);
router.route('/me/change-password').patch(authentication_1.default, patient_1.changeMyPassword);
router.route('/me/update-profile').patch(authentication_1.default, patient_1.updateMyProfile);
// ─── General patient routes ─────────────────────────────────────────────────
router.route('/find/search').get(authentication_1.default, patient_1.searchPatients); // Search patients (protected)
router.route('/').get(authentication_1.default, patient_1.getAllpatient); // Get all patients (protected)
router.route('/:id').get(authentication_1.default, patient_1.getpatient); // Get a single patient by ID (protected)
router.route('/:id').patch(authentication_1.default, patient_1.updatepatient); // Update patient by ID (protected)
exports.default = router;
