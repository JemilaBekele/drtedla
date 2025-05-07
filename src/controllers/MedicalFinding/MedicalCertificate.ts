import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';

import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import MedicalCertificate from '../../models/medicalcerteficate';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

/**
 * Create a new Medical Certificate for a patient.
 * Expects the patient ID in req.params and certificate details in req.body.
 */
const createMedicalCertificate = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID from URL params
    const { briefExplanation, diagnosis,medicationDate, restDate } = req.body;

    // Validate required fields
    if (!id) {
      throw new BadRequestError('Patient ID is required');
    }
    if (!briefExplanation) {
      throw new BadRequestError('Brief explanation is required');
    }
   
    if (
      !restDate ||
      !restDate.from ||
      !restDate.to ||
      restDate.totalRestDays === undefined
    ) {
      throw new BadRequestError(
        'Complete rest date information is required (from, to, totalRestDays)'
      );
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

    // Create a new MedicalCertificate document
    const newCertificate = new MedicalCertificate({
      patient: patient._id,
      briefExplanation,
      diagnosis,
      restDate,
      medicationDate,
      createdBy,
    });

    const savedCertificate = await newCertificate.save();
    patient.MedicalCertificate = patient.MedicalCertificate || [];
    patient.MedicalCertificate.push(savedCertificate._id);
    await patient.save();
    res.status(StatusCodes.CREATED).json({
      message: 'Medical Certificate created successfully',
      success: true,
      data: savedCertificate,
    });
  }
);

/**
 * Retrieve all Medical Certificates for a given patient.
 * Expects the patient ID in req.params.
 */
const getMedicalCertificates = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID from URL params

    // Validate required field
    if (!id) {
      throw new BadRequestError('Patient ID is required');
    }

    // Find all medical certificates associated with the patient
    const certificates = await MedicalCertificate.find({ patient: id }).populate('patient') // <--- Populate the patient details
    .exec();

    if (!certificates || certificates.length === 0) {
      res.status(StatusCodes.OK).json({
        message: 'No medical certificates available for this patient',
        data: [],
      });
      return;
    }

    // Optionally, sort certificates by createdAt descending
    certificates.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.status(StatusCodes.OK).json({
      message: 'Medical Certificates retrieved successfully',
      success: true,
      data: certificates,
    });
  }
);

/**
 * Update an existing Medical Certificate.
 * Expects the certificate ID (recordId) and update data in req.body.
 */
const updateMedicalCertificate = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { ...data } = req.body;
    const { id } = req.params;

    // Validate required field
    if (!id) {
      throw new BadRequestError('Medical Certificate ID is required');
    }

    // Find and update the MedicalCertificate document by ID
    const updatedCertificate = await MedicalCertificate.findById(id);
    if (!updatedCertificate) {
      throw new NotFoundError('Medical Certificate not found');
    }

    // If data contains changes, add to changeHistory
    const changeHistory = {
      updatedBy: {
        id: req.user?.userId || '',
        username: req.user?.username || '',
      },
      updateTime: new Date(),
    };

    // Add the new change history entry to the certificate
    updatedCertificate.changeHistory.push(changeHistory);

    // Update the certificate with the new data (excluding changeHistory)
    updatedCertificate.set(data);

    // Save the updated certificate
    await updatedCertificate.save();

    res.status(StatusCodes.OK).json({
      message: 'Medical Certificate updated successfully',
      success: true,
      data: updatedCertificate,
    });
  }
);


/**
 * Delete a Medical Certificate.
 * Expects the certificate ID (recordId) in req.body.
 */
const deleteMedicalCertificate = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validate required field
    if (!id) {
      throw new BadRequestError('Medical Certificate ID is required');
    }

    // Find and delete the MedicalCertificate document by ID
    const deletedCertificate = await MedicalCertificate.findByIdAndDelete(id).exec();
    if (!deletedCertificate) {
      throw new NotFoundError('Medical Certificate not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Medical Certificate deleted successfully',
      success: true,
    });
  }
);

/**
 * Retrieve all Medical Certificates in the database.
 */
const getAllMedicalCertificates = asyncWrapper(
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const certificates = await MedicalCertificate.find({});
      res.status(StatusCodes.OK).json({
        message: 'Medical Certificates retrieved successfully',
        success: true,
        data: certificates,
      });
    } catch (error) {
      console.error('Error retrieving medical certificates:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error',
      });
    }
  }
);

export {
  createMedicalCertificate,
  getMedicalCertificates,
  updateMedicalCertificate,
  deleteMedicalCertificate,
  getAllMedicalCertificates,
};
