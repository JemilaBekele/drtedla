import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import ROS from '../../models/medical/ROS';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a new ROS record
const createROS = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const rosData = req.body;

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

  const newROS = new ROS({
    ...rosData,
    patientId: { id: patient._id },
    createdBy,
  });

  const savedROS = await newROS.save();

  res.status(StatusCodes.CREATED).json({
    message: 'ROS record created successfully',
    success: true,
    data: savedROS,
  });
});

// Retrieve ROS records for a specific patient
const getROS = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  const records = await ROS.find({ 'patientId.id': id }).sort({ createdAt: -1 }).exec();

  res.status(StatusCodes.OK).json({
    message: 'ROS records retrieved successfully',
    success: true,
    data: records,
  });
});

// Retrieve a specific ROS record
const getROSRecord = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { recordId } = req.params;

  if (!recordId) {
    throw new BadRequestError('Record ID is required');
  }

  const record = await ROS.findById(recordId).exec();
  if (!record) {
    throw new NotFoundError('ROS record not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'ROS record retrieved successfully',
    success: true,
    data: record,
  });
});

// Update a specific ROS record
const updateROSRecord = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  const { recordId } = req.params;
  const {  ...data } = req.body;
  if (!recordId) {
    throw new BadRequestError('Record ID is required');
  }

  const updatedRecord = await ROS.findByIdAndUpdate(recordId, data, { new: true }).exec();
  if (!updatedRecord) {
    throw new NotFoundError('ROS record not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'ROS record updated successfully',
    success: true,
    data: updatedRecord,
  });
});

// Delete a specific ROS record
const deleteROSRecord = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { recordId } = req.params;

  if (!recordId) {
    throw new BadRequestError('Record ID is required');
  }

  const deletedRecord = await ROS.findByIdAndDelete(recordId).exec();
  if (!deletedRecord) {
    throw new NotFoundError('ROS record not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'ROS record deleted successfully',
    success: true,
  });
});

export { createROS, getROS, getROSRecord, 
  updateROSRecord, deleteROSRecord };