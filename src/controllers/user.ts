import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import bcrypt from 'bcryptjs';
import asyncWrapper from '../middleware/async';
import BadRequestError from '../errors/bad-request';
import User from '../models/Users';
import NotFoundError from '../errors/not-found';


// Create a new user
const createUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { 
    username, 
    password, 
    role, 
    phone, 
    image, 
    deadlinetime, 
    lock, 
    experience, 
    position 
  } = req.body;

  // Validate required fields
  if (!username || !password || !role || !phone) {
    throw new BadRequestError('Please provide all required fields: username, password, role, phone');
  }

  // Check if username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new BadRequestError('Username already exists. Please choose a different username.');
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Prepare user data
  const userData: any = {
    username,
    password: hashedPassword,
    role,
    phone,
    image: image || null,
    deadlinetime: deadlinetime || null,
    lock: lock || false,
    experience: experience || null,
    position: position || null,
  };

  // Special handling for 'Locked' role
  if (role === 'Locked') {
    // Check if a Locked user already exists (this will be caught by the pre-save middleware)
    const existingLockedUser = await User.findOne({ role: 'Locked' });
    if (existingLockedUser) {
      throw new BadRequestError('Only one user with role "Locked" is allowed.');
    }
  }

  // Create the user
  const user = await User.create(userData);

  // Remove password from response
  const userResponse = {
    _id: user._id,
    username: user.username,
    role: user.role,
    phone: user.phone,
    image: user.image,
    deadlinetime: user.deadlinetime,
    lock: user.lock,
    experience: user.experience,
    position: user.position,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'User created successfully',
    data: userResponse,
  });
});

// Get all users (optional utility function)
const getAllUsers = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const users = await User.find({}).select('-password'); // Exclude password field
  res.status(StatusCodes.OK).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// Get single user by ID (optional utility function)
const getUserById = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: user,
  });
});

// Update user (optional utility function)
const updateUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;
  
  // Prevent password update through this endpoint (should have separate password reset endpoint)
  if (updateData.password) {
    delete updateData.password;
  }
  
  const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

// Delete user (optional utility function)
const deleteUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // Prevent deleting the last 'Locked' user if it's being deleted
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  if (user.role === 'Locked') {
    throw new BadRequestError('Cannot delete the Locked user account');
  }
  
  await User.findByIdAndDelete(id);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User deleted successfully',
  });
});

export { createUser, getAllUsers, getUserById, updateUser, deleteUser };