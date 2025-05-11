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
exports.deleteExpense = exports.updateExpense = exports.getAllExpenses = exports.createExpense = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const expense_1 = __importDefault(require("../../models/expense"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a new expense
const createExpense = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { description, amount } = req.body;
    if (!description || !amount) {
        throw new bad_request_1.default('Please provide all required fields: description and amount.');
    }
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    const newExpense = yield expense_1.default.create({
        description,
        amount,
        createdBy,
    });
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Expense created successfully',
        success: true,
        data: newExpense,
    });
}));
exports.createExpense = createExpense;
// Retrieve all expenses
const getAllExpenses = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expenses = yield expense_1.default.find({}).sort({ createdAt: -1 }); // Sort by most recent first
        res.status(http_status_codes_1.StatusCodes.OK).json({ expenses, count: expenses.length });
    }
    catch (error) {
        console.error('Error fetching services:', error);
        // Return a generic error response
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to fetch services',
        });
    }
}));
exports.getAllExpenses = getAllExpenses;
// Update an expense
const updateExpense = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = __rest(req.body, []);
    const { id } = req.params;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Expense ID is required.');
    }
    // Find and update the Expense by ID
    const updatedExpense = yield expense_1.default.findByIdAndUpdate(id, data, {
        new: true, // Return the updated document
        runValidators: true, // Ensure the update adheres to schema validation
    }).exec();
    if (!updatedExpense) {
        throw new not_found_1.default('Expense not found.');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Expense updated successfully',
        success: true,
        data: updatedExpense,
    });
}));
exports.updateExpense = updateExpense;
// Delete an expense
const deleteExpense = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Expense ID is required.');
    }
    // Find and delete the Expense by ID
    const deletedExpense = yield expense_1.default.findByIdAndDelete(id).exec();
    if (!deletedExpense) {
        throw new not_found_1.default('Expense not found.');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Expense deleted successfully',
        success: true,
    });
}));
exports.deleteExpense = deleteExpense;
