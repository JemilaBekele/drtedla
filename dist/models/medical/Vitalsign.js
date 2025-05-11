"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VitalSign = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../../helpers/userReferenceSchema"));
const VitalSignSchema = new mongoose_1.default.Schema({
    patientId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
    PR_beats_per_min: {
        type: String,
    },
    PR_Regularity: {
        type: String,
    },
    Radial_Apical: {
        type: String,
        enum: ['Radial', 'Apical', 'Other'],
    },
    O2_saturation: {
        type: String,
    },
    RR_respiration_per_min: {
        type: Number,
    },
    RR_Regularity: {
        type: String,
    },
    Temp_deg_C: {
        type: Number,
    },
    Temp_Mode: {
        type: String,
        enum: ['Oral', 'Rectal', 'Axillary', 'Tympanic'],
    },
    BP: {
        type: String,
    },
    BP_Measuring_Posture: {
        type: String,
        enum: ['Sitting', 'Standing', 'Lying_down'],
    },
    Weight: {
        type: String,
    },
    Height: {
        type: String,
    },
    Input: {
        type: String,
    },
    Output: {
        type: String,
    },
    Balance: {
        type: String,
    },
    Vision_Right: {
        type: String,
    },
    Vision_Left: {
        type: String,
    },
    Physical_Findings_Status: {
        type: String,
        enum: ['Normal', 'Abnormal'],
        default: 'Normal',
    },
    Physical_Findings_Description: {
        type: String,
    },
    Remark: {
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
const VitalSign = mongoose_1.default.models.VitalSign || mongoose_1.default.model('VitalSign', VitalSignSchema);
exports.VitalSign = VitalSign;
