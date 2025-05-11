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
exports.filterExpensesByDate = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const expense_1 = __importDefault(require("../../models/expense"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
// Filter expenses by date range
const filterExpensesByDate = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
        throw new bad_request_1.default('Both startDate and endDate are required.');
    }
    try {
        const query = {};
        let startDateObj = null;
        let endDateObj = null;
        // Parse dates
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            throw new bad_request_1.default('Invalid date format.');
        }
        if (endDateObj < startDateObj) {
            throw new bad_request_1.default('End date must be greater than or equal to start date.');
        }
        // Adjust end date to include the end of the day
        endDateObj.setHours(23, 59, 59, 999);
        // Add date range filter to query
        query.createdAt = { $gte: startDateObj, $lte: endDateObj };
        // Fetch expenses based on the query
        const expenses = yield expense_1.default.find(query);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Expenses retrieved successfully.',
            success: true,
            data: expenses,
        });
    }
    catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to retrieve expenses.',
            success: false,
        });
    }
}));
exports.filterExpensesByDate = filterExpensesByDate;
