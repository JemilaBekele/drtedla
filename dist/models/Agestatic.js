"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AgeSchema = new mongoose_1.default.Schema({
    patient: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
}, {
    timestamps: true,
    strictPopulate: false,
});
const Age = mongoose_1.default.models.Age || mongoose_1.default.model('Age', AgeSchema);
exports.default = Age;
