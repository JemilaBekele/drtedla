import express from 'express';
const router = express.Router();
import {getDoctors} from '../controllers/Employee/auth';




router.route('/user/getDoctors').get(getDoctors);
export default router; // Use ES Module export
