import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Service from '../../models/Services';
import Invoice from '../../models/Invoice';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import Category from '../../models/catagory';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a new invoice
const createInvoice = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const { items, currentpayment, status } = req.body;

  console.log(req.body);

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  const validStatuses = ['Paid', 'Pending', 'Cancel', 'order'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError('Invalid status value.');
  }

  // Find the patient by ID
  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found.');
  }
  const categoryId = items.map((item: any) => item.categoryId);
  const Categoryes = await Category.find({ _id: { $in: categoryId } });
  const CategoryesMap = new Map(Categoryes.map((Category) => [Category._id.toString(), Category]));

  for (const item of items) {
    if (!item?.categoryId || !CategoryesMap.has(item?.categoryId)) {
      throw new NotFoundError(`Service with ID ${item?.categoryId} not found.`);
    }
  }
  // Validate services in the items
  const serviceIds = items.map((item: any) => item.service.id);
  const services = await Service.find({ _id: { $in: serviceIds } });
  const serviceMap = new Map(services.map((service) => [service._id.toString(), service]));

  for (const item of items) {
    if (!item.service?.id || !serviceMap.has(item.service.id)) {
      throw new NotFoundError(`Service with ID ${item.service?.id} not found.`);
    }
  }

  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  // Map items with the validated services
  const mappedItems = items.map((item: any) => ({
    categoryId:item.categoryId,
    service: {
      id: item.service.id,
      service: item.service.service, // Include the service name from the object
    },
    description: item.description,
    quantity: item.quantity,
    price: item.price,
    totalPrice: item.quantity * item.price, // Calculate total price
  }));

  // Create the new invoice
  const newInvoice = new Invoice({
    items: mappedItems,
    customerName: { id: patient._id },
    currentpayment,
    status,
    createdBy,
    totalAmount: mappedItems.reduce((total: any, item: { totalPrice: any; }) => total + item.totalPrice, 0), // Calculate total amount
  });

  const savedInvoice = await newInvoice.save();

  // Link the invoice to the patient
  patient.Invoice = patient.Invoice || [];
  patient.Invoice.push(savedInvoice._id);
  await patient.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Invoice created successfully.',
    success: true,
    data: savedInvoice,
  });
});


// Retrieve all invoices for a specific patient
const getInvoices = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required.');
  }

  // Find the patient by ID and populate invoices
  const patient = await Patient.findById(id).populate('Invoice').exec();
  if (!patient) {
    throw new NotFoundError('Patient not found.');
  }

  if (!patient.Invoice || patient.Invoice.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No invoices available for this patient.',
      data: [],
    });
    return;
  }

  // Sort invoices by `createdAt` in descending order
  const sortedInvoices = patient.Invoice.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.status(StatusCodes.OK).json({
    message: 'Invoices retrieved successfully.',
    success: true,
    data: sortedInvoices,
  });
});




// GET: Retrieve invoice details
const getInvoiceDetails = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { invoiceId } = req.body; // Assuming the invoiceId is passed in the request body

  // Validate required fields
  if (!invoiceId) {
    throw new BadRequestError('Invoice ID is required');
  }

  // Find the invoice by ID
  const invoice = await Invoice.findById(invoiceId).exec();
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  res.status(StatusCodes.OK).json(invoice);
});

// DELETE: Delete an invoice
const deleteInvoice = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { invoiceId } = req.body; // Assuming the invoiceId is passed in the request body

  // Validate required fields
  if (!invoiceId) {
    throw new BadRequestError('Invoice ID is required');
  }

  // Find and delete the invoice
  const deletedInvoice = await Invoice.findByIdAndDelete(invoiceId).exec();
  if (!deletedInvoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Remove the invoice reference from the associated patient's record
  const patient = await Patient.findOneAndUpdate(
    { Invoice: invoiceId }, // Find the patient with this invoice ID
    { $pull: { Invoice: invoiceId } }, // Remove the invoice ID from the array
    { new: true } // Return the updated patient document
  );

  if (!patient) {
    console.warn(`No patient found with Invoice ID: ${invoiceId}`);
  }

  res.status(StatusCodes.OK).json({
    message: 'Invoice deleted successfully and reference removed from patient',
    success: true,
  });
});

// PATCH: Update an invoice
const updateInvoice = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { invoiceId, currentpayment, ...data } = req.body;

  if (!invoiceId) {
    throw new BadRequestError('Invoice ID is required');
  }
console.log(currentpayment)
  const invoice = await Invoice.findById(invoiceId).exec();
  console.log(invoice)
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Update invoice fields
  Object.assign(invoice, data);

  invoice.createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  // Update total paid

  const totalAmount = invoice.totalAmount ?? 0;
  const previousTotalPaid = invoice.totalpaid ?? 0;
  console.log(previousTotalPaid)
  invoice.balance = totalAmount - previousTotalPaid;
  
  invoice.currentpayment.amount = currentpayment.amount
  // Set confirm to false if current payment is greater than 1
  if (currentpayment?.amount > 0) {
 
    invoice.currentpayment.confirm = false;
  }

  await invoice.save();

  res.status(StatusCodes.OK).json({
    message: 'Invoice updated successfully',
    success: true,
    data: invoice,
  });
});









export { createInvoice, getInvoices , getInvoiceDetails, deleteInvoice, updateInvoice};
