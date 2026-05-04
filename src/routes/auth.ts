import express from 'express';
const router = express.Router();
import { login, register, getAllUsers, getUser, deleteUser, updateUser,changePassword ,getDoctors} from '../controllers/Employee/auth';
import imageUploadMiddleware from '../middleware/imageUpload'


// router.route('/register').post(imageUploadMiddleware, register);

// router.route('/login').post(login);
// router.route('/users').get(getAllUsers);
// router.route('/users/update').get(getUser).delete(deleteUser).patch(updateUser);
// router.route('/users/:id').get(getUser)
// router.route('/users/:id/change-password').patch(changePassword);
// router.route('/getDoctors').get(getDoctors);
export default router; // Use ES Module export
