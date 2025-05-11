"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UltraTest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
// Schema for each test in a section
const TestSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    note: {
        type: String,
    },
    noteA: {
        type: String,
    },
    noteB: {
        type: String,
    },
    noteC: {
        type: String,
    },
    noteD: {
        type: String,
    },
    noteF: {
        type: String,
    },
    MedicalSummary: {
        type: String,
    },
    Recommendation: {
        type: String,
    },
    price: { type: Number, required: false },
    images: { type: String }
});
// Main UltraTest schema with embedded TestSchema
const UltraTestSchema = new mongoose_1.Schema({
    patient: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
    status: {
        type: String,
        required: [true, 'Please provide a status'],
        enum: ['Pending', 'Cancel', 'Finish', 'Order'],
    },
    comments: { type: String, default: null },
    confirm: { type: Boolean, default: false },
    tests: [TestSchema], // Embedding multiple tests inside UltraTest
    createdBy: { type: userReferenceSchema_1.default, required: true },
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default,
            updateTime: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
const UltraTest = mongoose_1.default.model('UltraTest', UltraTestSchema);
exports.UltraTest = UltraTest;
