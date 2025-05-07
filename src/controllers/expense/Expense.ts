import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Expense from '../../models/expense';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a new expense
const createExpense = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { description, amount } = req.body;

  if (!description || !amount) {
    throw new BadRequestError('Please provide all required fields: description and amount.');
  }

  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  const newExpense = await Expense.create({
    description,
    amount,
    createdBy,
  });

  res.status(StatusCodes.CREATED).json({
    message: 'Expense created successfully',
    success: true,
    data: newExpense,
  });
});

// Retrieve all expenses
const getAllExpenses = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  try {
  const expenses = await Expense.find({}).sort({ createdAt: -1 }); // Sort by most recent first
  res.status(StatusCodes.OK).json({expenses, count: expenses.length}); } catch (error) {
    console.error('Error fetching services:', error);

    // Return a generic error response
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch services',
    });
  }
}
);



// Update an expense
const updateExpense = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {  ...data } = req.body;
  const { id } = req.params;
  // Validate required fields
  if (!id) {
    throw new BadRequestError('Expense ID is required.');
  }

  // Find and update the Expense by ID
  const updatedExpense = await Expense.findByIdAndUpdate(id, data, {
    new: true, // Return the updated document
    runValidators: true, // Ensure the update adheres to schema validation
  }).exec();

  if (!updatedExpense) {
    throw new NotFoundError('Expense not found.');
  }

  res.status(StatusCodes.OK).json({
    message: 'Expense updated successfully',
    success: true,
    data: updatedExpense,
  });
});

// Delete an expense
const deleteExpense = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Expense ID is required.');
  }

  // Find and delete the Expense by ID
  const deletedExpense = await Expense.findByIdAndDelete(id).exec();

  if (!deletedExpense) {
    throw new NotFoundError('Expense not found.');
  }

  res.status(StatusCodes.OK).json({
    message: 'Expense deleted successfully',
    success: true,
  });
});




export { createExpense, getAllExpenses , updateExpense, deleteExpense };
