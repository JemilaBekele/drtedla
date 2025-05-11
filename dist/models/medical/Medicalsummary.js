"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalSummary = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../../helpers/userReferenceSchema"));
const MedicalSummarySchema = new mongoose_1.default.Schema({
    patientId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
    Constitutional: {
        type: String,
    },
    Hear_Eyes_Ear_Nose_Throat: {
        type: String,
    },
    Cardiovascular: {
        type: String,
    },
    Respiratory: {
        type: String,
    },
    Gastrointestinal: {
        type: String,
    },
    Genitourinary: {
        type: String,
    },
    Musculoskeletal: {
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
    Hematology_Lymphatic: {
        type: String,
    },
    Allergic_Immunologic: {
        type: String,
    },
    Endocrine: {
        type: String,
    },
    Lifestyle_Recommendation: {
        type: String,
    },
    createdBy: userReferenceSchema_1.default,
}, { timestamps: true });
const MedicalSummary = mongoose_1.default.models.MedicalSummary || mongoose_1.default.model('MedicalSummary', MedicalSummarySchema);
exports.MedicalSummary = MedicalSummary;
