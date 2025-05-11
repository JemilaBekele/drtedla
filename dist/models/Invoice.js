"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
// Define the schema for each item in the invoice
const InvoiceItemSchema = new mongoose_1.Schema({
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category', // Reference to Service model
        required: [true, 'Please provide Category ID'],
    },
    service: {
        id: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Service', // Reference to Service model
            required: [true, 'Please provide Service ID'],
        },
        service: {
            type: String,
            required: [true, 'Please provide Service name'],
        },
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: function () {
            return this.quantity * this.price;
        },
    },
}, { _id: false });
// Define the main Invoice schema
const InvoiceSchema = new mongoose_1.Schema({
    items: [InvoiceItemSchema], // Array of invoice items
    invoiceDate: {
        type: Date,
        default: Date.now,
    },
    customerName: {
        id: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Patient', // Reference to Patient model
            required: [true, 'Please provide Patient ID'],
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    totalpaid: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    currentpayment: {
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        confirm: {
            type: Boolean,
            default: false,
        },
        receipt: {
            type: Boolean,
            default: false,
        },
    },
    status: {
        type: String,
        required: [true, 'Please provide a status'],
        enum: ['Paid', 'Pending', 'Cancel', 'order'],
    },
    createdBy: userReferenceSchema_1.default,
}, { timestamps: true });
// Pre-save hook to calculate the totalAmount, balance, and totalpaid before saving
InvoiceSchema.pre('save', function (next) {
    // Calculate the total amount by summing the totalPrice of all items
    this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    // Update the balance (totalAmount - totalpaid)
    this.balance = this.totalAmount - this.totalpaid;
    next();
});
// Create and export the Invoice model
const Invoice = mongoose_1.default.models.Invoice || mongoose_1.default.model('Invoice', InvoiceSchema);
exports.default = Invoice;
