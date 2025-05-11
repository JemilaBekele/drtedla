"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaboratoryCertificate = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../../helpers/userReferenceSchema"));
const LaboratoryCertificateSchema = new mongoose_1.default.Schema({
    patientId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
    HIV_1_2: {
        type: String,
        enum: ['NEGATIVE', 'POSITIVE'],
        required: true,
    },
    HBSAg: {
        type: String,
        enum: ['NEGATIVE', 'POSITIVE'],
        required: true,
    },
    HCV: {
        type: String,
        enum: ['NEGATIVE', 'POSITIVE'],
        required: true,
    },
    VDRL: {
        type: String,
        enum: ['NEGATIVE', 'POSITIVE'],
        required: true,
    },
    HCG: {
        type: String,
        enum: ['NEGATIVE', 'POSITIVE'],
        required: true,
    },
    Blood_Group: {
        type: String,
        required: true,
    },
    Other_Tests: {
        type: String, // or [String] if multiple entries
    },
    Abnormality_Specification: {
        type: String,
    },
    Employment_Fitness: {
        type: String,
        enum: ['Fit for Employment', 'Unfit for Employment'],
        required: true,
    },
    createdBy: userReferenceSchema_1.default,
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default,
            updateTime: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
const LaboratoryCertificate = mongoose_1.default.models.LaboratoryCertificate || mongoose_1.default.model('LaboratoryCertificate', LaboratoryCertificateSchema);
exports.LaboratoryCertificate = LaboratoryCertificate;
