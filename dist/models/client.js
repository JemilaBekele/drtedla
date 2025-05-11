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
const ClientSchema = new mongoose_1.default.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide a full name'],
        minlength: 3,
        maxlength: 100,
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true,
    },
    sex: {
        type: String,
        enum: ['Male', 'Female'],
        required: [true, 'Please provide a sex'],
    },
    fiydaIdImage: {
        type: String,
        required: [true, 'Please provide a Fiyda ID'],
    },
    fiydaIdImageback: {
        type: String,
        required: [true, 'Please provide a Fiyda ID'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        maxlength: 32,
    },
    workplaceId: {
        type: String,
        required: false,
    },
    organization: {
        type: String,
        required: false,
    },
    locationStart: {
        type: String,
        required: false,
    },
    locationEnd: {
        type: String,
        required: false,
    },
});
// Hash the password before saving
ClientSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password')) {
            return next();
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        this.password = yield bcryptjs_1.default.hash(this.password, salt);
        next();
    });
});
// Method to generate JWT
ClientSchema.methods.createJWT = function () {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jsonwebtoken_1.default.sign({ userId: this._id, fullName: this.fullName, role: this.role }, secret, { expiresIn: process.env.JWT_LIFETIME || '1d' });
};
// Method to compare passwords
ClientSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(candidatePassword, this.password);
    });
};
const Client = mongoose_1.default.models.Client || mongoose_1.default.model('Client', ClientSchema);
exports.default = Client;
