import express from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user';

const router = express.Router();

// Define routes for User
router.route('/register').post(createUser);           // Create a new user
router.route('/').get(getAllUsers);           // Get all users
router.route('/:id').get(getUserById);        // Get a single user by ID
router.route('/:id').patch(updateUser);       // Update a user by ID
router.route('/:id').delete(deleteUser);      // Delete a user by ID

export default router;