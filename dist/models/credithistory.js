"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const CreditHistorySchema = new mongoose_1.default.Schema({
    Credit: {
        id: {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'Credit',
            required: [true, 'Please provide user ID'],
        },
        customerName: {
            id: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Patient', // Reference to Patient model
                required: [true, 'Please provide Patient ID'],
            }
        },
        created: {
            id: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User', // Reference to Patient model
                required: [true, 'Please provide Patient ID'],
            }
        },
    },
    createdBy: userReferenceSchema_1.default,
}, {
    timestamps: true,
    strictPopulate: false,
});
const CreditHistory = mongoose_1.default.models.CreditHistory || mongoose_1.default.model('CreditHistory', CreditHistorySchema);
exports.default = CreditHistory;
