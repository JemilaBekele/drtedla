"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../../helpers/userReferenceSchema"));
const GastrointestinalEndoscopySchema = new mongoose_1.default.Schema({
    referringPhysician: {
        type: String,
    },
    treatmentGiven: {
        type: String,
    },
    biopsy: {
        type: String,
    },
    clinicalHistory: {
        type: String,
    },
    indication: {
        type: String,
    },
    endoscopyFinding: {
        type: String,
    },
    conclusion: {
        type: String,
    },
    recommendation: {
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
const GastrointestinalEndoscopy = mongoose_1.default.models.GastrointestinalEndoscopy || mongoose_1.default.model('GastrointestinalEndoscopy', GastrointestinalEndoscopySchema);
exports.default = GastrointestinalEndoscopy;
