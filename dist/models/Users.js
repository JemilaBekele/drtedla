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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"],
        minlength: 3,
        maxlength: 50,
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
    refreshToken: {
        type: String,
        select: false, // Don't return by default in queries
    },
    refreshTokenExpiresAt: {
        type: Date,
        select: false,
    },
}, {
    timestamps: true,
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
// Pre-save middleware to hash password
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        try {
            const salt = yield bcryptjs_1.default.genSalt(10);
            this.password = yield bcryptjs_1.default.hash(this.password, salt);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Compare candidate password with stored hash
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(candidatePassword, this.password);
    });
};
// Create short-lived JWT access token
userSchema.methods.createJWT = function () {
    return jsonwebtoken_1.default.sign({
        userId: this._id,
        username: this.username,
        role: this.role,
        type: "access",
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" });
};
// Create opaque refresh token
userSchema.methods.createRefreshToken = function () {
    return crypto_1.default.randomBytes(40).toString("hex");
};
const User = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
exports.default = User;
