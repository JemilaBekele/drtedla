import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import TestConfig from '../../models/TestSchema';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

// Create a new test configuration (Admin only)
const addTestConfig = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { name, unit, referenceRange } = req.body;

  if (!name || !unit || !referenceRange) {
    throw new BadRequestError('Name, unit, and reference range are required');
  }

  // Check if test config already exists
  const existingTest = await TestConfig.findOne({ name });
  if (existingTest) {
    throw new BadRequestError('Test configuration already exists');
  }

  const newTestConfig = new TestConfig({ name, unit, referenceRange });
  await newTestConfig.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Test configuration added successfully',
    success: true,
    data: newTestConfig,
  });
});

// Update an existing test configuration (Admin only)
const updateTestConfig = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { unit, referenceRange } = req.body;

  if (!unit && !referenceRange) {
    throw new BadRequestError('At least one field (unit or reference range) must be provided');
  }

  const updatedTestConfig = await TestConfig.findByIdAndUpdate(
    id,
    { unit, referenceRange },
    { new: true, runValidators: true }
  );

  if (!updatedTestConfig) {
    throw new NotFoundError('Test configuration not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Test configuration updated successfully',
    success: true,
    data: updatedTestConfig,
  });
});

// Get all test configurations
const getAllTestConfigs = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  const testConfigs = await TestConfig.find();
  
  res.status(StatusCodes.OK).json({
    message: 'Test configurations retrieved successfully',
    success: true,
    data: testConfigs,
  });
});

// Delete a test configuration
const deleteTestConfig = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const deletedTestConfig = await TestConfig.findByIdAndDelete(id);
  if (!deletedTestConfig) {
    throw new NotFoundError('Test configuration not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Test configuration deleted successfully',
    success: true,
  });
});

export { addTestConfig, updateTestConfig, getAllTestConfigs, deleteTestConfig };
