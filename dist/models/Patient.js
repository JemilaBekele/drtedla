"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const patientSchema = new mongoose_1.default.Schema({
    cardno: {
        type: String,
        required: [true, "Please provide a card number"],
        unique: true,
    },
    firstname: {
        type: String,
        required: [true, "Please provide a firstname"],
        minlength: 3,
        maxlength: 50,
    },
    age: {
        type: String,
        required: [true, "Please provide an age"],
    },
    sex: {
        type: String,
        enum: ['male', 'female'],
        required: [true, "Please provide a sex"],
    },
    status: {
        type: String,
        enum: ['Out', 'In'],
        default: 'In'
    },
    phoneNumber: {
        type: String,
    },
    Town: {
        type: String,
    },
    KK: {
        type: String,
    },
    HNo: {
        type: String,
    },
    description: {
        type: String,
    },
    credit: {
        type: Boolean,
        default: false,
    },
    createdBy: userReferenceSchema_1.default,
    Order: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
    MedicalFinding: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "MedicalFinding",
        },
    ],
    Healthinfo: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Healthinfo",
        },
    ],
    Appointment: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Appointment",
        },
    ],
    Image: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Image",
        },
    ],
    Invoice: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Invoice",
        },
    ],
    Card: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Card",
        },
    ],
    Credit: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Credit",
        },
    ],
    Orgnazation: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Orgnazation",
        },
    ],
    Prescription: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Prescription",
        },
    ],
    MedicalCertificate: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "MedicalCertificate",
        },
    ],
    LabTest: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "LabTest",
        },
    ]
}, {
    timestamps: true, // Standard options
    strictPopulate: false // Add it as part of the main options object
});
const Patient = mongoose_1.default.models.Patient || mongoose_1.default.model("Patient", patientSchema);
exports.default = Patient;
