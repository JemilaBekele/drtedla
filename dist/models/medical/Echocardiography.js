"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../../helpers/userReferenceSchema"));
const EchocardiographySchema = new mongoose_1.default.Schema({
    patientId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    aorticRootAnnulus: { type: String, },
    aorticRootSinus: { type: String, },
    leftAtrium: { type: String, },
    leftVentricleDiastole: { type: String, },
    leftVentricleSystole: { type: String, },
    IVS: { type: String, },
    PW: { type: String, },
    LVEF: { type: String, },
    RVBasel: { type: String },
    RA: { type: String, },
    TAPSE: { type: String },
    IVC: { type: String },
    EARatio: { type: String },
    DecelerationTime: { type: String, },
    IVRT: { type: String },
    AverageEE: { type: String },
    MV_MvScore: { type: String, },
    Mv_MVA: { type: String, },
    Mv_MPG: { type: String, },
    TRVelocity: { type: String, },
    RVSP: { type: String, },
    AV_PeakV: { type: String, },
    AV_MPG: { type: String, },
    MPA: { type: String },
    PASP: { type: String },
    summary: { type: String },
    conclusion: { type: String },
    createdBy: userReferenceSchema_1.default,
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default, // Tracks the user who updated the record
            updateTime: { type: Date, default: Date.now }, // Captures update timestamps
        },
    ],
}, { timestamps: true });
const Echocardiography = mongoose_1.default.models.Echocardiography || mongoose_1.default.model('Echocardiography', EchocardiographySchema);
exports.default = Echocardiography;
