"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const OrderSchema = new mongoose_1.default.Schema({
    assignedDoctorTo: {
        id: {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide user ID'],
        },
        username: {
            type: String,
            required: [true, 'Please provide username'],
        },
    },
    patientId: {
        id: {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'Patient',
            required: [true, 'Please provide Patient ID'],
        }
    },
    createdBy: userReferenceSchema_1.default,
    status: {
        type: String,
        required: [true, 'Please provide a status'],
        enum: ['Active', 'Inactive'],
    },
}, {
    timestamps: true,
    strictPopulate: false,
});
const Order = mongoose_1.default.models.Order || mongoose_1.default.model('Order', OrderSchema);
exports.default = Order;
