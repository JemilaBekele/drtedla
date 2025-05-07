
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import GastrointestinalEndoscopy from '../../models/medical/GastrointestinalEndoscopy';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a new Gastrointestinal Endoscopy record
const createGastrointestinalEndoscopy = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID from URL params
    const endoscopyData = req.body;

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

    const newEndoscopy = new GastrointestinalEndoscopy({
      ...endoscopyData,
      patientId: patient._id,
      createdBy,
    });

    const savedEndoscopy = await newEndoscopy.save();

    res.status(StatusCodes.CREATED).json({
      message: 'Gastrointestinal endoscopy record created successfully',
      success: true,
      data: savedEndoscopy,
    });
  }
);

// Retrieve Gastrointestinal Endoscopy records for a specific patient
const getGastrointestinalEndoscopies = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Patient ID is required');
    }

    const records = await GastrointestinalEndoscopy.find({ patientId: id })
      .sort({ createdAt: -1 })
      .exec();

    res.status(StatusCodes.OK).json({
      message: 'Gastrointestinal endoscopy records retrieved successfully',
      success: true,
      data: records,
    });
  }
);

// Retrieve a specific Gastrointestinal Endoscopy record
const getGastrointestinalEndoscopyRecord = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const record = await GastrointestinalEndoscopy.findById(recordId).exec();
    if (!record) {
      throw new NotFoundError('Gastrointestinal endoscopy record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Gastrointestinal endoscopy record retrieved successfully',
      success: true,
      data: record,
    });
  }
);

// Update a specific Gastrointestinal Endoscopy record
const updateGastrointestinalEndoscopyRecord = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.params;
    const updateData = req.body;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const updatedRecord = await GastrointestinalEndoscopy.findByIdAndUpdate(
      recordId,
      updateData,
      { new: true }
    ).exec();

    if (!updatedRecord) {
      throw new NotFoundError('Gastrointestinal endoscopy record not found');
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
      message: 'Gastrointestinal endoscopy record updated successfully',
      success: true,
      data: updatedRecord,
    });
  }
);

// Delete a specific Gastrointestinal Endoscopy record
const deleteGastrointestinalEndoscopyRecord = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const deletedRecord = await GastrointestinalEndoscopy.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) {
      throw new NotFoundError('Gastrointestinal endoscopy record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Gastrointestinal endoscopy record deleted successfully',
      success: true,
    });
  }
);



export {
  createGastrointestinalEndoscopy,
  getGastrointestinalEndoscopies,
  getGastrointestinalEndoscopyRecord,
  updateGastrointestinalEndoscopyRecord,
  deleteGastrointestinalEndoscopyRecord,
 
};
