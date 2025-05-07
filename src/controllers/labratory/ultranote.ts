import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import Ultranote from '../../models/ultranote';
import Service from '../../models/Services';



/**
 * Create a new Ultranote
 */
const createUltranote = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { ultraId } = req.params;
    const { note, noteA, noteB, noteC, noteD, noteF } = req.body;

    // Validate required fields
    if (!ultraId) {
      throw new BadRequestError('Ultra ID is required');
    }

 

    // Create a new Ultranote document
    const newUltranote = new Ultranote({
      note,
      noteA,
      noteB,
      noteC,
      noteD,
      noteF,
      Ultra:ultraId,
    
    });

    const savedUltranote = await newUltranote.save();

    res.status(StatusCodes.CREATED).json({
      message: 'Ultranote created successfully',
      success: true,
      data: savedUltranote,
    });
  }
);

/**
 * Get all Ultranotes for a specific Ultra test
 */
const getUltranotesByUltra = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { ultraId } = req.params;

    // Validate required field
    if (!ultraId) {
      throw new BadRequestError('Ultra ID is required');
    }

    // Find all ultranotes for the given ultra test
    const ultranotes = await Ultranote.find({ Ultra: ultraId }).exec();

    if (!ultranotes || ultranotes.length === 0) {
      res.status(StatusCodes.OK).json({
        message: 'No ultranotes available for this ultra test',
        data: [],
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      message: 'Ultranotes retrieved successfully',
      success: true,
      data: ultranotes,
    });
  }
);

const getUltranotesByname = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { testName } = req.params;
    if (!testName) {
      throw new BadRequestError('Ultra ID is required');
    }
    const services = await Service.findOne({ service:testName })

    // Validate required field
    

    // Find all ultranotes for the given ultra test
    const ultranotes = await Ultranote.find({ Ultra: services._id }).exec();

    if (!ultranotes || ultranotes.length === 0) {
      res.status(StatusCodes.OK).json({
        message: 'No ultranotes available for this ultra test',
        data: [],
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      message: 'Ultranotes retrieved successfully',
      success: true,
      data: ultranotes,
    });
  }
);
/**
 * Update an existing Ultranote
 */
const updateUltranote = asyncWrapper(
  async (req:Request, res: Response): Promise<void> => {
    const { ultraId } = req.params;
    const { note, noteA, noteB, noteC, noteD, noteF } = req.body;

    // Validate required field
    if (!ultraId) {
      throw new BadRequestError('Ultranote ID is required');
    }

    // Find and update the Ultranote document by ID
    const updatedUltranote = await Ultranote.findByIdAndUpdate(
        ultraId,
      { note, noteA, noteB, noteC, noteD, noteF },
      { new: true }
    ).exec();

    if (!updatedUltranote) {
      throw new NotFoundError('Ultranote not found');
    }

   


    // Save the updated ultranote
    await updatedUltranote.save();

    res.status(StatusCodes.OK).json({
      message: 'Ultranote updated successfully',
      success: true,
      data: updatedUltranote,
    });
  }
);

/**
 * Delete an Ultranote
 */
const deleteUltranote = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { ultraId } = req.params;

    // Validate required field
    if (!ultraId) {
      throw new BadRequestError('Ultranote ID is required');
    }

    // Find and delete the Ultranote document by ID
    const deletedUltranote = await Ultranote.findByIdAndDelete(ultraId).exec();
    if (!deletedUltranote) {
      throw new NotFoundError('Ultranote not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Ultranote deleted successfully',
      success: true,
    });
  }
);

/**
 * Get a single Ultranote by ID
 */
const getUltranote = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validate required field
    if (!id) {
      throw new BadRequestError('Ultranote ID is required');
    }

    // Find the ultranote by ID
    const ultranote = await Ultranote.findById(id).exec();
    if (!ultranote) {
      throw new NotFoundError('Ultranote not found');
    }

    res.status(StatusCodes.OK).json({
      message: 'Ultranote retrieved successfully',
      success: true,
      data: ultranote,
    });
  }
);

export {
  createUltranote,
  getUltranotesByUltra,
  updateUltranote,
  deleteUltranote,
  getUltranote,
  getUltranotesByname
};