"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../../helpers/userReferenceSchema"));
const PhysicalExamSchema = new mongoose_1.default.Schema({
    constitutional: {
        type: String,
    },
    heedEyesEarNoseThroat: {
        type: String,
    },
    cardiovascular: {
        type: String,
    },
    Respiratory: {
        type: String,
    },
    GastroIntestinal: {
        type: String,
    },
    Gentitourinary: {
        type: String,
    },
    Musculosekeletal: {
        type: String,
    },
    Integumentary: {
        type: String,
    },
    Breast: {
        type: String,
    },
    Neurologic: {
        type: String,
    },
    Psychiatric: {
        type: String,
    },
    Endocrine: {
        type: String,
    },
    Hematology: {
        type: String,
    },
    Allergic: {
        type: String,
    },
    patientId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    createdBy: userReferenceSchema_1.default,
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default, // Tracks the user who updated the record
            updateTime: { type: Date, default: Date.now }, // Captures update timestamps
        },
    ],
}, { timestamps: true });
const PhysicalExam = mongoose_1.default.models.PhysicalExam || mongoose_1.default.model('PhysicalExam', PhysicalExamSchema);
exports.default = PhysicalExam;
