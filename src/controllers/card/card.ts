import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Card from '../../models/card';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a new card
const createCard = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const { cardprice } = req.body;

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  if (!cardprice) {
    throw new BadRequestError('Missing required fields: cardprice');
  }

  // Find the patient by ID
  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  // Create a new Card
  const newCard = new Card({
    cardprice,
    patient: patient._id,
    
    createdBy,
  });

  const savedCard = await newCard.save();

  // Link the card to the patient
  patient.Card = patient.Card || [];
  patient.Card.push(savedCard._id);
  await patient.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Card created successfully',
    success: true,
    data: savedCard,
  });
});

const getCards = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Patient ID from URL params
  
    // Validate required fields
    if (!id) {
      throw new BadRequestError('Patient ID is required');
    }
  
    // Find the patient by ID and populate the Card field
    const patient = await Patient.findById(id).populate('Card').exec();
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
  
    if (!patient.Card || patient.Card.length === 0) {
      res.status(StatusCodes.OK).json({
        message: 'No Card available for this patient',
        data: [],
      });
      return;
    }
  
    // Sort the cards by `createdAt` in descending order
    const sortedCards = patient.Card.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
    res.status(StatusCodes.OK).json({
      message: 'Card retrieved successfully',
      success: true,
      data: sortedCards,
    });
  });
  

  const updateCard = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId, ...data } = req.body;
  
    // Validate the required fields
    if (!recordId) {
      throw new BadRequestError('Finding ID is required');
    }
  
    // Find and update the Card record by ID
    const updatedCard = await Card.findByIdAndUpdate(recordId, data, { new: true }).exec();
    if (!updatedCard) {
      throw new NotFoundError('Card finding not found');
    }
  
    res.status(StatusCodes.OK).json({
      message: 'Card finding updated successfully',
      success: true,
      data: updatedCard,
    });
  });
  
  
  const deleteCard = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.body;
  
    // Validate the required fields
    if (!recordId) {
      throw new BadRequestError('Finding ID is required');
    }
  
    // Find and delete the Card record by ID
    const deletedCard = await Card.findByIdAndDelete(recordId).exec();
    if (!deletedCard) {
      throw new NotFoundError('Card finding not found');
    }
  
    // Optional: Remove references from related documents (if applicable)
  
    res.status(StatusCodes.OK).json({
      message: 'Card finding deleted successfully',
      success: true,
    });
  });
  

  export { createCard, getCards , updateCard, deleteCard };  