"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OrganizationSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
    },
    website: {
        type: String,
    },
    email: {
        type: String,
    },
}, {
    timestamps: true,
    strictPopulate: false,
});
const Organization = mongoose_1.default.models.Organization || mongoose_1.default.model('Organization', OrganizationSchema);
exports.default = Organization;
