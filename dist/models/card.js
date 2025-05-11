"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const CardSchema = new mongoose_1.default.Schema({
    patient: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
    cardprice: {
        type: Number,
        required: true,
        default: 200, // Calculated based on items
    },
    createdBy: userReferenceSchema_1.default,
}, {
    timestamps: true,
    strictPopulate: false,
});
const Card = mongoose_1.default.models.Card || mongoose_1.default.model('Card', CardSchema);
exports.default = Card;
