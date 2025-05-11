"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../../helpers/userReferenceSchema"));
const PatientIntakeSchema = new mongoose_1.default.Schema({
    ChiefCompliance: {
        type: String,
    },
    Allergies: {
        type: String,
    },
    currentmedicationList: {
        type: String,
    },
    pastmedicalHistory: {
        type: String,
    },
    PastSurgicalHostory: {
        type: String,
    },
    Maritalstatusoccupation: {
        type: String,
    },
    patientId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
    createdBy: userReferenceSchema_1.default,
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default, // Tracks the user who updated the record
            updateTime: { type: Date, default: Date.now }, // Captures update timestamps
        },
    ],
}, { timestamps: true });
const PatientIntake = mongoose_1.default.models.PatientIntake || mongoose_1.default.model('PatientIntake', PatientIntakeSchema);
exports.default = PatientIntake;
