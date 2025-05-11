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
exports.getDoctors = exports.changePassword = exports.updateUser = exports.deleteUser = exports.getUser = exports.getAllUsers = exports.login = exports.register = void 0;
const http_status_codes_1 = require("http-status-codes");
const Users_1 = __importDefault(require("../../models/Users"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const unauthenticated_1 = __importDefault(require("../../errors/unauthenticated"));
const async_1 = __importDefault(require("../../middleware/async"));
const uploadImage_1 = require("../../helpers/uploadImage");
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
    const accessToken = newUser.createJWT(); // Generate JWT (ensure the method is defined)
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
    console.log(phone, password);
    // Validate request body
    if (!phone || !password) {
        throw new bad_request_1.default('Please provide phone number and password');
    }
    const user = yield Users_1.default.findOne({ phone });
    if (!user || !(yield user.comparePassword(password))) {
        throw new unauthenticated_1.default('Invalid credentials');
    }
    const accessToken = user.createJWT();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        user: {
            id: user._id,
            username: user.username,
            role: user.role,
            phone: user.phone,
        },
        accessToken,
    });
}));
exports.login = login;
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
    console.log(user);
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
    yield user.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Password updated successfully' });
}));
exports.changePassword = changePassword;
// Get all doctors
const getDoctors = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all users with the role of 'doctor'
        const doctors = yield Users_1.default.find({ role: 'doctor' }).exec();
        // Return the list of doctors
        res.status(http_status_codes_1.StatusCodes.OK).json(doctors);
    }
    catch (error) {
        console.error('Error fetching doctors:', error);
        // Return an internal server error response
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getDoctors = getDoctors;
