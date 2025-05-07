import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import TestPricing from '../../models/Pricing';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create or Update Test Pricing
const upsertTestPricing = asyncWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { section, testPrices, defaultSectionPrice } = req.body;

  // Make sure section is provided, and at least one of testPrices or defaultSectionPrice is present
  if (!section || (!testPrices && defaultSectionPrice === undefined)) {
    throw new BadRequestError('Please provide a section and at least one price.');
  }

  if (!req.user) {
    throw new BadRequestError('User information is missing.');
  }

  const userRef = {
    id: req.user.userId, // ObjectId of the user
    username: req.user.username, // Username of the user
  };

  // Check if a record exists
  const existingPricing = await TestPricing.findOne({ section });

  let updatedPricing;

  if (existingPricing) {
    // Update existing record
    existingPricing.testPrices = testPrices || existingPricing.testPrices;
    existingPricing.defaultSectionPrice = defaultSectionPrice ?? existingPricing.defaultSectionPrice;

    updatedPricing = await existingPricing.save();
  } else {
    // Create new record with createdBy
    updatedPricing = await TestPricing.create({
      section,
      testPrices,
      defaultSectionPrice,
      createdBy: userRef, // Use `createdBy` correctly
      updatedAt: Date.now(),
    });
  }

  res.status(StatusCodes.OK).json({
    message: existingPricing ? 'Pricing updated successfully' : 'Pricing created successfully',
    success: true,
    data: updatedPricing,
  });
});

  
  

// Get all test pricing
const getAllTestPricing = asyncWrapper(async (_req: Request, res: Response) => {
  const pricing = await TestPricing.find();
  res.status(StatusCodes.OK).json({
    success: true,
    data: pricing,
  });
});

// Get test pricing by section
const getTestPricingBySection = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;
  const pricing = await TestPricing.findOne({ _id: id });

  if (!pricing) {
    throw new NotFoundError(`Pricing for section ${id} not found.`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: pricing,
  });
});

// Delete test pricing for a section
const deleteTestPricing = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;

  const pricing = await TestPricing.findOneAndDelete({_id:id

  });

  if (!pricing) {
    throw new NotFoundError(`Pricing for section ${id} not found.`);
  }

  res.status(StatusCodes.OK).json({
    message: `Pricing for section ${id} deleted successfully.`,
    success: true,
  });
});

const updateTestPricing = asyncWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // Extract pricing ID from request parameters
  const { testPrices, defaultSectionPrice } = req.body; // Extract fields to update


console.log(req.body)

  if (!id) {
    throw new BadRequestError('Pricing ID is required.');
  }

  if (!req.user) {
    throw new BadRequestError('User information is missing.');
  }

  const existingPricing = await TestPricing.findById(id);
  
  if (!existingPricing) {
    throw new NotFoundError(`Pricing with ID ${id} not found.`);
  }

  // Update only the fields provided in the request body
  if (testPrices) {
    existingPricing.testPrices = testPrices;
  }

  if (defaultSectionPrice !== undefined) {
    existingPricing.defaultSectionPrice = defaultSectionPrice;
  }



  // Save the updated pricing document
  const updatedPricing = await existingPricing.save();

  res.status(StatusCodes.OK).json({
    message: 'Pricing updated successfully',
    success: true,
    data: updatedPricing,
  });
});





export { upsertTestPricing, getAllTestPricing, getTestPricingBySection, deleteTestPricing,updateTestPricing };
