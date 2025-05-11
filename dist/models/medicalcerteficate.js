"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const MedicalCertificateSchema = new mongoose_1.default.Schema({
    patient: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
    },
    briefExplanation: {
        type: String,
        required: [true, "Please provide a brief explanation"],
    },
    diagnosis: {
        type: String,
    },
    restDate: {
        from: {
            type: Date,
            required: [true, "Please provide the start date for the rest period"],
        },
        to: {
            type: Date,
            required: [true, "Please provide the end date for the rest period"],
        },
        totalRestDays: {
            type: Number,
            required: [true, "Please provide the total number of rest days"],
        },
    },
    medicationDate: {
        type: Date,
        required: [true, "Please provide the medication date "],
    },
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default, // Reusing your existing userReferenceSchema
            updateTime: { type: Date, default: Date.now }, // Automatically captures the update time
        },
    ],
    createdBy: userReferenceSchema_1.default,
}, {
    timestamps: true,
    strictPopulate: false,
});
const MedicalCertificate = mongoose_1.default.models.MedicalCertificate || mongoose_1.default.model('MedicalCertificate', MedicalCertificateSchema);
exports.default = MedicalCertificate;
