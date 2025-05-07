import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import History from '../../models/history';
import Card from '../../models/card';
import Expense from '../../models/expense';
import Invoice from '../../models/Invoice';

// GET: Fetch aggregated data for history, cards, expenses, and invoices
const getAggregatedData = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
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
    const lastWeekHistory = await History.find({
      createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek },
    });

    const totalHistoryAmountLastWeek = lastWeekHistory.reduce(
      (total, item) => total + (item.Invoice?.amount || 0),
      0
    );

    // 2. Fetch and calculate total history amount for the current month
    const currentMonthHistory = await History.find({
      createdAt: { $gte: startOfCurrentMonth, $lte: currentDate },
    });

    const totalHistoryAmountCurrentMonth = currentMonthHistory.reduce(
      (total, item) => total + (item.Invoice?.amount || 0),
      0
    );

    // 3. Fetch and calculate total card price for last week
    const lastWeekCards = await Card.find({
      createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek },
    });

    const totalCardPriceLastWeek = lastWeekCards.reduce(
      (total, card) => total + (card.cardprice || 0),
      0
    );

    // 4. Fetch and calculate total card price for the current month
    const currentMonthCards = await Card.find({
      createdAt: { $gte: startOfCurrentMonth, $lte: currentDate },
    });

    const totalCardPriceCurrentMonth = currentMonthCards.reduce(
      (total, card) => total + (card.cardprice || 0),
      0
    );

    // 5. Fetch and calculate total expense for last week
    const lastWeekExpense = await Expense.find({
      createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek },
    });

    const totalExpenseAmountLastWeek = lastWeekExpense.reduce(
      (total, expense) => total + (expense.amount || 0),
      0
    );

    // 6. Fetch and calculate total expense for the current month
    const currentMonthExpense = await Expense.find({
      createdAt: { $gte: startOfCurrentMonth, $lte: currentDate },
    });

    const totalExpenseCurrentMonth = currentMonthExpense.reduce(
      (total, expense) => total + (expense.amount || 0),
      0
    );

    // 7. Calculate grand totals for last week and current month
    const grandTotalLastWeek =
      totalHistoryAmountLastWeek + totalCardPriceLastWeek - totalExpenseAmountLastWeek;
    const grandTotalCurrentMonth =
      totalHistoryAmountCurrentMonth + totalCardPriceCurrentMonth - totalExpenseCurrentMonth;

    // 8. Fetch all invoices and calculate total balance
    const invoices = await Invoice.find();
    const totalBalance = invoices.reduce((total, invoice) => total + (invoice.balance || 0), 0);

    // 9. Fetch all cards, history, and expenses for aggregation
    const allHistory = await History.find();
    const allCards = await Card.find();
    const allExpenses = await Expense.find();

    const totalHistoryAmount = allHistory.reduce(
      (total, item) => total + (item.Invoice?.amount || 0),
      0
    );
    const totalCardPrice = allCards.reduce((total, card) => total + (card.cardprice || 0), 0);
    const totalExpenseAmount = allExpenses.reduce(
      (total, expense) => total + (expense.amount || 0),
      0
    );

    const grandTotal = totalHistoryAmount + totalCardPrice - totalExpenseAmount;

    // Return the aggregated results
    res.status(StatusCodes.OK).json({
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
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve aggregated data.',
      success: false,
    });
  }
});

export { getAggregatedData };
