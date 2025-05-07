import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';

import User from '../../models/Users';
import BadRequestError from '../../errors/bad-request';
import UnauthenticatedError from '../../errors/unauthenticated';
import asyncWrapper from '../../middleware/async';
import { uploadImage } from '../../helpers/uploadImage';


// Register a new user
const register = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { username, password, role, phone } = req.body;

    // Validate required fields
    if (!username || !password || !role || !phone) {
        throw new BadRequestError('All fields are required.');
    }

    // Check for duplicate phone number
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Phone number is already in use. Please use a different phone number.',
        });
        return;
    }

    // Handle image upload if an image file is provided
    let imagePath: string | undefined = undefined;
    if (req.file) {
        imagePath = await uploadImage(req.file);
    }

    // Create new user (password is hashed in the Mongoose pre-save hook)
    const newUser = await User.create({
        username,
        password,
        role,
        phone,
        image: imagePath, // Save the uploaded image path
    });

    const accessToken = newUser.createJWT(); // Generate JWT (ensure the method is defined)

    res.status(StatusCodes.CREATED).json({
        user: {
            username: newUser.username,
            role: newUser.role,
            phone: newUser.phone,
            image: newUser.image, // Return the image path if uploaded
        },
        accessToken,
    });
});

// Login an existing user
const login = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { phone, password } = req.body;
console.log(phone, password)
    // Validate request body
    if (!phone || !password) {
        throw new BadRequestError('Please provide phone number and password');
    }

    const user = await User.findOne({ phone });
    if (!user || !(await user.comparePassword(password))) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const accessToken = user.createJWT();

    res.status(StatusCodes.OK).json({
        user: {
            id:user._id,
            username: user.username,
            role: user.role,
            phone: user.phone,
        },
        accessToken,
    });
});

// Get all users with user count
const getAllUsers = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
    const users = await User.find({});
   


    res.status(StatusCodes.OK).json({ users, count: users.length });
});

// Get a single user by ID
const getUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${id}` });
        return;
    }
    console.log(user)
    res.status(StatusCodes.OK).json({ user });
});
// Delete a user by ID
const deleteUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body;
    const user = await User.findByIdAndDelete(id);
  
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${id}` });
      return;
    }
  
    res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
  });
  
  // Update a user by ID
  const updateUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id, newPassword, ...updateFields } = req.body;
  
    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is required' });
      return;
    }
  
    // Find the user first
    const user = await User.findById(id);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: `No user found with ID: ${id}` });
      return;
    }
  
    // If password is being updated (admin reset scenario)
    if (newPassword) {
      user.password = newPassword;
      await user.save(); // This will trigger the pre-save hook to hash the new password
    }
  
    // Update other fields if provided
    if (Object.keys(updateFields).length > 0) {
      Object.assign(user, updateFields);
      await user.save();
    }
  
    res.status(StatusCodes.OK).json({ 
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        phone: user.phone,
        image: user.image
      } 
    });
  });
  
// Change password for a user
const changePassword = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id: userID } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
        throw new BadRequestError('Please provide current password and new password');
    }

    // Find the user by ID
    const user = await User.findById(userID);
    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${userID}` });
        return;
    }

    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
});

// Get all doctors
const getDoctors = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch all users with the role of 'doctor'
        const doctors = await User.find({ role: 'doctor' }).exec();

        // Return the list of doctors
        res.status(StatusCodes.OK).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);

        // Return an internal server error response
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
});

export { 
    register, 
    login, 
    getAllUsers, 
    getUser, 
    deleteUser, 
    updateUser, 
    changePassword, 
    getDoctors 
};
