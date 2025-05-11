"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const PrescriptionSchema = new mongoose_1.default.Schema({
    patient: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
    Diagnosis: {
        type: String,
    },
    description: {
        type: String,
        required: [true, "Please provide a brief explanation"],
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
const Prescription = mongoose_1.default.models.Prescription || mongoose_1.default.model('Prescription', PrescriptionSchema);
exports.default = Prescription;
