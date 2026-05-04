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
        enum: ['admin', 'doctor', 'reception', 'User', 'Locked', 'nurse', 'inventory', 'labratory'], // Example roles
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
    deadlinetime: {
        type: Date,
        required: false, // Set to true if you want it mandatory
        default: null, // Or new Date() if you want to auto-fill
    },
    lock: {
        type: Boolean,
        default: false,
    },
    experience: {
        type: Number, // years of experience
        required: false,
        default: null,
    },
    position: {
        type: String, // job title, e.g. "Senior Nurse"
        required: false,
        default: null,
    },
});
// Middleware to ensure only one 'Locked' role user exists
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.role === 'Locked') {
            const existingLockedUser = yield mongoose_1.default.models.User.findOne({ role: 'Locked' });
            if (existingLockedUser && existingLockedUser._id.toString() !== this._id.toString()) {
                const error = new Error("Only one user with role 'Locked' is allowed.");
                error.name = "ValidationError";
                return next(error);
            }
        }
        next();
    });
});
const User = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
exports.default = User;
