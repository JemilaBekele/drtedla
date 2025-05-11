"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ImageSchema = new mongoose_1.default.Schema({
    image: {
        type: String,
        required: false, // Optional: set to true if you want to require an image
        default: null, // Default value if no image is provided
    },
    patientId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
}, { timestamps: true });
// Avoid model recompilation during hot reloads
const Image = mongoose_1.default.models.Image || mongoose_1.default.model('Image', ImageSchema);
exports.default = Image;
