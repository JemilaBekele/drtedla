"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CategorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    Imaging: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });
const Category = mongoose_1.default.models.Category || mongoose_1.default.model('Category', CategorySchema);
exports.default = Category;
//91 upper  rec
//99 ultra
//97 lab
//91  admin
//94 doctor
