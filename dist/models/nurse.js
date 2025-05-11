"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalSheet = exports.NursingProgressNote = exports.NursingProcess = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
// Nursing Process Schema
const NursingProcessSchema = new mongoose_1.default.Schema({
    patientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    assessment: { type: String, required: true },
    diagnosis: { type: String, required: true },
    planning: { type: String, required: true },
    intervention: { type: String, required: true },
    evaluation: { type: String, required: true },
    scenario: { type: String },
    createdBy: userReferenceSchema_1.default,
    updatedBy: [userReferenceSchema_1.default],
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default, // Tracks the user who updated the record
            updateTime: { type: Date, default: Date.now }, // Captures update timestamps
        },
    ],
}, { timestamps: true });
// Nursing Progress Note Schema
const NursingProgressNoteSchema = new mongoose_1.default.Schema({
    patientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    progressNote: { type: String, required: true },
    createdBy: userReferenceSchema_1.default,
    updatedBy: [userReferenceSchema_1.default],
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default, // Tracks the user who updated the record
            updateTime: { type: Date, default: Date.now }, // Captures update timestamps
        },
    ],
}, { timestamps: true });
// Medical Sheet Schema
const MedicalSheetSchema = new mongoose_1.default.Schema({
    patientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    name: { type: String, required: true }, // Name of procedure/medication
    medicationProcedure: { type: String, required: true },
    doseGiven: { type: String },
    route: { type: String, required: true }, // e.g., IV, Oral, IM
    frequency: { type: String },
    remark: { type: String },
    createdBy: userReferenceSchema_1.default,
    updatedBy: [userReferenceSchema_1.default],
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default, // Tracks the user who updated the record
            updateTime: { type: Date, default: Date.now }, // Captures update timestamps
        },
    ],
}, { timestamps: true });
// Model Exports
const NursingProcess = mongoose_1.default.models.NursingProcess || mongoose_1.default.model("NursingProcess", NursingProcessSchema);
exports.NursingProcess = NursingProcess;
const NursingProgressNote = mongoose_1.default.models.NursingProgressNote || mongoose_1.default.model("NursingProgressNote", NursingProgressNoteSchema);
exports.NursingProgressNote = NursingProgressNote;
const MedicalSheet = mongoose_1.default.models.MedicalSheet || mongoose_1.default.model("MedicalSheet", MedicalSheetSchema);
exports.MedicalSheet = MedicalSheet;
