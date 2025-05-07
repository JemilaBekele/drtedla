import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Expense from '../../models/expense';
import BadRequestError from '../../errors/bad-request';

interface Query {
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

// Filter expenses by date range
const filterExpensesByDate = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    throw new BadRequestError('Both startDate and endDate are required.');
  }

  try {
    const query: Query = {};
    let startDateObj: Date | null = null;
    let endDateObj: Date | null = null;

    // Parse dates
    startDateObj = new Date(startDate);
    endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new BadRequestError('Invalid date format.');
    }

    if (endDateObj < startDateObj) {
      throw new BadRequestError('End date must be greater than or equal to start date.');
    }

    // Adjust end date to include the end of the day
    endDateObj.setHours(23, 59, 59, 999);

    // Add date range filter to query
    query.createdAt = { $gte: startDateObj, $lte: endDateObj };

    // Fetch expenses based on the query
    const expenses = await Expense.find(query);

    res.status(StatusCodes.OK).json({
      message: 'Expenses retrieved successfully.',
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve expenses.',
      success: false,
    });
  }
});

export { filterExpensesByDate };
