import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Healthinfo from '../../models/healthinfo';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a new health information record
const createHealthinfo = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const { bloodgroup, weight, height, allergies, habits } = req.body;

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  // Validate patient existence
  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  // Create new Healthinfo
  const newHealthinfo = new Healthinfo({
    bloodgroup,
    weight,
    height,
    allergies,
    habits,
    patientId: { id: patient._id },
    createdBy,
  });

  const savedHealthinfo = await newHealthinfo.save();

  // Link the new health info to the patient
  patient.Healthinfo = patient.Healthinfo || [];
  patient.Healthinfo.push(savedHealthinfo._id);
  await patient.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Healthinfo created successfully',
    success: true,
    data: savedHealthinfo,
  });
});

// Retrieve health information for a specific patient
const getHealthinfo = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  // Find the patient by ID and populate Healthinfo
  const patient = await Patient.findById(id).populate('Healthinfo').exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.Healthinfo || patient.Healthinfo.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No Healthinfo available for this patient',
      data: [],
    });
    return;
  }

  // Sort health information by `createdAt` in descending order
  const sortedHealthinfo = patient.Healthinfo.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.status(StatusCodes.OK).json({
    message: 'Healthinfo retrieved successfully',
    success: true,
    data: sortedHealthinfo,
  });
});




// Retrieve a specific medical finding by patientId and recordId
const getHealthinfoRecord = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { patientId, recordId } = req.params;

  // Validate required fields
  if (!patientId || !recordId) {
    throw new BadRequestError('Patient ID and Finding ID are required');
  }

  // Validate patient existence
  const patient = await Patient.findById(patientId).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Find the medical finding by ID
  const finding = await Healthinfo.findById(recordId).exec();
  if (!finding) {
    throw new NotFoundError('Medical finding not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Medical finding retrieved successfully',
    success: true,
    data: finding,
  });
});

// Update a specific medical finding
const updateHealthinfoRecord = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { recordId, ...data } = req.body;

  // Validate required fields
  if (!recordId) {
    throw new BadRequestError('Finding ID is required');
  }

  // Find and update the medical finding by ID
  const updatedFinding = await Healthinfo.findByIdAndUpdate(recordId, data, { new: true }).exec();
  if (!updatedFinding) {
    throw new NotFoundError('Medical finding not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Medical finding updated successfully',
    success: true,
    data: updatedFinding,
  });
});

// Delete a specific medical finding
const deleteHealthinfoRecord = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { recordId } = req.body;

  // Validate required fields
  if (!recordId) {
    throw new BadRequestError('Healthinfo ID is required');
  }

  // Find and delete the Healthinfo record by ID
  const deletedFinding = await Healthinfo.findByIdAndDelete(recordId).exec();
  if (!deletedFinding) {
    throw new NotFoundError('Healthinfo record not found');
  }

  // Remove the Healthinfo reference from the associated patient's record
  const patient = await Patient.findOneAndUpdate(
    { Healthinfo: recordId }, // Find patient with this Healthinfo ID
    { $pull: { Healthinfo: recordId } }, // Remove the Healthinfo ID from the array
    { new: true } // Return the updated patient document
  );

  if (!patient) {
    console.warn(`No patient found with Healthinfo ID: ${recordId}`);
  }

  res.status(StatusCodes.OK).json({
    message: 'Healthinfo record deleted successfully and reference removed from patient',
    success: true,
  });
});



export { createHealthinfo, getHealthinfo , getHealthinfoRecord, updateHealthinfoRecord, deleteHealthinfoRecord };
