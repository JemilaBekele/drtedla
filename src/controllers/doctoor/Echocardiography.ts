import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Echocardiography from '../../models/medical/Echocardiography';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}



// Create a new Echocardiography record
const createEchocardiography = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID from URL params
    const echocardiographyData = req.body;

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

    const newEchocardiography = new Echocardiography({
      ...echocardiographyData,
      patientId: patient._id,
      createdBy,
    });

    const savedEchocardiography = await newEchocardiography.save();

    res.status(StatusCodes.CREATED).json({
      message: 'Echocardiography record created successfully',
      success: true,
      data: savedEchocardiography,
    });
  }
);

// Retrieve Echocardiography records for a specific patient
const getEchocardiographies = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Patient ID is required');
    }

    const records = await Echocardiography.find({ patientId: id })
      .sort({ createdAt: -1 })
      .exec();

    res.status(StatusCodes.OK).json({
      message: 'Echocardiography records retrieved successfully',
      success: true,
      data: records,
    });
  }
);

// Retrieve a specific Echocardiography record
const getEchocardiographyRecord = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const record = await Echocardiography.findById(recordId).exec();
    if (!record) {
      throw new NotFoundError('Echocardiography record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Echocardiography record retrieved successfully',
      success: true,
      data: record,
    });
  }
);

// Update a specific Echocardiography record
const updateEchocardiographyRecord = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.params;
    const updateData = req.body;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const updatedRecord = await Echocardiography.findByIdAndUpdate(
      recordId,
      updateData,
      { new: true }
    ).exec();

    if (!updatedRecord) {
      throw new NotFoundError('Echocardiography record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Echocardiography record updated successfully',
      success: true,
      data: updatedRecord,
    });
  }
);

// Delete a specific Echocardiography record
const deleteEchocardiographyRecord = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const deletedRecord = await Echocardiography.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) {
      throw new NotFoundError('Echocardiography record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Echocardiography record deleted successfully',
      success: true,
    });
  }
);

export {

  createEchocardiography,
  getEchocardiographies,
  getEchocardiographyRecord,
  updateEchocardiographyRecord,
  deleteEchocardiographyRecord,
};
