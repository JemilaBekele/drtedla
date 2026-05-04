"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const router = express_1.default.Router();
// Define routes for User
router.route('/register').post(user_1.createUser); // Create a new user
router.route('/').get(user_1.getAllUsers); // Get all users
router.route('/:id').get(user_1.getUserById); // Get a single user by ID
router.route('/:id').patch(user_1.updateUser); // Update a user by ID
router.route('/:id').delete(user_1.deleteUser); // Delete a user by ID
exports.default = router;
