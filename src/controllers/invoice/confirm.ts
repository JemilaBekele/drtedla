import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Invoice from '../../models/Invoice';
import History from '../../models/history';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import Patient from '../../models/Patient';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Update an invoice and create a history entry
const updateInvoiceWithHistory = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { invoiceId, currentpayment, receiptvalue } = req.body;

  // Validate required fields
  if (!invoiceId) {
    throw new BadRequestError('Invoice ID is required.');
  }

  if (!currentpayment || receiptvalue === undefined) {
    throw new BadRequestError('Current payment and receipt value are required.');
  }

  // Find the invoice by ID
  const invoice = await Invoice.findById(invoiceId).exec();
  if (!invoice) {
    throw new NotFoundError('Invoice not found.');
  }

  // Update the invoice details
  invoice.totalpaid += currentpayment; // Add the current payment to the total paid
  invoice.balance = invoice.totalAmount - invoice.totalpaid; // Recalculate the balance
  invoice.currentpayment.amount = 0; // Reset the current payment amount
  invoice.currentpayment.receipt = receiptvalue; // Update the receipt value
  invoice.currentpayment.confirm = true; // Mark the payment as confirmed
  invoice.currentpayment.date = new Date(); // Set the current date

  // Update the status based on payment
  invoice.status = invoice.totalpaid >= invoice.totalAmount ? 'Paid' : 'Pending';

  // Save the updated invoice
  await invoice.save();

  // Create a history record
  const historyEntry = new History({
    Invoice: {
      id: invoice._id,
      amount: currentpayment,
      receipt: receiptvalue,
      customerName: {
        id: invoice.customerName.id
      },
      created: {
        id: invoice.createdBy.id,
        username: invoice.createdBy.username,
      },
    },
    createdBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
  });

  // Save the history record
  await historyEntry.save();

  // Return a success response
  res.status(StatusCodes.OK).json({
    message: 'Invoice updated successfully',
    success: true,
    data: invoice,
    history: historyEntry,
  });
});





const getInvoices = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    await Patient.find({});
    // Fetch invoices where `currentpayment.confirm` is false and populate patient details
    const invoices = await Invoice.find({ "currentpayment.confirm": false })
      .populate({
        path: "customerName.id", // Populate the patient reference
        model: "Patient", // Specify model to avoid conflicts
        select: "firstname cardno", // Only fetch required fields
      })
      .exec();

    res.status(StatusCodes.OK).json({
      message: "Invoices retrieved successfully.",
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to retrieve invoices.",
      success: false,
    });
  }
});







export { updateInvoiceWithHistory,getInvoices };
