import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Service from '../../models/Services';
import Credit from '../../models/creadit';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';



interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}


// Create a new credit
const createCredit = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const { items, currentPayment, status } = req.body;

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  const validStatuses = ['Paid', 'Pending', 'Cancel', 'Credit'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError('Invalid status value.');
  }

  // Find the patient by ID
  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found.');
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
    service: {
      id: item.service.id,
      service: item.service.service, // Include the service name from the object
    },
    description: item.description,
    quantity: item.quantity,
    price: item.price,
    totalPrice: item.quantity * item.price, // Calculate total price
  }));

  // Create the new credit
  const newCredit = new Credit({
    items: mappedItems,
    customerName: { id: patient._id },
    currentPayment,
    status,
    createdBy,
    totalAmount: mappedItems.reduce((total: any, item: { totalPrice: any; }) => total + item.totalPrice, 0),
  });

  const savedCredit = await newCredit.save();

  // Link the credit to the patient
  patient.Credit = patient.Credit || [];
  patient.Credit.push(savedCredit._id);
  await patient.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Credit record created successfully.',
    success: true,
    data: savedCredit,
  });
});

// Retrieve all credits for a specific patient
const getCredits = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required.');
  }

  // Find the patient by ID and populate credits
  const patient = await Patient.findById(id).populate('Credit').exec();
  if (!patient) {
    throw new NotFoundError('Patient not found.');
  }

  if (!patient.Credit || patient.Credit.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No Credit records available for this patient.',
      data: [],
    });
    return;
  }

  // Sort credits by `createdAt` in descending order
  const sortedCredits = patient.Credit.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.status(StatusCodes.OK).json({
    message: 'Credit records retrieved successfully.',
    success: true,
    data: sortedCredits,
  });
});

// GET: Retrieve credit details
const getCreditById = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { creditId } = req.body; // Assuming the creditId is passed in the request body

  // Validate required fields
  if (!creditId) {
    throw new BadRequestError('Credit ID is required');
  }

  // Find the credit by ID
  const credit = await Credit.findById(creditId).exec();
  if (!credit) {
    throw new NotFoundError('Credit not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Credit retrieved successfully.',
    success: true,
    data: credit,
  });
});

// DELETE: Delete a credit
const deleteCredit = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { creditId } = req.body; // Assuming the creditId is passed in the request body

  // Validate required fields
  if (!creditId) {
    throw new BadRequestError('Credit ID is required');
  }

  // Find and delete the credit
  const deletedCredit = await Credit.findByIdAndDelete(creditId).exec();
  if (!deletedCredit) {
    throw new NotFoundError('Credit not found');
  }

  // Remove the credit reference from the associated patient's record
  const patient = await Patient.findOneAndUpdate(
    { Credit: creditId }, // Find the patient with this credit ID
    { $pull: { Credit: creditId } }, // Remove the credit ID from the array
    { new: true } // Return the updated patient document
  );

  if (!patient) {
    console.warn(`No patient found with Credit ID: ${creditId}`);
  }

  res.status(StatusCodes.OK).json({
    message: 'Credit deleted successfully and reference removed from patient.',
    success: true,
  });
});

// PATCH: Update a credit
const updateCredit = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { creditId, ...data } = req.body; // Extract creditId and the data to update

  // Validate required fields
  if (!creditId) {
    throw new BadRequestError('Credit ID is required');
  }

  // Find the credit by ID
  const credit = await Credit.findById(creditId).exec();
  if (!credit) {
    throw new NotFoundError('Credit not found');
  }

  // Update the credit with the provided data
  Object.assign(credit, data);

  // Recalculate the balance

  credit.createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };
  credit.balance = credit.totalAmount - credit.totalPaid;

  // Save the updated credit
  await credit.save();

  res.status(StatusCodes.OK).json({
    message: 'Credit updated successfully.',
    success: true,
    data: credit,
  });
});




export { createCredit, getCredits, getCreditById, deleteCredit, updateCredit };
