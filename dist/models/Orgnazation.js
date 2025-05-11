"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const OrgnazationSchema = new mongoose_1.default.Schema({
    patient: {
        id: {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'Patient',
            required: [true, 'Please provide Patient ID'],
        }
    },
    organization: {
        type: String,
        required: [true, 'Please provide a status'],
    },
    createdBy: userReferenceSchema_1.default,
}, {
    timestamps: true,
    strictPopulate: false,
});
const Orgnazation = mongoose_1.default.models.Orgnazation || mongoose_1.default.model('Orgnazation', OrgnazationSchema);
exports.default = Orgnazation;
