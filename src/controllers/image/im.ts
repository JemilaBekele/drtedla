import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import multer from 'multer';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import Image from '../../models/image';
import { uploadImage } from '../../helpers/uploadImage';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

interface RequestWithFiles extends Request {
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;
  user?: {
    userId: string;
    username: string;
  };
}

// Multer setup for image upload
const upload = multer({
  storage: multer.memoryStorage(),
}).fields([
  { name: 'image', maxCount: 1 },
]);

// Create image
const createImage = asyncWrapper(async (req: RequestWithFiles, res: Response): Promise<void> => {
  const { patientId } = req.body;
  
  if (!patientId) {
    throw new BadRequestError('Patient ID is required');
  }

  if (!req.files || typeof req.files !== 'object' || !('image' in req.files)) {
    throw new BadRequestError('Please provide an image');
  }

  const imageFile = req.files['image']?.[0];
  const imagePath = await uploadImage(imageFile);

  const newImage = await Image.create({
    patientId,
    image: imagePath,
  });

  res.status(StatusCodes.CREATED).json({
    message: 'Image uploaded successfully',
    data: newImage,
  });
});

// Get all images for a patient
const getImagesByPatientId = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // patientId

  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  const images = await Image.find({ patientId: id }).sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    message: 'Images retrieved successfully',
    data: images,
  });
});

// Delete image by 
const deleteImage = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // imageId

  if (!id) {
    throw new BadRequestError('Image ID is required');
  }

  const deletedImage = await Image.findByIdAndDelete(id);
  if (!deletedImage) {
    throw new NotFoundError('Image not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Image deleted successfully',
  });
});

// Export multer middleware for route use
export {
    createImage,
    deleteImage,
    getImagesByPatientId
  };
  