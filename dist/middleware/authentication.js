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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const unauthenticated_1 = __importDefault(require("../errors/unauthenticated"));
const Users_1 = __importDefault(require("../models/Users"));
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('Missing or malformed Authorization header');
        return next(new unauthenticated_1.default('Authentication invalid'));
    }
    const token = authHeader.split(' ')[1];
    console.log('Token:', token); // Debugging
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.error('JWT_SECRET environment variable is not defined');
            res.status(500).json({ error: 'Server configuration error: JWT_SECRET is missing' });
            return;
        }
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield Users_1.default.findById(payload.userId).select('-password');
        if (!user) {
            console.error('User associated with token not found');
            return next(new unauthenticated_1.default('Authentication invalid'));
        }
        req.user = {
            userId: user._id.toString(),
            username: user.username,
            role: user.role
        };
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
        return next(new unauthenticated_1.default('Authentication invalid'));
    }
});
exports.default = auth;
