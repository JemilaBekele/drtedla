import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Orgnazation from '../../models/Orgnazation';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a new Orgnazation
const createOrgnazation = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const { organization } = req.body;

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  if (!organization) {
    throw new BadRequestError('Missing required fields: organization');
  }

  // Find the patient by ID
  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  // Create a new Orgnazation
  const newOrgnazation = new Orgnazation({
    organization,
    patient: {
      id: patient._id,
    },
    createdBy,
  });

  const savedOrgnazation = await newOrgnazation.save();

  // Link the Orgnazation to the patient
  patient.Orgnazation = patient.Orgnazation || [];
  patient.Orgnazation.push(savedOrgnazation._id);
  await patient.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Orgnazation created successfully',
    success: true,
    data: savedOrgnazation,
  });
});

// Retrieve Orgnazations for a patient
const getOrgnazations = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  // Find the patient by ID and populate the Orgnazation field
  const patient = await Patient.findById(id).populate('Orgnazation').exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.Orgnazation || patient.Orgnazation.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No Orgnazation available for this patient',
      data: [],
    });
    return;
  }

  // Sort the Orgnazations by `createdAt` in descending order
  const sortedOrgnazations = patient.Orgnazation.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.status(StatusCodes.OK).json({
    message: 'Orgnazation retrieved successfully',
    success: true,
    data: sortedOrgnazations,
  });
});




// Update an Organization
const updateOrganization = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { recordId, ...data } = req.body;

  // Validate required fields
  if (!recordId) {
    throw new BadRequestError('Finding ID is required');
  }

  // Find and update the Organization record by ID
  const updatedFinding = await Orgnazation.findByIdAndUpdate(recordId, data, { new: true }).exec();
  if (!updatedFinding) {
    throw new NotFoundError('Organization finding not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Organization finding updated successfully',
    success: true,
    data: updatedFinding,
  });
});

// Delete an Organization
const deleteOrganization = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { recordId } = req.body;

  // Validate required fields
  if (!recordId) {
    throw new BadRequestError('Organization ID is required');
  }

  // Find and delete the Organization by ID
  const deletedOrganization = await Orgnazation.findByIdAndDelete(recordId).exec();
  if (!deletedOrganization) {
    throw new NotFoundError('Organization not found');
  }

  // Remove the Organization reference from the associated Patient record
  const patient = await Patient.findOneAndUpdate(
    { Orgnazation: recordId }, // Find the Patient with this Organization ID
    { $pull: { Orgnazation: recordId } }, // Remove the Organization ID from the array
    { new: true } // Return the updated Patient document
  );

  if (!patient) {
    console.warn(`No patient found with Organization ID: ${recordId}`);
  }

  res.status(StatusCodes.OK).json({
    message: 'Organization deleted successfully and reference removed from patient.',
    success: true,
  });
});



// Retrieve all Organizations
const getOrgall = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  try {
    // Use the find method to retrieve all Organization documents
    const organizations = await Orgnazation.find({});
    
    res.status(StatusCodes.OK).json({
      message: 'Organizations retrieved successfully',
      success: true,
      data: organizations,
    });
  } catch (error) {
    console.error('Error retrieving Organizations:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
});



export { createOrgnazation, getOrgnazations ,updateOrganization, deleteOrganization ,getOrgall };
