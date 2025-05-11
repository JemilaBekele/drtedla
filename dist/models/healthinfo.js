"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const HealthinfoSchema = new mongoose_1.default.Schema({
    bloodgroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    weight: {
        type: String,
    },
    height: {
        type: String,
    },
    allergies: {
        type: String,
    },
    habits: {
        type: String,
    },
    patientId: {
        id: {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'Patient',
            required: [true, 'Please provide Patient ID'],
        }
    },
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default, // Reusing your existing userReferenceSchema
            updateTime: { type: Date, default: Date.now }, // Automatically captures the update time
        },
    ],
    createdBy: userReferenceSchema_1.default,
}, { timestamps: true });
// Avoid model recompilation during hot reloads
const Healthinfo = mongoose_1.default.models.Healthinfo || mongoose_1.default.model('Healthinfo', HealthinfoSchema);
exports.default = Healthinfo;
