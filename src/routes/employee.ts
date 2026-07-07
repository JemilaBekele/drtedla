import express from 'express';
import { 
    login, 
    register, 
    refreshAccessToken, 
    logout, 
    getMe,
    changeMyPassword,
    updateMyProfile,
    changePassword,
    getAllUsers,
    getUser,
    deleteUser,
    updateUser,
    getDoctors
} from '../controllers/Employee/auth';
import authEmployee from '../middleware/authEmployee';
import authPatient from '../middleware/authentication';

const router = express.Router();

// // ─── Public routes (no auth required) ────────────────────────────────────────
// router.route('/login').post(login);

// // ─── Token lifecycle (no auth required — uses refresh token) ─────────────────
router.route('/refresh').post(refreshAccessToken);
router.route('/logout').post(logout);

// // ─── /me routes (authenticated user's own data) ─────────────────────────────
// router.route('/me').get(authEmployee, getMe);
// router.route('/me/change-password').patch(authEmployee, changeMyPassword);
// router.route('/me/update-profile').patch(authEmployee, updateMyProfile);

// // ─── Protected admin routes (require valid employee JWT) ─────────────────────
// router.route('/register').post(register);
// router.route('/users').get(authEmployee, getAllUsers);
// router.route('/users/:id').get(authEmployee, getUser);
// router.route('/users/:id/change-password').patch(authEmployee, changePassword);
// router.route('/users/update').patch(authEmployee, updateUser);
// router.route('/users/delete').delete(authEmployee, deleteUser);
router.route('/getDoctors').get( authPatient, getDoctors);

export default router;
