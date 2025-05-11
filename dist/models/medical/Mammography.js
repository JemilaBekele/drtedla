"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../../helpers/userReferenceSchema"));
const MammographySchema = new mongoose_1.default.Schema({
    duration: {
        type: String,
    },
    previousStudy: {
        type: String,
    },
    lnmpPostMenopausal: {
        type: String,
    },
    parity: {
        type: String,
    },
    pregnant: {
        type: Boolean,
        required: true,
    },
    breastFeeding: {
        type: Boolean,
        required: true,
    },
    hormonalTreatment: {
        type: Boolean,
        required: true,
    },
    breastLump: {
        type: Boolean,
        required: true,
    },
    nippleDischarge: {
        type: Boolean,
        required: true,
    },
    breastPain: {
        type: Boolean,
        required: true,
    },
    breastSurgery: {
        type: Boolean,
        required: true,
    },
    personalCancerHistory: {
        type: Boolean,
        required: true,
    },
    familyBreastCancerHistory: {
        type: Boolean,
        required: true,
    },
    patientId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    createdBy: userReferenceSchema_1.default,
}, { timestamps: true });
const Mammography = mongoose_1.default.models.Mammography || mongoose_1.default.model('Mammography', MammographySchema);
exports.default = Mammography;
