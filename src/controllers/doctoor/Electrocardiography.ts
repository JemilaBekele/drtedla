

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import ECG from '../../models/medical/Electrocardiography';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}


// Create a new ECG record
const createECG = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID from URL params
    const ECGData = req.body;

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

    const newECG = new ECG({
      ...ECGData,
      patientId: patient._id,
      createdBy,
    });

    const savedECG = await newECG.save();

    res.status(StatusCodes.CREATED).json({
      message: 'ECG record created successfully',
      success: true,
      data: savedECG,
    });
  }
);

// Retrieve ECG records for a specific patient
const getEcG = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Patient ID is required');
    }

    const records = await ECG.find({ patientId: id })
      .sort({ createdAt: -1 })
      .exec();

    res.status(StatusCodes.OK).json({
      message: 'ECG records retrieved successfully',
      success: true,
      data: records,
    });
  }
);

// Retrieve a specific ECG record
const getECGRecord = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const record = await ECG.findById(recordId).exec();
    if (!record) {
      throw new NotFoundError('ECG record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'ECG record retrieved successfully',
      success: true,
      data: record,
    });
  }
);

// Update a specific ECG record
const updateECGRecord = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.params;
    const updateData = req.body;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const updatedRecord = await ECG.findByIdAndUpdate(
      recordId,
      updateData,
      { new: true }
    ).exec();

    if (!updatedRecord) {
      throw new NotFoundError('ECG record not found');
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
      message: 'ECG record updated successfully',
      success: true,
      data: updatedRecord,
    });
  }
);

// Delete a specific ECG record
const deleteECGRecord = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const deletedRecord = await ECG.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) {
      throw new NotFoundError('ECG record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'ECG record deleted successfully',
      success: true,
    });
  }
);

export {

  createECG,
  getEcG,
  getECGRecord,
  updateECGRecord,
  deleteECGRecord,
};
