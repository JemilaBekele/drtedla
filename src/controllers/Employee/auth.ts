import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';

import User from '../../models/Users';
import BadRequestError from '../../errors/bad-request';
import UnauthenticatedError from '../../errors/unauthenticated';
import asyncWrapper from '../../middleware/async';
import { uploadImage } from '../../helpers/uploadImage';

// Cookie options shared across login, refresh, and logout
const ACCESS_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 15 * 60 * 1000, // 15 minutes (matches JWT expiry)
};

const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


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

    const accessToken = newUser.createJWT(); // Generate JWT

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

    // Validate request body
    if (!phone || !password) {
        throw new BadRequestError('Please provide phone number and password');
    }

    const user = await User.findOne({ phone }).select('+refreshToken +refreshTokenExpiresAt');
    if (!user || !(await user.comparePassword(password))) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    // Check if account is locked
    if (user.lock === true) {
        res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Your account has been locked. Please contact an administrator.',
        });
        return;
    }

    // Generate access token (short-lived JWT)
    const accessToken = user.createJWT();

    // Generate refresh token (long-lived opaque token)
    const refreshToken = user.createRefreshToken();

    // Store refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(StatusCodes.OK).json({
        user: {
            id: user._id,
            username: user.username,
            role: user.role,
            phone: user.phone,
        },
        accessToken,  // For Bearer-mode clients (also set as httpOnly cookie)
        refreshToken, // For Bearer-mode clients (also set as httpOnly cookie)
    });
});

// Refresh access token
const refreshAccessToken = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    // Get refresh token from cookie first, then fall back to request body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Refresh token not provided',
        });
        return;
    }

    // Find user with this refresh token that hasn't expired
    const user = await User.findOne({
        refreshToken: refreshToken,
        refreshTokenExpiresAt: { $gt: new Date() },
    }).select('+refreshToken +refreshTokenExpiresAt');

    if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid or expired refresh token',
        });
        return;
    }

    // Generate new access token
    const newAccessToken = user.createJWT();

    // Rotate refresh token (generate new one, invalidate old)
    const newRefreshToken = user.createRefreshToken();
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    // Set new cookies
    res.cookie('accessToken', newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(StatusCodes.OK).json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken, // Return rotated token so Bearer-mode clients can refresh again
    });
});

// Logout — invalidate refresh token and clear cookies
const logout = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
        // Clear refresh token from database
        await User.findOneAndUpdate(
            { refreshToken: refreshToken },
            {
                $unset: { refreshToken: 1, refreshTokenExpiresAt: 1 },
            }
        );
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Logged out successfully',
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

    // Clear refresh tokens (force re-login with new password)
    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;
    await user.save();

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(StatusCodes.OK).json({ message: 'Password updated successfully. Please log in again.' });
});

// ─── /me endpoints (use authenticated user's own ID from token) ──────────────

// Get current authenticated user's profile
const getMe = asyncWrapper(async (req: any, res: Response): Promise<void> => {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
    }

    res.status(StatusCodes.OK).json({
        success: true,
        user: {
            _id: user._id,
            username: user.username,
            role: user.role,
            phone: user.phone,
            image: user.image,
            experience: user.experience,
            position: user.position,
            deadlinetime: user.deadlinetime,
            lock: user.lock,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    });
});

// Change own password (authenticated user changes their own)
const changeMyPassword = asyncWrapper(async (req: any, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new BadRequestError('Please provide current password and new password');
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
    }

    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Current password is incorrect');
    }

    user.password = newPassword;

    // Invalidate refresh tokens (force re-login)
    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;
    await user.save();

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Password updated successfully. Please log in again.',
    });
});

// Update own profile (non-sensitive fields only)
const updateMyProfile = asyncWrapper(async (req: any, res: Response): Promise<void> => {
    const allowedFields = ['username', 'phone', 'image', 'experience', 'position'];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    }

    if (Object.keys(updateData).length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'No valid fields provided to update',
        });
        return;
    }

    const user = await User.findByIdAndUpdate(
        req.user.userId,
        updateData,
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            _id: user._id,
            username: user.username,
            role: user.role,
            phone: user.phone,
            image: user.image,
            experience: user.experience,
            position: user.position,
        },
    });
});

// Get all doctors
const getDoctors = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    try {
        const doctors = await User.find({ role: 'doctor' }).exec();
        res.status(StatusCodes.OK).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
});

export { 
    register, 
    login, 
    refreshAccessToken,
    logout,
    getMe,
    changeMyPassword,
    updateMyProfile,
    getAllUsers, 
    getUser, 
    deleteUser, 
    updateUser, 
    changePassword, 
    getDoctors 
};
