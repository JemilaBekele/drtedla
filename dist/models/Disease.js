"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const DiseaseSchema = new mongoose_1.default.Schema({
    disease: {
        type: String,
        required: [true, 'Please provide a Disease'],
        trim: true,
        unique: true
    },
    createdBy: userReferenceSchema_1.default,
}, {
    timestamps: true,
    strictPopulate: false,
});
const Disease = mongoose_1.default.models.Disease || mongoose_1.default.model('Disease', DiseaseSchema);
exports.default = Disease;
