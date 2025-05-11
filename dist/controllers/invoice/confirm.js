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
exports.getInvoices = exports.updateInvoiceWithHistory = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Invoice_1 = __importDefault(require("../../models/Invoice"));
const history_1 = __importDefault(require("../../models/history"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const Patient_1 = __importDefault(require("../../models/Patient"));
// Update an invoice and create a history entry
const updateInvoiceWithHistory = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { invoiceId, currentpayment, receiptvalue } = req.body;
    // Validate required fields
    if (!invoiceId) {
        throw new bad_request_1.default('Invoice ID is required.');
    }
    if (!currentpayment || receiptvalue === undefined) {
        throw new bad_request_1.default('Current payment and receipt value are required.');
    }
    // Find the invoice by ID
    const invoice = yield Invoice_1.default.findById(invoiceId).exec();
    if (!invoice) {
        throw new not_found_1.default('Invoice not found.');
    }
    // Update the invoice details
    invoice.totalpaid += currentpayment; // Add the current payment to the total paid
    invoice.balance = invoice.totalAmount - invoice.totalpaid; // Recalculate the balance
    invoice.currentpayment.amount = 0; // Reset the current payment amount
    invoice.currentpayment.receipt = receiptvalue; // Update the receipt value
    invoice.currentpayment.confirm = true; // Mark the payment as confirmed
    invoice.currentpayment.date = new Date(); // Set the current date
    // Update the status based on payment
    invoice.status = invoice.totalpaid >= invoice.totalAmount ? 'Paid' : 'Pending';
    // Save the updated invoice
    yield invoice.save();
    // Create a history record
    const historyEntry = new history_1.default({
        Invoice: {
            id: invoice._id,
            amount: currentpayment,
            receipt: receiptvalue,
            customerName: {
                id: invoice.customerName.id
            },
            created: {
                id: invoice.createdBy.id,
                username: invoice.createdBy.username,
            },
        },
        createdBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
    });
    // Save the history record
    yield historyEntry.save();
    // Return a success response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Invoice updated successfully',
        success: true,
        data: invoice,
        history: historyEntry,
    });
}));
exports.updateInvoiceWithHistory = updateInvoiceWithHistory;
const getInvoices = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Patient_1.default.find({});
        // Fetch invoices where `currentpayment.confirm` is false and populate patient details
        const invoices = yield Invoice_1.default.find({ "currentpayment.confirm": false })
            .populate({
            path: "customerName.id", // Populate the patient reference
            model: "Patient", // Specify model to avoid conflicts
            select: "firstname cardno", // Only fetch required fields
        })
            .exec();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Invoices retrieved successfully.",
            success: true,
            data: invoices,
        });
    }
    catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve invoices.",
            success: false,
        });
    }
}));
exports.getInvoices = getInvoices;
