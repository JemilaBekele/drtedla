import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import Organization from '../../models/organization';


/**
 * Create a new Organization
 */
const createOrganization = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { name, address, phone, website, email } = req.body;

    // Validate required fields
    if (!name) {
      throw new BadRequestError('Organization name is required');
    }

    // Build createdBy object using authenticated user details

    // Create a new Organization document
    const newOrganization = new Organization({
      name,
      address,
      phone,
      website,
      email,
    
    });

    const savedOrganization = await newOrganization.save();

    res.status(StatusCodes.CREATED).json({
      message: 'Organization created successfully',
      success: true,
      data: savedOrganization,
    });
  }
);

/**
 * Get all Organizations
 */
const getAllOrganizations = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const organizations = await Organization.find({}).sort({ createdAt: -1 }).exec();

    res.status(StatusCodes.OK).json({
      message: 'Organizations retrieved successfully',
      success: true,
      count: organizations.length,
      data: organizations,
    });
  }
);

/**
 * Get a single Organization by ID
 */
const getOrganization = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validate required field
    if (!id) {
      throw new BadRequestError('Organization ID is required');
    }

    const organization = await Organization.findById(id).exec();
    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Organization retrieved successfully',
      success: true,
      data: organization,
    });
  }
);

/**
 * Update an existing Organization
 */
const updateOrganization = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, address, phone, website, email } = req.body;

    // Validate required field
    if (!id) {
      throw new BadRequestError('Organization ID is required');
    }

    // Find and update the Organization document by ID
    const updatedOrganization = await Organization.findByIdAndUpdate(
      id,
      { name, address, phone, website, email },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedOrganization) {
      throw new NotFoundError('Organization not found');
    }

 
    // Save the updated organization
    await updatedOrganization.save();

    res.status(StatusCodes.OK).json({
      message: 'Organization updated successfully',
      success: true,
      data: updatedOrganization,
    });
  }
);

/**
 * Delete an Organization
 */
const deleteOrganization = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validate required field
    if (!id) {
      throw new BadRequestError('Organization ID is required');
    }

    // Find and delete the Organization document by ID
    const deletedOrganization = await Organization.findByIdAndDelete(id).exec();
    if (!deletedOrganization) {
      throw new NotFoundError('Organization not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Organization deleted successfully',
      success: true,
    });
  }
);

/**
 * Search Organizations by name or other fields
 */
const searchOrganizations = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { query } = req.query;

    if (!query) {
      throw new BadRequestError('Search query is required');
    }

    const organizations = await Organization.find({
      $or: [
        { name: { $regex: query as string, $options: 'i' } },
        { address: { $regex: query as string, $options: 'i' } },
        { email: { $regex: query as string, $options: 'i' } },
      ],
    }).exec();

    res.status(StatusCodes.OK).json({
      message: 'Organizations search completed',
      success: true,
      count: organizations.length,
      data: organizations,
    });
  }
);

export {
  createOrganization,
  getAllOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  searchOrganizations,
};