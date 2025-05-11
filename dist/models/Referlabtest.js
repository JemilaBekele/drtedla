"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const ReferLabTestSchema = new mongoose_1.default.Schema({
    patient: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
    Xray: {
        type: String,
    },
    CtScanwith: {
        type: String,
    },
    CtScanwithout: {
        type: String,
    },
    MRI: {
        type: String,
    },
    ColonosCopy: {
        type: String,
    },
    EndosCopy: {
        type: String,
    },
    FNAC: {
        type: String,
    },
    Biopsy: {
        type: String,
    },
    Ecg: {
        type: String,
    },
    Echocardiography: {
        type: String,
    },
    Ultrasound: {
        type: String,
    },
    History: {
        type: String,
    },
    PysicalExamination: {
        type: String,
    },
    LabFinding: {
        type: String,
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
const ReferLabTest = mongoose_1.default.models.ReferLabTest || mongoose_1.default.model('ReferLabTest', ReferLabTestSchema);
exports.default = ReferLabTest;
