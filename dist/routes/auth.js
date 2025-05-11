"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("../controllers/Employee/auth");
const imageUpload_1 = __importDefault(require("../middleware/imageUpload"));
router.route('/register').post(imageUpload_1.default, auth_1.register);
router.route('/login').post(auth_1.login);
router.route('/users').get(auth_1.getAllUsers);
router.route('/users/update').get(auth_1.getUser).delete(auth_1.deleteUser).patch(auth_1.updateUser);
router.route('/users/:id').get(auth_1.getUser);
router.route('/users/:id/change-password').patch(auth_1.changePassword);
router.route('/getDoctors').get(auth_1.getDoctors);
exports.default = router; // Use ES Module export
