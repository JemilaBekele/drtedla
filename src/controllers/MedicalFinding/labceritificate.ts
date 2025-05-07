import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import { LaboratoryCertificate } from '../../models/medical/labceriteficate';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a Laboratory Certificate
const createLaboratoryCertificate = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID
  const certificateData = req.body;

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

  const newCertificate = new LaboratoryCertificate({
    ...certificateData,
    patientId: patient._id,
    createdBy,
  });

  const savedCertificate = await newCertificate.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Laboratory Certificate created successfully',
    success: true,
    data: savedCertificate,
  });
});

// Get all Laboratory Certificates for a patient
const getLaboratoryCertificates = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  const certificates = await LaboratoryCertificate.find({ patientId: id }).exec();

  res.status(StatusCodes.OK).json({
    message: 'Laboratory Certificates retrieved successfully',
    success: true,
    data: certificates || [],
  });
});

// Get a specific Laboratory Certificate by patientId and recordId
const getLaboratoryCertificate = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { patientId, recordId } = req.params;

  if (!patientId || !recordId) {
    throw new BadRequestError('Patient ID and Record ID are required');
  }

  const certificate = await LaboratoryCertificate.findOne({
    _id: recordId,
    patientId,
  }).exec();

  if (!certificate) {
    throw new NotFoundError('Laboratory Certificate not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Laboratory Certificate retrieved successfully',
    success: true,
    data: certificate,
  });
});

// Update a Laboratory Certificate
const updateLaboratoryCertificate = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { recordId } = req.params;
  const updateData = req.body;

  if (!recordId) {
    throw new BadRequestError('Certificate record ID is required');
  }

  const certificate = await LaboratoryCertificate.findById(recordId).exec();

  if (!certificate) {
    throw new NotFoundError('Laboratory Certificate not found');
  }

  const changeHistory = {
    updatedBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
    updateTime: new Date(),
  };

  certificate.set(updateData);
  certificate.changeHistory.push(changeHistory);
  const updatedCertificate = await certificate.save();

  res.status(StatusCodes.OK).json({
    message: 'Laboratory Certificate updated successfully',
    success: true,
    data: updatedCertificate,
  });
});

// Delete a Laboratory Certificate
const deleteLaboratoryCertificate = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { recordId } = req.params;

  if (!recordId) {
    throw new BadRequestError('Certificate record ID is required');
  }

  const deleted = await LaboratoryCertificate.findByIdAndDelete(recordId).exec();
  if (!deleted) {
    throw new NotFoundError('Laboratory Certificate not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Laboratory Certificate deleted successfully',
    success: true,
  });
});

export {
  createLaboratoryCertificate,
  getLaboratoryCertificates,
  getLaboratoryCertificate,
  updateLaboratoryCertificate,
  deleteLaboratoryCertificate,
};
