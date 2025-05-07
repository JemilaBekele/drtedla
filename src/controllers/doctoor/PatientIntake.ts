import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import PatientIntake from '../../models/medical/PatientIntake';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a new Patient Intake record
const createPatientIntake = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID from URL params
    const PatientIntakeData = req.body;

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

    const newIntake = new PatientIntake({
      ...PatientIntakeData,
      patientId: patient._id,
      createdBy,
    });

    const savedIntake = await newIntake.save();

    res.status(StatusCodes.CREATED).json({
      message: 'Patient intake record created successfully',
      success: true,
      data: savedIntake,
    });
  }
);

// Retrieve Patient Intake records for a specific patient
const getPatientIntakes = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Patient ID is required');
    }

    const records = await PatientIntake.find({ patientId: id })
      .sort({ createdAt: -1 })
      .exec();

    res.status(StatusCodes.OK).json({
      message: 'Patient intake records retrieved successfully',
      success: true,
      data: records,
    });
  }
);

// Retrieve a specific Patient Intake record
const getPatientIntakeRecord = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const record = await PatientIntake.findById(recordId).exec();
    if (!record) {
      throw new NotFoundError('Patient intake record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Patient intake record retrieved successfully',
      success: true,
      data: record,
    });
  }
);

// Update a specific Patient Intake record
const updatePatientIntakeRecord = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.params;
    const PatientIntakeData = req.body;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const updatedRecord = await PatientIntake.findByIdAndUpdate(
      recordId,
      PatientIntakeData,
      { new: true }
    ).exec();

    if (!updatedRecord) {
      throw new NotFoundError('Patient intake record not found');
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
    updatedRecord.set(PatientIntakeData);
   
    // Save the updated certificate
    await updatedRecord.save();

    res.status(StatusCodes.OK).json({
      message: 'Patient intake record updated successfully',
      success: true,
      data: updatedRecord,
    });
  }
);

// Delete a specific Patient Intake record
const deletePatientIntakeRecord = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('Record ID is required');
    }

    const deletedRecord = await PatientIntake.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) {
      throw new NotFoundError('Patient intake record not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Patient intake record deleted successfully',
      success: true,
    });
  }
);

export {
  createPatientIntake,
  getPatientIntakes,
  getPatientIntakeRecord,
  updatePatientIntakeRecord,
  deletePatientIntakeRecord,
};
