"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Expense_1 = require("../controllers/expense/Expense");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/').post(Expense_1.createExpense); // Create a new bicycle/// Get a single bicycle by ID
router.route('/').get(Expense_1.getAllExpenses); // Get all bicycles
router.route('/:id').delete(Expense_1.deleteExpense);
router.route('/:id').patch(Expense_1.updateExpense); // Delete a bicycle by ID
exports.default = router;
