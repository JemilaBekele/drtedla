import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';

import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import Prescription from '../../models/prescription';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

/**
 * Create a new Prescription for a patient.
 * Expects the patient ID in req.params and a description in req.body.
 */
const createPrescription = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID from URL params
    const { description, Diagnosis } = req.body;

    // Validate required fields
    if (!id) {
      throw new BadRequestError('Patient ID is required');
    }
    if (!description) {
      throw new BadRequestError('Description is required');
    }

    // Find the patient by ID
    const patient = await Patient.findById(id).exec();
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Build createdBy object using authenticated user details
    const createdBy = {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    };

    // Create a new Prescription document
    const newPrescription = new Prescription({
      patient: patient._id,
      description,
      Diagnosis,
      createdBy,
    });

    const savedPrescription = await newPrescription.save();

    
    patient.prescriptions = patient.prescriptions || [];
    patient.prescriptions.push(savedPrescription._id);
    await patient.save();

    res.status(StatusCodes.CREATED).json({
      message: 'Prescription created successfully',
      success: true,
      data: savedPrescription,
    });
  }
);

/**
 * Retrieve all Prescriptions for a given patient.
 * Expects the patient ID in req.params.
 */
const getPrescriptions = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID from URL params

    if (!id) {
      throw new BadRequestError('Patient ID is required');
    }

    // Fetch prescriptions and populate the patient field
    const prescriptions = await Prescription.find({ patient: id })
      .populate('patient') // <--- Populate the patient details
      .exec();

    if (!prescriptions || prescriptions.length === 0) {
      res.status(StatusCodes.OK).json({
        message: 'No prescriptions available for this patient',
        data: [],
      });
      return;
    }

    // Sort by createdAt descending
    prescriptions.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.status(StatusCodes.OK).json({
      message: 'Prescriptions retrieved successfully',
      success: true,
      data: prescriptions,
    });
  }
);


/**
 * Update an existing Prescription.
 * Expects the prescription ID (recordId) and update data in req.body.
 */
const updatePrescription = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {  ...data } = req.body;
    const { id } = req.params;
    // Validate required field
    if (!id) {
      throw new BadRequestError('Prescription ID is required');
    }

    // Find and update the Prescription document by ID
    const updatedPrescription = await Prescription.findByIdAndUpdate(
        id,
      data,
      { new: true }
    ).exec();

    if (!updatedPrescription) {
      throw new NotFoundError('Prescription not found');
    }
    const changeHistory = {
      updatedBy: {
        id: req.user?.userId || '',
        username: req.user?.username || '',
      },
      updateTime: new Date(),
    };

    // Add the new change history entry to the certificate
    updatedPrescription.changeHistory.push(changeHistory);

    // Update the certificate with the new data (excluding changeHistory)
    updatedPrescription.set(data);

    // Save the updated certificate
    await updatedPrescription.save();

    res.status(StatusCodes.OK).json({
      message: 'Prescription updated successfully',
      success: true,
      data: updatedPrescription,
    });
  }
);

/**
 * Delete a Prescription.
 * Expects the prescription ID (recordId) in req.body.
 */
const deletePrescription = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validate required field
    if (!id) {
      throw new BadRequestError('Prescription ID is required');
    }

    // Find and delete the Prescription document by ID
    const deletedPrescription = await Prescription.findByIdAndDelete(id).exec();
    if (!deletedPrescription) {
      throw new NotFoundError('Prescription not found');
    }

    // Optionally, remove the Prescription reference from the Patient document
    // if you have such a relationship defined:
    // await Patient.findOneAndUpdate(
    //   { prescriptions: recordId },
    //   { $pull: { prescriptions: recordId } },
    //   { new: true }
    // );

    res.status(StatusCodes.OK).json({
      message: 'Prescription deleted successfully',
      success: true,
    });
  }
);

/**
 * Retrieve all Prescriptions in the database.
 */
const getAllPrescriptions = asyncWrapper(
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const prescriptions = await Prescription.find({});
      res.status(StatusCodes.OK).json({
        message: 'Prescriptions retrieved successfully',
        success: true,
        data: prescriptions,
      });
    } catch (error) {
      console.error('Error retrieving prescriptions:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
);

export {
  createPrescription,
  getPrescriptions,
  updatePrescription,
  deletePrescription,
  getAllPrescriptions,
};
