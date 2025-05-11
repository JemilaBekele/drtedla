"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/Service.js
const mongoose_1 = __importDefault(require("mongoose"));
const ServiceSchema = new mongoose_1.default.Schema({
    service: {
        type: String,
        required: true,
        unique: true,
        set: (v) => v.replace(/\s+/g, ''), // removes all spaces
        validate: {
            validator: function (v) {
                return !/\s/.test(v); // ensures no whitespace
            },
            message: 'Service name must not contain spaces',
        },
    },
    price: {
        type: Number,
        required: true,
    },
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category'
    },
}, { timestamps: true });
const Service = mongoose_1.default.models.Service || mongoose_1.default.model('Service', ServiceSchema);
exports.default = Service;
