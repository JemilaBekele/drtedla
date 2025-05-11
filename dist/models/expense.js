"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const ExpenseSchema = new mongoose_1.default.Schema({
    description: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    createdBy: userReferenceSchema_1.default,
}, {
    timestamps: true,
    strictPopulate: false,
});
const Expense = mongoose_1.default.models.Expense || mongoose_1.default.model('Expense', ExpenseSchema);
exports.default = Expense;
