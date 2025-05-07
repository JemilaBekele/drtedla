
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';

import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

import Payment from '../../models/payments';




interface AuthenticatedRequest extends Request {
    user?: {
      userId: string;
      username: string;
    };
  }

const getPaymentsByCustomerId = asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;
  
    if (!id) {
      throw new BadRequestError('Customer ID is required.');
    }
  
    const payments = await Payment.find({
      customerName: id,                  // Filter by customer ID
      labTest: { $exists: true, $ne: null } // Ensure labTest field exists and is not null
    })
    .populate('labTest')                 // Populate labTest details for the found payments
    .populate('OrderBy');
  
    res.status(StatusCodes.OK).json({ payments });
  });
  
  const getultraCustomerId = asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;
  
    if (!id) {
      throw new BadRequestError('Customer ID is required.');
    }
  
    const payments = await Payment.find({
      customerName: id,                  // Filter by customer ID
      ultraTest: { $exists: true, $ne: null } // Ensure labTest field exists and is not null
    })
    .populate('ultraTest')                 // Populate labTest details for the found payments
    .populate('OrderBy');
  
    res.status(StatusCodes.OK).json({ payments });
  });


  const updatePaymentAmount = asyncWrapper(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { amountPaid } = req.body;
  
    if (!id || amountPaid === undefined) {
      throw new BadRequestError('Payment ID and new amountPaid are required.');
    }
  
    // Find the payment by ID
    const payment = await Payment.findById(id);
    if (!payment) {
      throw new NotFoundError('Payment not found.');
    }
  
    // Add the new amountPaid to the existing amountPaid
    payment.amountPaid += amountPaid;
  
    // Calculate the new amount due and update payment status
    payment.amountDue = payment.totalAmount - payment.amountPaid;
    payment.status = payment.amountPaid >= payment.totalAmount ? 'paid' : 'pending';
    payment.updatedAt = new Date();
  
    // Create a new payment transaction record
    const newTransaction = {
      amount: amountPaid, // Record the new payment amount (the addition to the existing amountPaid)
      receivedBy: {
        id: req.user?.userId || '',
        username: req.user?.username || '',
      }, // User making the update
      date: new Date(),
    };
  
    // Add the new transaction to the payment history
    payment.paymentHistory.push(newTransaction);
    
    // Save the updated payment
    await payment.save();
  
    // Respond with the updated payment details
    res.status(StatusCodes.OK).json({ message: 'Payment updated', payment });
  });
  
  


export {getPaymentsByCustomerId,updatePaymentAmount,getultraCustomerId

};