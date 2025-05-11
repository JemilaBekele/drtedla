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
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs")); // Use import instead of require
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Use import instead of require
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"],
        minlength: 3,
        maxlength: 50, // Fixed typo from "maxkength"
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    role: {
        type: String,
        enum: ['admin', 'doctor', "nurse", 'reception', "Laboratory", "Ultrasound"],
        required: [true, "Please provide a role"],
    },
    phone: {
        type: String,
        required: [true, "Please provide a phone number"],
    },
    image: {
        type: String,
        required: false, // Optional: set to true if you want to require an image
        default: null, // Default value if no image is provided
    },
});
// Hash the password before saving
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = yield bcryptjs_1.default.genSalt(10);
        this.password = yield bcryptjs_1.default.hash(this.password, salt);
        next();
    });
});
// Method to generate JWT
userSchema.methods.createJWT = function () {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign({ userId: this._id, username: this.username, role: this.role }, secret, { expiresIn: process.env.JWT_LIFETIME || "1d" });
};
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const isMatch = yield bcryptjs_1.default.compare(candidatePassword, this.password);
        return isMatch;
    });
};
const User = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
exports.default = User;
