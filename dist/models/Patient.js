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
const userReferenceSchema_1 = __importDefault(require("./userReferenceSchema"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
// Define the schemas
const patientSchema = new mongoose_1.default.Schema({
    cardno: {
        type: String,
        required: [true, "Please provide a card number"],
        unique: true,
    },
    firstname: {
        type: String,
        required: [true, "Please provide a firstname"],
        minlength: 3,
        maxlength: 50,
    },
    password: {
        type: String,
        minlength: 6,
    },
    isbrace: {
        type: Boolean,
        default: false,
    },
    age: {
        type: String,
        required: [true, "Please provide an age"],
    },
    sex: {
        type: String,
        enum: ['male', 'female', 'none'],
        required: [true, "Please provide a sex"],
    },
    phoneNumber: {
        type: String,
    },
    Town: {
        type: String,
    },
    KK: {
        type: String,
    },
    HNo: {
        type: String,
    },
    Woreda: {
        type: String,
    },
    Region: {
        type: String,
    },
    description: {
        type: String,
    },
    disablity: {
        type: Boolean,
        default: false,
    },
    HomePhone: {
        type: String,
    },
    Address: {
        type: String,
    },
    Email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    EmergencyContactPhone: {
        type: String,
    },
    FinancialResponsible: {
        type: String,
        enum: ["Self", "ParentGuardian"],
        default: "Self",
    },
    ParentGuardianInfo: {
        FullName: { type: String },
        Relationship: { type: String },
        MobilePhone: { type: String },
    },
    DOB: { type: Number },
    createdBy: userReferenceSchema_1.default,
    credit: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
        select: false // Don't return by default
    },
    refreshTokenExpiresAt: {
        type: Date,
        select: false
    },
    finish: {
        type: Boolean,
        default: false,
    },
    color: {
        type: String,
        enum: ["green", "white", "blue", "pink"],
        default: "white"
    },
    Locked: {
        type: Boolean,
        default: false,
    },
    // Add to patientSchema
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerifiedAt: {
        type: Date
    },
    verificationCode: {
        type: String,
        select: false
    },
    verificationCodeExpiresAt: {
        type: Date,
        select: false
    },
    Order: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
    MedicalFinding: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "MedicalFinding",
        },
    ],
    Healthinfo: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Healthinfo",
        },
    ],
    Appointment: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Appointment",
        },
    ],
    Image: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Image",
        },
    ],
    Invoice: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Invoice",
        },
    ],
    Card: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Card",
        },
    ],
    Credit: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Credit",
        },
    ],
    Orgnazation: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Orgnazation",
        },
    ],
    Prescription: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Prescription",
        },
    ],
    TreatmentPlan: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "TreatmentPlan",
        },
    ],
    Consent: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Consent",
        },
    ],
    Orthodontics: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Orthodontics",
        },
    ],
    ReferalCertificate: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "ReferalCertificate",
        },
    ],
    FNA: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "FNA",
        },
    ],
    MedicalCertificate: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "MedicalCertificate",
        },
    ],
    Note: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Note",
        },
    ],
    NoteConPat: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "NoteConPat",
        },
    ],
    DentalChart: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "DentalChart",
        },
    ],
    SampleTwo: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "SampleTwo",
        },
    ],
    Perfo: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Perfo",
        },
    ],
    DentalLabForm: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "DentalLabForm",
        },
    ],
}, {
    timestamps: true,
    strictPopulate: false
});
patientSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.password)
            return false;
        return yield bcryptjs_1.default.compare(candidatePassword, this.password);
    });
};
// Create JWT method (short-lived access token)
patientSchema.methods.createJWT = function () {
    return jsonwebtoken_1.default.sign({
        userId: this._id,
        email: this.Email,
        firstname: this.firstname,
        role: 'patient',
        type: 'access'
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' });
};
// Create refresh token method
patientSchema.methods.createRefreshToken = function () {
    // Generate a secure random token
    const refreshToken = crypto_1.default.randomBytes(40).toString('hex');
    return refreshToken;
};
// Pre-save middleware to hash password
patientSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next();
        try {
            if (this.password && typeof this.password === 'string') {
                const salt = yield bcryptjs_1.default.genSalt(10);
                this.password = yield bcryptjs_1.default.hash(this.password, salt);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Pre-findOneAndUpdate middleware for updates
patientSchema.pre('findOneAndUpdate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const update = this.getUpdate();
        if (update.password) {
            try {
                const salt = yield bcryptjs_1.default.genSalt(10);
                if (typeof update.password === 'string') {
                    update.password = yield bcryptjs_1.default.hash(update.password, salt);
                }
            }
            catch (error) {
                return next(error);
            }
        }
        next();
    });
});
const Patient = mongoose_1.default.models.Patient || mongoose_1.default.model("Patient", patientSchema);
exports.default = Patient;
