"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctors = exports.changePassword = exports.updateUser = exports.deleteUser = exports.getUser = exports.getAllUsers = exports.updateMyProfile = exports.changeMyPassword = exports.getMe = exports.logout = exports.refreshAccessToken = exports.login = exports.register = void 0;
const http_status_codes_1 = require("http-status-codes");
const Users_1 = __importDefault(require("../../models/Users"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const unauthenticated_1 = __importDefault(require("../../errors/unauthenticated"));
const async_1 = __importDefault(require("../../middleware/async"));
const uploadImage_1 = require("../../helpers/uploadImage");
// Cookie options shared across login, refresh, and logout
const ACCESS_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes (matches JWT expiry)
};
const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
// Register a new user
const register = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, role, phone } = req.body;
    // Validate required fields
    if (!username || !password || !role || !phone) {
        throw new bad_request_1.default('All fields are required.');
    }
    // Check for duplicate phone number
    const existingUser = yield Users_1.default.findOne({ phone });
    if (existingUser) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            message: 'Phone number is already in use. Please use a different phone number.',
        });
        return;
    }
    // Handle image upload if an image file is provided
    let imagePath = undefined;
    if (req.file) {
        imagePath = yield (0, uploadImage_1.uploadImage)(req.file);
    }
    // Create new user (password is hashed in the Mongoose pre-save hook)
    const newUser = yield Users_1.default.create({
        username,
        password,
        role,
        phone,
        image: imagePath, // Save the uploaded image path
    });
    const accessToken = newUser.createJWT(); // Generate JWT
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        user: {
            username: newUser.username,
            role: newUser.role,
            phone: newUser.phone,
            image: newUser.image, // Return the image path if uploaded
        },
        accessToken,
    });
}));
exports.register = register;
// Login an existing user
const login = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = req.body;
    // Validate request body
    if (!phone || !password) {
        throw new bad_request_1.default('Please provide phone number and password');
    }
    const user = yield Users_1.default.findOne({ phone }).select('+refreshToken +refreshTokenExpiresAt');
    if (!user || !(yield user.comparePassword(password))) {
        throw new unauthenticated_1.default('Invalid credentials');
    }
    // Check if account is locked
    if (user.lock === true) {
        res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
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
    yield user.save();
    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        user: {
            id: user._id,
            username: user.username,
            role: user.role,
            phone: user.phone,
        },
        accessToken, // For Bearer-mode clients (also set as httpOnly cookie)
        refreshToken, // For Bearer-mode clients (also set as httpOnly cookie)
    });
}));
exports.login = login;
// Refresh access token
const refreshAccessToken = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get refresh token from cookie first, then fall back to request body
    const refreshToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || req.body.refreshToken;
    if (!refreshToken) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Refresh token not provided',
        });
        return;
    }
    // Find user with this refresh token that hasn't expired
    const user = yield Users_1.default.findOne({
        refreshToken: refreshToken,
        refreshTokenExpiresAt: { $gt: new Date() },
    }).select('+refreshToken +refreshTokenExpiresAt');
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
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
    yield user.save();
    // Set new cookies
    res.cookie('accessToken', newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken, // Return rotated token so Bearer-mode clients can refresh again
    });
}));
exports.refreshAccessToken = refreshAccessToken;
// Logout — invalidate refresh token and clear cookies
const logout = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const refreshToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || req.body.refreshToken;
    if (refreshToken) {
        // Clear refresh token from database
        yield Users_1.default.findOneAndUpdate({ refreshToken: refreshToken }, {
            $unset: { refreshToken: 1, refreshTokenExpiresAt: 1 },
        });
    }
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'Logged out successfully',
    });
}));
exports.logout = logout;
// Get all users with user count
const getAllUsers = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield Users_1.default.find({});
    res.status(http_status_codes_1.StatusCodes.OK).json({ users, count: users.length });
}));
exports.getAllUsers = getAllUsers;
// Get a single user by ID
const getUser = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield Users_1.default.findById(id);
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${id}` });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ user });
}));
exports.getUser = getUser;
// Delete a user by ID
const deleteUser = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const user = yield Users_1.default.findByIdAndDelete(id);
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${id}` });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'User deleted successfully' });
}));
exports.deleteUser = deleteUser;
// Update a user by ID
const updateUser = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { id, newPassword } = _a, updateFields = __rest(_a, ["id", "newPassword"]);
    if (!id) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: 'User ID is required' });
        return;
    }
    // Find the user first
    const user = yield Users_1.default.findById(id);
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: `No user found with ID: ${id}` });
        return;
    }
    // If password is being updated (admin reset scenario)
    if (newPassword) {
        user.password = newPassword;
        yield user.save(); // This will trigger the pre-save hook to hash the new password
    }
    // Update other fields if provided
    if (Object.keys(updateFields).length > 0) {
        Object.assign(user, updateFields);
        yield user.save();
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        user: {
            _id: user._id,
            username: user.username,
            role: user.role,
            phone: user.phone,
            image: user.image
        }
    });
}));
exports.updateUser = updateUser;
// Change password for a user
const changePassword = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userID } = req.params;
    const { currentPassword, newPassword } = req.body;
    // Validate required fields
    if (!currentPassword || !newPassword) {
        throw new bad_request_1.default('Please provide current password and new password');
    }
    // Find the user by ID
    const user = yield Users_1.default.findById(userID);
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${userID}` });
        return;
    }
    const isPasswordCorrect = yield user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
        throw new unauthenticated_1.default('Current password is incorrect');
    }
    user.password = newPassword;
    // Clear refresh tokens (force re-login with new password)
    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;
    yield user.save();
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Password updated successfully. Please log in again.' });
}));
exports.changePassword = changePassword;
// ─── /me endpoints (use authenticated user's own ID from token) ──────────────
// Get current authenticated user's profile
const getMe = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Users_1.default.findById(req.user.userId).select('-password');
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
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
}));
exports.getMe = getMe;
// Change own password (authenticated user changes their own)
const changeMyPassword = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new bad_request_1.default('Please provide current password and new password');
    }
    const user = yield Users_1.default.findById(req.user.userId);
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
    }
    const isPasswordCorrect = yield user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
        throw new unauthenticated_1.default('Current password is incorrect');
    }
    user.password = newPassword;
    // Invalidate refresh tokens (force re-login)
    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;
    yield user.save();
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'Password updated successfully. Please log in again.',
    });
}));
exports.changeMyPassword = changeMyPassword;
// Update own profile (non-sensitive fields only)
const updateMyProfile = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allowedFields = ['username', 'phone', 'image', 'experience', 'position'];
    const updateData = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    }
    if (Object.keys(updateData).length === 0) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'No valid fields provided to update',
        });
        return;
    }
    const user = yield Users_1.default.findByIdAndUpdate(req.user.userId, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
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
}));
exports.updateMyProfile = updateMyProfile;
// Get all doctors
const getDoctors = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Fetching doctors...');
    try {
        const doctors = yield Users_1.default.find({ role: 'doctor' })
            .select('-password')
            .exec();
        res.status(http_status_codes_1.StatusCodes.OK).json(doctors);
    }
    catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getDoctors = getDoctors;
