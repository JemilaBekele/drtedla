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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const http_status_codes_1 = require("http-status-codes");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const async_1 = __importDefault(require("../middleware/async"));
const bad_request_1 = __importDefault(require("../errors/bad-request"));
const Users_1 = __importDefault(require("../models/Users"));
const not_found_1 = __importDefault(require("../errors/not-found"));
// Create a new user
const createUser = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, role, phone, image, deadlinetime, lock, experience, position } = req.body;
    // Validate required fields
    if (!username || !password || !role || !phone) {
        throw new bad_request_1.default('Please provide all required fields: username, password, role, phone');
    }
    // Check if username already exists
    const existingUser = yield Users_1.default.findOne({ username });
    if (existingUser) {
        throw new bad_request_1.default('Username already exists. Please choose a different username.');
    }
    // Hash the password
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    // Prepare user data
    const userData = {
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
        const existingLockedUser = yield Users_1.default.findOne({ role: 'Locked' });
        if (existingLockedUser) {
            throw new bad_request_1.default('Only one user with role "Locked" is allowed.');
        }
    }
    // Create the user
    const user = yield Users_1.default.create(userData);
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
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        success: true,
        message: 'User created successfully',
        data: userResponse,
    });
}));
exports.createUser = createUser;
// Get all users (optional utility function)
const getAllUsers = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Filter for roles that are NOT equal to 'User'
    const users = yield Users_1.default.find({ role: { $ne: 'User' } }).select('-password');
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        count: users.length,
        data: users,
    });
}));
exports.getAllUsers = getAllUsers;
// Get single user by ID (optional utility function)
const getUserById = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield Users_1.default.findById(id).select('-password');
    if (!user) {
        throw new not_found_1.default('User not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        data: user,
    });
}));
exports.getUserById = getUserById;
// Update user (optional utility function)
const updateUser = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updateData = req.body;
    // Prevent password update through this endpoint (should have separate password reset endpoint)
    if (updateData.password) {
        delete updateData.password;
    }
    const user = yield Users_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) {
        throw new not_found_1.default('User not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'User updated successfully',
        data: user,
    });
}));
exports.updateUser = updateUser;
// Delete user (optional utility function)
const deleteUser = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Prevent deleting the last 'Locked' user if it's being deleted
    const user = yield Users_1.default.findById(id);
    if (!user) {
        throw new not_found_1.default('User not found');
    }
    if (user.role === 'Locked') {
        throw new bad_request_1.default('Cannot delete the Locked user account');
    }
    yield Users_1.default.findByIdAndDelete(id);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'User deleted successfully',
    });
}));
exports.deleteUser = deleteUser;
