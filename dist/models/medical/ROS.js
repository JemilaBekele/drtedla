"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../../helpers/userReferenceSchema"));
const ROSSchema = new mongoose_1.default.Schema({
    Constitutional: {
        type: String,
    },
    HeedEyesEarNoseThroat: {
        type: String,
    },
    Throat: {
        type: String
    },
    Respiratory: {
        type: String,
    },
    Gastrointestinal: {
        type: String,
    },
    Museuloskeletal: {
        type: String,
    },
    Integumentart: {
        type: String,
    },
    Neurologic: {
        type: String,
    },
    HematologyLymphatic: {
        type: String,
    },
    Psychiatric: {
        type: String,
    },
    Allergic: { type: String, },
    patientId: {
        id: {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'Patient',
            required: [true, 'Please provide Patient ID'],
        }
    },
    createdBy: userReferenceSchema_1.default,
}, { timestamps: true });
const ROS = mongoose_1.default.models.ROS || mongoose_1.default.model('ROS', ROSSchema);
exports.default = ROS;
