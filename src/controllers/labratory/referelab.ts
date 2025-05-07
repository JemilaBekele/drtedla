import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';

import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import ReferLabTest from '../../models/Referlabtest';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// CREATE
const createReferLabTest = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID
    const data = req.body;

    if (!id) throw new BadRequestError('Patient ID is required');

    const patient = await Patient.findById(id);
    if (!patient) throw new NotFoundError('Patient not found');

    const createdBy = {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    };

    const newReferLabTest = new ReferLabTest({
      ...data,
      patient: patient._id,
      createdBy,
    });

    const savedReferLabTest = await newReferLabTest.save();

    res.status(StatusCodes.CREATED).json({
      message: 'Refer Lab Test created successfully',
      success: true,
      data: savedReferLabTest,
    });
  }
);

// READ: Single Patient's ReferLabTests
const getReferLabTests = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) throw new BadRequestError('Patient ID is required');

    const tests = await ReferLabTest.find({ patient: id }).populate('patient').exec();
    
    if (!tests || tests.length === 0) {
        res.status(StatusCodes.OK).json({
          message: 'No prescriptions available for this patient',
          data: [],
        });
        return;
      }
    tests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(StatusCodes.OK).json({
      message: 'Refer Lab Tests retrieved successfully',
      success: true,
      data: tests,
    });
  }
);

// UPDATE
const updateReferLabTest = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // ReferLabTest ID
    const data = req.body;

    if (!id) throw new BadRequestError('Refer Lab Test ID is required');

    const referTest = await ReferLabTest.findById(id);
    if (!referTest) throw new NotFoundError('Refer Lab Test not found');

    // Add to change history
    referTest.changeHistory.push({
      updatedBy: {
        id: req.user?.userId || '',
        username: req.user?.username || '',
      },
      updateTime: new Date(),
    });

    referTest.set(data);

    const updated = await referTest.save();

    res.status(StatusCodes.OK).json({
      message: 'Refer Lab Test updated successfully',
      success: true,
      data: updated,
    });
  }
);

// DELETE
const deleteReferLabTest = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) throw new BadRequestError('Refer Lab Test ID is required');

    const deleted = await ReferLabTest.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundError('Refer Lab Test not found');

    res.status(StatusCodes.OK).json({
      message: 'Refer Lab Test deleted successfully',
      success: true,
    });
  }
);

// GET ALL
const getAllReferLabTests = asyncWrapper(
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const tests = await ReferLabTest.find({});
      res.status(StatusCodes.OK).json({
        message: 'All Refer Lab Tests retrieved successfully',
        success: true,
        data: tests,
      });
    } catch (error) {
      console.error('Error retrieving refer lab tests:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
);

export {
  createReferLabTest,
  getReferLabTests,
  updateReferLabTest,
  deleteReferLabTest,
  getAllReferLabTests,
};
