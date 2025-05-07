import express from 'express';
import {  createExpense, getAllExpenses , updateExpense, deleteExpense } from '../controllers/expense/Expense';

const router = express.Router();

// Define routes for Bicycle
router.route('/').post(createExpense);               // Create a new bicycle/// Get a single bicycle by ID
router.route('/').get(getAllExpenses);                  // Get all bicycles
router.route('/:id').delete(deleteExpense);
router.route('/:id').patch(updateExpense);           // Delete a bicycle by ID

export default router;
