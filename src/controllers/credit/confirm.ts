import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Credit from '../../models/creadit';
import CreditHistory from '../../models/credithistory';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
interface AuthenticatedRequest extends Request {
    user?: {
      userId: string;
      username: string;
    };
  }
  
// Retrieve unconfirmed Credits
const getUnconfirmedCredits = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  try {
    const unconfirmedCredits = await Credit.find({ 'currentPayment.confirm': false })
      .populate({ path: 'customerName.id', model: 'Patient' })
      .exec();

    if (unconfirmedCredits.length === 0) {
      res.status(StatusCodes.OK).json({
        message: 'No unconfirmed Credit records available',
        data: [],
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      message: 'Unconfirmed Credit records retrieved successfully',
      success: true,
      data: unconfirmedCredits,
    });
  } catch (error) {
    console.error('Error retrieving unconfirmed Credit records:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
    });
  }
});

// Update multiple Credits
const updateCredits = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { creditsToUpdate } = req.body;

  if (!Array.isArray(creditsToUpdate) || creditsToUpdate.length === 0) {
    throw new BadRequestError('No valid credits to update.');
  }

  const updatedCredits = [];
  const historyEntries = [];

  for (const { creditId, paymentAmount } of creditsToUpdate) {
    const credit = await Credit.findById(creditId);

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

    await credit.save();
    updatedCredits.push(credit);

    // Create CreditHistory
    const historyCredit = new CreditHistory({
      Credit: {
        id: credit._id,
        customerName: { id: credit.customerName.id },
        created: { id: credit.createdBy.id },
      },
      createdBy: {
        id: req.user?.userId || '',
        username: req.user?.username || '',
      },
    });

    await historyCredit.save();
    historyEntries.push(historyCredit);
  }

  res.status(StatusCodes.OK).json({
    message: 'Credits updated successfully',
    success: true,
    data: updatedCredits,
    CreditHistory: historyEntries,
  });
});

// Update a single Credit
const updateSingleCredit = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { CreditId, currentPayment } = req.body;

  const paymentAmount = Number(currentPayment);
  if (isNaN(paymentAmount)) {
    throw new BadRequestError('Invalid payment amount.');
  }

  const credit = await Credit.findById(CreditId);
  if (!credit) {
    throw new NotFoundError('Credit not found.');
  }

  // Update Credit details
  credit.totalPaid += paymentAmount;
  credit.balance = credit.totalAmount - credit.totalPaid;
  credit.currentPayment.amount = 0;
  credit.currentPayment.receipt = 0;
  credit.currentPayment.confirm = true;
  credit.currentPayment.date = new Date();
  credit.status = credit.totalPaid >= credit.totalAmount ? 'Paid' : 'Pending';

  await credit.save();

  // Create CreditHistory
  const historyCredit = new CreditHistory({
    Credit: {
      id: credit._id,
      customerName: { id: credit.customerName.id },
      created: { id: credit.createdBy.id },
    },
    createdBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
  });

  await historyCredit.save();

  res.status(StatusCodes.OK).json({
    message: 'Credit updated successfully',
    success: true,
    data: credit,
    CreditHistory: historyCredit,
  });
});

const updateCred = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { creditId, ...data } = req.body;
  
    // Validate required fields
    if (!creditId) {
      throw new BadRequestError('Credit ID is required');
    }
  
    // Find the Credit by ID
    const credit = await Credit.findById(creditId).exec();
    if (!credit) {
      throw new NotFoundError('Credit not found');
    }
  
    // Update the Credit with the provided data
    Object.assign(credit, data);
  
    // Set specific fields for the Credit
    credit.status = 'Paid';
    credit.currentPayment.confirm = true;
    credit.currentPayment.amount = 0;
  
    // Save the updated Credit
    await credit.save();
  
    res.status(StatusCodes.OK).json({
      message: 'Credit updated successfully',
      success: true,
      data: credit,
    });
  });

export { getUnconfirmedCredits, updateCredits, updateSingleCredit, updateCred };
