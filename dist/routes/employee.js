"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/Employee/auth");
const authEmployee_1 = __importDefault(require("../middleware/authEmployee"));
const authentication_1 = __importDefault(require("../middleware/authentication"));
const router = express_1.default.Router();
// ─── Public routes (no auth required) ────────────────────────────────────────
router.route('/login').post(auth_1.login);
// ─── Token lifecycle (no auth required — uses refresh token) ─────────────────
router.route('/refresh').post(auth_1.refreshAccessToken);
router.route('/logout').post(auth_1.logout);
// ─── /me routes (authenticated user's own data) ─────────────────────────────
router.route('/me').get(authEmployee_1.default, auth_1.getMe);
router.route('/me/change-password').patch(authEmployee_1.default, auth_1.changeMyPassword);
router.route('/me/update-profile').patch(authEmployee_1.default, auth_1.updateMyProfile);
// ─── Protected admin routes (require valid employee JWT) ─────────────────────
router.route('/register').post(auth_1.register);
router.route('/users').get(authEmployee_1.default, auth_1.getAllUsers);
router.route('/users/:id').get(authEmployee_1.default, auth_1.getUser);
router.route('/users/:id/change-password').patch(authEmployee_1.default, auth_1.changePassword);
router.route('/users/update').patch(authEmployee_1.default, auth_1.updateUser);
router.route('/users/delete').delete(authEmployee_1.default, auth_1.deleteUser);
router.route('/doctors').get(authentication_1.default, auth_1.getDoctors);
exports.default = router;
