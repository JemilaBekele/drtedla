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
exports.getAggregatedData = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const history_1 = __importDefault(require("../../models/history"));
const card_1 = __importDefault(require("../../models/card"));
const expense_1 = __importDefault(require("../../models/expense"));
const Invoice_1 = __importDefault(require("../../models/Invoice"));
// GET: Fetch aggregated data for history, cards, expenses, and invoices
const getAggregatedData = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = new Date();
        // Calculate the start of the current week (Monday)
        const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) - 6 (Saturday)
        const startOfCurrentWeek = new Date(currentDate);
        startOfCurrentWeek.setDate(currentDate.getDate() - currentDayOfWeek + 1); // Adjust to Monday
        // Calculate the start and end of last week
        const startOfLastWeek = new Date(startOfCurrentWeek);
        startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7); // Move to previous week
        const endOfLastWeek = new Date(startOfCurrentWeek); // End of last week = start of current week
        // Calculate the start of the current month
        const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        // 1. Fetch and calculate total history amount for last week
        const lastWeekHistory = yield history_1.default.find({
            createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek },
        });
        const totalHistoryAmountLastWeek = lastWeekHistory.reduce((total, item) => { var _a; return total + (((_a = item.Invoice) === null || _a === void 0 ? void 0 : _a.amount) || 0); }, 0);
        // 2. Fetch and calculate total history amount for the current month
        const currentMonthHistory = yield history_1.default.find({
            createdAt: { $gte: startOfCurrentMonth, $lte: currentDate },
        });
        const totalHistoryAmountCurrentMonth = currentMonthHistory.reduce((total, item) => { var _a; return total + (((_a = item.Invoice) === null || _a === void 0 ? void 0 : _a.amount) || 0); }, 0);
        // 3. Fetch and calculate total card price for last week
        const lastWeekCards = yield card_1.default.find({
            createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek },
        });
        const totalCardPriceLastWeek = lastWeekCards.reduce((total, card) => total + (card.cardprice || 0), 0);
        // 4. Fetch and calculate total card price for the current month
        const currentMonthCards = yield card_1.default.find({
            createdAt: { $gte: startOfCurrentMonth, $lte: currentDate },
        });
        const totalCardPriceCurrentMonth = currentMonthCards.reduce((total, card) => total + (card.cardprice || 0), 0);
        // 5. Fetch and calculate total expense for last week
        const lastWeekExpense = yield expense_1.default.find({
            createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek },
        });
        const totalExpenseAmountLastWeek = lastWeekExpense.reduce((total, expense) => total + (expense.amount || 0), 0);
        // 6. Fetch and calculate total expense for the current month
        const currentMonthExpense = yield expense_1.default.find({
            createdAt: { $gte: startOfCurrentMonth, $lte: currentDate },
        });
        const totalExpenseCurrentMonth = currentMonthExpense.reduce((total, expense) => total + (expense.amount || 0), 0);
        // 7. Calculate grand totals for last week and current month
        const grandTotalLastWeek = totalHistoryAmountLastWeek + totalCardPriceLastWeek - totalExpenseAmountLastWeek;
        const grandTotalCurrentMonth = totalHistoryAmountCurrentMonth + totalCardPriceCurrentMonth - totalExpenseCurrentMonth;
        // 8. Fetch all invoices and calculate total balance
        const invoices = yield Invoice_1.default.find();
        const totalBalance = invoices.reduce((total, invoice) => total + (invoice.balance || 0), 0);
        // 9. Fetch all cards, history, and expenses for aggregation
        const allHistory = yield history_1.default.find();
        const allCards = yield card_1.default.find();
        const allExpenses = yield expense_1.default.find();
        const totalHistoryAmount = allHistory.reduce((total, item) => { var _a; return total + (((_a = item.Invoice) === null || _a === void 0 ? void 0 : _a.amount) || 0); }, 0);
        const totalCardPrice = allCards.reduce((total, card) => total + (card.cardprice || 0), 0);
        const totalExpenseAmount = allExpenses.reduce((total, expense) => total + (expense.amount || 0), 0);
        const grandTotal = totalHistoryAmount + totalCardPrice - totalExpenseAmount;
        // Return the aggregated results
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Aggregated data retrieved successfully',
            success: true,
            data: {
                lastWeek: {
                    totalHistoryAmount: totalHistoryAmountLastWeek,
                    totalCardPrice: totalCardPriceLastWeek,
                    totalExpenseAmount: totalExpenseAmountLastWeek,
                    grandTotal: grandTotalLastWeek,
                },
                currentMonth: {
                    totalHistoryAmount: totalHistoryAmountCurrentMonth,
                    totalCardPrice: totalCardPriceCurrentMonth,
                    totalExpenseAmount: totalExpenseCurrentMonth,
                    grandTotal: grandTotalCurrentMonth,
                },
                allTime: {
                    totalBalance,
                    totalHistoryAmount,
                    totalCardPrice,
                    totalExpenseAmount,
                    grandTotal,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching aggregated data:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to retrieve aggregated data.',
            success: false,
        });
    }
}));
exports.getAggregatedData = getAggregatedData;
