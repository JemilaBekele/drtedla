import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Mammography from '../../models/medical/Mammography';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}



// Create a new Mammography record
const createMammography = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID from URL params
    const mammographyData = req.body;

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

    const newMammography = new Mammography({
      ...mammographyData,
      patientId: patient._id,
      createdBy,
    });

    const savedMammography = await newMammography.save();

    res.status(StatusCodes.CREATED).json({
      message: 'Mammography record created successfully',
      success: true,
      data: savedMammography,
    });
  }
);

// Retrieve Mammography records for a specific patient
const getMammographies = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Patient ID is required');
    }

    const records = await Mammography.find({ patientId: id })
      .sort({ createdAt: -1 })
      .exec();

    res.status(StatusCodes.OK).json({
      message: 'Mammography records retrieved successfully',
      success: true,
      data: records,
    });
  }
);

// Retrieve a specific Mammography record
const getMammographyRecord = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const record = await Mammography.findById(recordId).exec();
    if (!record) {
      throw new NotFoundError('Mammography record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Mammography record retrieved successfully',
      success: true,
      data: record,
    });
  }
);

// Update a specific Mammography record
const updateMammographyRecord = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.params;
    const updateData = req.body;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const updatedRecord = await Mammography.findByIdAndUpdate(
      recordId,
      updateData,
      { new: true }
    ).exec();

    if (!updatedRecord) {
      throw new NotFoundError('Mammography record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Mammography record updated successfully',
      success: true,
      data: updatedRecord,
    });
  }
);

// Delete a specific Mammography record
const deleteMammographyRecord = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const deletedRecord = await Mammography.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) {
      throw new NotFoundError('Mammography record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Mammography record deleted successfully',
      success: true,
    });
  }
);

export {
 
  createMammography,
  getMammographies,
  getMammographyRecord,
  updateMammographyRecord,
  deleteMammographyRecord,
};
