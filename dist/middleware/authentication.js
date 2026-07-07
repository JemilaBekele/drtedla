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
const Patient_1 = __importDefault(require("../models/Patient"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const unauthenticated_1 = __importDefault(require("../errors/unauthenticated"));
/**
 * Patient authentication middleware.
 * Supports dual-mode token extraction:
 *   1. Authorization: Bearer <token>  (header — preferred)
 *   2. req.cookies.accessToken        (HTTP-only cookie — fallback)
 */
const authPatient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let token;
    // 1. Try Bearer header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    // 2. Fall back to HTTP-only cookie
    if (!token && ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken)) {
        token = req.cookies.accessToken;
    }
    if (!token) {
        return next(new unauthenticated_1.default('Authentication invalid'));
    }
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            res.status(500).json({ error: 'Server configuration error: JWT_SECRET is missing' });
            return;
        }
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Find patient by id and exclude password
        const patient = yield Patient_1.default.findById(payload.userId).select('-password');
        if (!patient) {
            return next(new unauthenticated_1.default('Authentication invalid'));
        }
        // Check if patient is locked/active
        if (patient.Locked === true) {
            return next(new unauthenticated_1.default('Account is locked. Please contact support'));
        }
        req.patient = {
            patientId: patient._id.toString(),
            email: patient.Email,
            firstname: patient.firstname
        };
        next();
    }
    catch (error) {
        return next(new unauthenticated_1.default('Authentication invalid'));
    }
});
exports.default = authPatient;
