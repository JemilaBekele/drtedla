import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';

import { LabTest } from '../../models/LabTest';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

/**
 * ✅ Create a new Lab Test for a patient.
 * Expects patient ID in req.params and test details in req.body.
 */
const createLabTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const { sections } = req.body; // Array of sections with tests

  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }
  if (!sections || !Array.isArray(sections)) {
    throw new BadRequestError('Sections array is required');
  }

  // Find the patient
  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Build createdBy object using authenticated user details
  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  // Format each section and its tests
  const formattedSections = sections.map((section: any) => ({
    section: section.section,
    tests: section.tests.map((test: any) => ({
      name: test.name,
      selectedForLab: true,
      isResult: false,
      result: null,
      unit: null,
      referenceRange: null,
      comments: null,
    })),
  }));

  // Create a single LabTest document with all sections
  const newLabTest = new LabTest({
    patient: patient._id,
    sections: formattedSections,
    createdBy,
    status: 'Pending',
  });

  const savedLabTest = await newLabTest.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Lab Test created successfully',
    success: true,
    data: savedLabTest,
  });
});
/**
 * ✅ Retrieve all Lab Tests for a given patient.
 */
const getLabTestsByPatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params

  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  const labTests = await LabTest.find({ patient: id }).exec();

  if (!labTests || labTests.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No lab tests available for this patient',
      data: [],
    });
    return;
  }

  // Sort lab tests by most recent
  labTests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.status(StatusCodes.OK).json({
    message: 'Lab tests retrieved successfully',
    success: true,
    data: labTests,
  });
});

/**
 * ✅ Update an existing Lab Test.
 * Allows updating test results, status, and review.
 */


import mongoose from 'mongoose';

const updateLabTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { tests, status } = req.body;

  if (!id) {
    throw new BadRequestError('Lab Test ID is required');
  }

  // Fetch the existing LabTest
 
 // Save only once after modifying the document

  res.status(StatusCodes.OK).json({
    message: 'Lab Test updated successfully',
    success: true,
    
  });
});




/**
 * ✅ Delete a Lab Test by ID.
 */
const deleteLabTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Lab Test ID is required');
  }

  const deletedLabTest = await LabTest.findByIdAndDelete(id).exec();
  if (!deletedLabTest) {
    throw new NotFoundError('Lab Test not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Lab Test deleted successfully',
    success: true,
  });
});

/**
 * ✅ Retrieve all Lab Tests in the database.
 */
const getAllLabTests = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  try {
    const labTests = await LabTest.find({});
    res.status(StatusCodes.OK).json({
      message: 'Lab tests retrieved successfully',
      success: true,
      data: labTests,
    });
  } catch (error) {
    console.error('Error retrieving lab tests:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
    });
  }
});

export {
  createLabTest,
  getLabTestsByPatient,
  updateLabTest,
  deleteLabTest,
  getAllLabTests,
};
