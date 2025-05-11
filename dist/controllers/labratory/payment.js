"use strict";
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
exports.getultraCustomerId = exports.updatePaymentAmount = exports.getPaymentsByCustomerId = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const payments_1 = __importDefault(require("../../models/payments"));
const getPaymentsByCustomerId = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new bad_request_1.default('Customer ID is required.');
    }
    const payments = yield payments_1.default.find({
        customerName: id, // Filter by customer ID
        labTest: { $exists: true, $ne: null } // Ensure labTest field exists and is not null
    })
        .populate('labTest') // Populate labTest details for the found payments
        .populate('OrderBy');
    res.status(http_status_codes_1.StatusCodes.OK).json({ payments });
}));
exports.getPaymentsByCustomerId = getPaymentsByCustomerId;
const getultraCustomerId = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new bad_request_1.default('Customer ID is required.');
    }
    const payments = yield payments_1.default.find({
        customerName: id, // Filter by customer ID
        ultraTest: { $exists: true, $ne: null } // Ensure labTest field exists and is not null
    })
        .populate('ultraTest') // Populate labTest details for the found payments
        .populate('OrderBy');
    res.status(http_status_codes_1.StatusCodes.OK).json({ payments });
}));
exports.getultraCustomerId = getultraCustomerId;
const updatePaymentAmount = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { amountPaid } = req.body;
    if (!id || amountPaid === undefined) {
        throw new bad_request_1.default('Payment ID and new amountPaid are required.');
    }
    // Find the payment by ID
    const payment = yield payments_1.default.findById(id);
    if (!payment) {
        throw new not_found_1.default('Payment not found.');
    }
    // Add the new amountPaid to the existing amountPaid
    payment.amountPaid += amountPaid;
    // Calculate the new amount due and update payment status
    payment.amountDue = payment.totalAmount - payment.amountPaid;
    payment.status = payment.amountPaid >= payment.totalAmount ? 'paid' : 'pending';
    payment.updatedAt = new Date();
    // Create a new payment transaction record
    const newTransaction = {
        amount: amountPaid, // Record the new payment amount (the addition to the existing amountPaid)
        receivedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        }, // User making the update
        date: new Date(),
    };
    // Add the new transaction to the payment history
    payment.paymentHistory.push(newTransaction);
    // Save the updated payment
    yield payment.save();
    // Respond with the updated payment details
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Payment updated', payment });
}));
exports.updatePaymentAmount = updatePaymentAmount;
