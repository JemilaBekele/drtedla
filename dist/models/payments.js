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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
// Payment Transaction Schema
const PaymentTransactionSchema = new mongoose_1.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    receivedBy: { type: userReferenceSchema_1.default }
});
// Main Payment Schema
const PaymentSchema = new mongoose_1.Schema({
    labTest: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'LabTest',
    },
    ultraTest: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'UltraTest', // Correct reference to UltraTest model
    },
    customerName: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Patient',
    },
    OrderBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    totalAmount: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        default: 0,
        min: 0
    },
    amountDue: {
        type: Number,
        default: function () {
            return this.totalAmount - this.amountPaid;
        },
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    order: {
        type: Number,
        default: 1
    },
    paymentHistory: [PaymentTransactionSchema],
    createdBy: { type: userReferenceSchema_1.default, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
// Middleware to calculate total amount before saving
PaymentSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            let total = 0;
            if (this.labTest) {
                const labTest = yield mongoose_1.default.model('LabTest').findById(this.labTest)
                    .populate('sections.tests');
                labTest === null || labTest === void 0 ? void 0 : labTest.sections.forEach((section) => {
                    section.tests.forEach(test => {
                        total += test.price || 0;
                    });
                });
            }
            if (this.ultraTest) {
                const ultraTest = yield mongoose_1.default.model('UltraTest').findById(this.ultraTest);
                ultraTest === null || ultraTest === void 0 ? void 0 : ultraTest.tests.forEach((test) => {
                    total += test.price || 0;
                });
            }
            this.totalAmount = total;
            this.amountDue = total - this.amountPaid;
        }
        next();
    });
});
// Update amountDue and status when amountPaid changes
PaymentSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.amountPaid >= this.totalAmount) {
            this.status = 'paid';
        }
        else {
            this.status = 'pending';
        }
        this.amountDue = this.totalAmount - this.amountPaid;
        next();
    });
});
const Payment = mongoose_1.default.model('Payment', PaymentSchema);
exports.default = Payment;
