"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UltranoteSchema = new mongoose_1.default.Schema({
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
    Ultra: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'UltraTest',
        required: [true, 'Please provide ultra ID']
    },
}, {
    timestamps: true,
    strictPopulate: false,
});
const Ultranote = mongoose_1.default.models.Ultranote || mongoose_1.default.model('Ultranote', UltranoteSchema);
exports.default = Ultranote;
