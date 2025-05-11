"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const MedicalFindingSchema = new mongoose_1.default.Schema({
    ChiefCompliance: {
        type: String,
    },
    Historypresent: {
        type: String,
    },
    Pastmedicalhistory: {
        type: String,
    },
    Pastmedicationtaken: {
        type: String,
    },
    SystemicExamination: {
        HEENT: { type: String, default: 'Normal' },
        LGS: { type: String, default: 'Normal' },
        Chest: { type: String, default: 'Normal' },
        CVS: { type: String, default: 'Normal' },
        Abdomen: { type: String },
        GastrointestinalSystem: { type: String },
        MusculoskeletalSystem: { type: String },
        IntegumentarySystem: { type: String },
        CNS: {
            CN: { type: String },
            Motor: { type: String },
            Sensory: { type: String },
            Tone: { type: String },
        },
    },
    meningealsigns: {
        Neckstiffness: { type: String, default: '' },
        Kernigssign: { type: String, default: '' },
        Brudzinskissign: { type: String, default: '' },
        Photophobia: { type: String, default: '' },
        Headachefevervomiting: { type: String },
    },
    consciousness: {
        type: String
    },
    GCS: {
        type: String
    },
    Assessment: {
        type: String,
    },
    Treatment: {
        type: String,
    },
    Recommendation: {
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
    diseases: [
        {
            disease: {
                type: mongoose_1.default.Schema.Types.ObjectId, // Reference to Disease model
                ref: 'Disease',
            },
            diseaseTime: {
                type: Date,
                default: Date.now
            },
        },
    ],
    createdBy: userReferenceSchema_1.default,
}, { timestamps: true });
const MedicalFinding = mongoose_1.default.models.MedicalFinding || mongoose_1.default.model('MedicalFinding', MedicalFindingSchema);
exports.default = MedicalFinding;
