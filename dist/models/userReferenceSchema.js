"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/userReferenceSchema.ts
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema = new mongoose_1.default.Schema({
    id: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
    username: {
        type: String,
        required: [true, 'Please provide sender name'],
    },
}, { _id: false });
exports.default = userReferenceSchema;
