"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const HistorySchema = new mongoose_1.default.Schema({
    Invoice: {
        id: {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'Invoice',
            required: [true, 'Please provide user ID'],
        },
        amount: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: 'Amount must be an integer',
            },
        },
        receipt: {
            type: Boolean,
            default: false,
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
                ref: 'Patient', // Reference to Patient model
                required: [true, 'Please provide Patient ID'],
            },
            username: {
                type: String,
                required: [true, 'Please provide Patient name'],
            },
        },
    },
    createdBy: userReferenceSchema_1.default,
}, {
    timestamps: true,
    strictPopulate: false,
});
const History = mongoose_1.default.models.History || mongoose_1.default.model('History', HistorySchema);
exports.default = History;
