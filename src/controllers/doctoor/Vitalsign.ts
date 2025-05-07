import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import { VitalSign } from '../../models/medical/Vitalsign';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a new Vital Sign record
const createVitalSign = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const vitalSignData = req.body;

  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  const newVitalSign = new VitalSign({ ...vitalSignData, patientId: patient._id, createdBy });
  const savedVitalSign = await newVitalSign.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Vital Sign record created successfully',
    success: true,
    data: savedVitalSign,
  });
});

// Retrieve Vital Sign records for a specific patient
const getVitalSigns = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID

  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  const VitalSigns = await VitalSign.find({patientId:id})
  if (!VitalSigns) {
    throw new NotFoundError('Patient not found');
  }
console.log(VitalSigns)
  res.status(StatusCodes.OK).json({
    message: 'Vital Signs retrieved successfully',
    success: true,
    data: VitalSigns || [],
  });
});

// Retrieve a specific Vital Sign record by patientId and recordId
const getVitalSignRecord = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { patientId, recordId } = req.params;

  if (!patientId || !recordId) {
    throw new BadRequestError('Patient ID and Record ID are required');
  }

  const record = await VitalSign.findOne({ _id: recordId, patientId }).exec();
  if (!record) {
    throw new NotFoundError('Vital Sign record not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Vital Sign record retrieved successfully',
    success: true,
    data: record,
  });
});

// Update a specific Vital Sign record
const updateVitalSignRecord = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { ...updateData } = req.body;
  const { recordId} = req.params;
  if (!recordId) {
    throw new BadRequestError('Vital Sign record ID is required');
  }

  const updatedRecord = await VitalSign.findByIdAndUpdate(recordId, updateData, { new: true }).exec();
  if (!updatedRecord) {
    throw new NotFoundError('Vital Sign record not found');
  }
  const changeHistory = {
    updatedBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
    updateTime: new Date(),
  };
  updatedRecord.changeHistory.push(changeHistory);

  // Update the certificate with the new data (excluding changeHistory)
  updatedRecord.set(updateData);
 
  // Save the updated certificate
  await updatedRecord.save();
  res.status(StatusCodes.OK).json({
    message: 'Vital Sign record updated successfully',
    success: true,
    data: updatedRecord,
  });
});

// Delete a specific Vital Sign record
const deleteVitalSignRecord = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { recordId} = req.params;

  if (!recordId) {
    throw new BadRequestError('Vital Sign record ID is required');
  }

  const deletedRecord = await VitalSign.findByIdAndDelete(recordId).exec();
  if (!deletedRecord) {
    throw new NotFoundError('Vital Sign record not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Vital Sign record deleted successfully',
    success: true,
  });
});

export { createVitalSign, getVitalSigns, 
  getVitalSignRecord, updateVitalSignRecord, 
  deleteVitalSignRecord };