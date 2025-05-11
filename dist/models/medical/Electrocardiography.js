"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../../helpers/userReferenceSchema"));
const ECGSchema = new mongoose_1.default.Schema({
    patientId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
    HR: {
        type: String,
    },
    Rhythm: {
        type: String,
    },
    Axis: {
        type: String,
    },
    PR_Interval: {
        type: String,
    },
    QRS_Morphology: {
        type: String,
    },
    QTC: {
        type: String,
    },
    ST_Changes: {
        type: String,
    },
    T_wave_Changes: {
        type: String,
    },
    Conclusion: {
        type: String,
    },
    createdBy: userReferenceSchema_1.default,
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default, // Tracks the user who updated the record
            updateTime: { type: Date, default: Date.now }, // Captures update timestamps
        },
    ],
}, { timestamps: true });
const ECG = mongoose_1.default.models.ECG || mongoose_1.default.model('ECG', ECGSchema);
exports.default = ECG;
