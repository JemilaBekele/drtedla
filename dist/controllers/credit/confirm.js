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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCred = exports.updateSingleCredit = exports.updateCredits = exports.getUnconfirmedCredits = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const creadit_1 = __importDefault(require("../../models/creadit"));
const credithistory_1 = __importDefault(require("../../models/credithistory"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Retrieve unconfirmed Credits
const getUnconfirmedCredits = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unconfirmedCredits = yield creadit_1.default.find({ 'currentPayment.confirm': false })
            .populate({ path: 'customerName.id', model: 'Patient' })
            .exec();
        if (unconfirmedCredits.length === 0) {
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: 'No unconfirmed Credit records available',
                data: [],
            });
            return;
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Unconfirmed Credit records retrieved successfully',
            success: true,
            data: unconfirmedCredits,
        });
    }
    catch (error) {
        console.error('Error retrieving unconfirmed Credit records:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getUnconfirmedCredits = getUnconfirmedCredits;
// Update multiple Credits
const updateCredits = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { creditsToUpdate } = req.body;
    if (!Array.isArray(creditsToUpdate) || creditsToUpdate.length === 0) {
        throw new bad_request_1.default('No valid credits to update.');
    }
    const updatedCredits = [];
    const historyEntries = [];
    for (const { creditId, paymentAmount } of creditsToUpdate) {
        const credit = yield creadit_1.default.findById(creditId);
        if (!credit) {
            console.warn(`Credit not found for ID: ${creditId}`);
            continue;
        }
        const amount = Number(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            console.warn(`Invalid payment amount for credit ID: ${creditId}`);
            continue;
        }
        // Update Credit details
        credit.totalPaid += amount;
        credit.balance = credit.totalAmount - credit.totalPaid;
        credit.currentPayment.amount = 0;
        credit.currentPayment.receipt = 0;
        credit.currentPayment.confirm = true;
        credit.currentPayment.date = new Date();
        credit.status = credit.totalPaid >= credit.totalAmount ? 'Paid' : 'Pending';
        yield credit.save();
        updatedCredits.push(credit);
        // Create CreditHistory
        const historyCredit = new credithistory_1.default({
            Credit: {
                id: credit._id,
                customerName: { id: credit.customerName.id },
                created: { id: credit.createdBy.id },
            },
            createdBy: {
                id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
                username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
            },
        });
        yield historyCredit.save();
        historyEntries.push(historyCredit);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Credits updated successfully',
        success: true,
        data: updatedCredits,
        CreditHistory: historyEntries,
    });
}));
exports.updateCredits = updateCredits;
// Update a single Credit
const updateSingleCredit = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { CreditId, currentPayment } = req.body;
    const paymentAmount = Number(currentPayment);
    if (isNaN(paymentAmount)) {
        throw new bad_request_1.default('Invalid payment amount.');
    }
    const credit = yield creadit_1.default.findById(CreditId);
    if (!credit) {
        throw new not_found_1.default('Credit not found.');
    }
    // Update Credit details
    credit.totalPaid += paymentAmount;
    credit.balance = credit.totalAmount - credit.totalPaid;
    credit.currentPayment.amount = 0;
    credit.currentPayment.receipt = 0;
    credit.currentPayment.confirm = true;
    credit.currentPayment.date = new Date();
    credit.status = credit.totalPaid >= credit.totalAmount ? 'Paid' : 'Pending';
    yield credit.save();
    // Create CreditHistory
    const historyCredit = new credithistory_1.default({
        Credit: {
            id: credit._id,
            customerName: { id: credit.customerName.id },
            created: { id: credit.createdBy.id },
        },
        createdBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
    });
    yield historyCredit.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Credit updated successfully',
        success: true,
        data: credit,
        CreditHistory: historyCredit,
    });
}));
exports.updateSingleCredit = updateSingleCredit;
const updateCred = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { creditId } = _a, data = __rest(_a, ["creditId"]);
    // Validate required fields
    if (!creditId) {
        throw new bad_request_1.default('Credit ID is required');
    }
    // Find the Credit by ID
    const credit = yield creadit_1.default.findById(creditId).exec();
    if (!credit) {
        throw new not_found_1.default('Credit not found');
    }
    // Update the Credit with the provided data
    Object.assign(credit, data);
    // Set specific fields for the Credit
    credit.status = 'Paid';
    credit.currentPayment.confirm = true;
    credit.currentPayment.amount = 0;
    // Save the updated Credit
    yield credit.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Credit updated successfully',
        success: true,
        data: credit,
    });
}));
exports.updateCred = updateCred;
