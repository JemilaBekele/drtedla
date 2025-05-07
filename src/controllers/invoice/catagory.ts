import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import Category from '../../models/catagory';






const createCategory = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { name,Imaging } = req.body;

  // Validate request
  if (!name) {
    throw new BadRequestError('Category and price are required');
  }


  // Create new Category
  const newCategory = await Category.create({
    name,Imaging
  });

  // Send response
  res.status(StatusCodes.CREATED).json({
    message: 'Category registered successfully',
    Category: newCategory,
  });
});





const getAllCategorys = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all Categorys from the database
    const Categorys = await Category.find();
console.log(Categorys)
    // Return the Categorys
    res.status(StatusCodes.OK).json({Categorys, count: Categorys.length});
  } catch (error) {
    console.error('Error fetching Categorys:', error);

    // Return a generic error response
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch Categorys',
    });
  }
});




const updateCategory = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const {  name} = req.body;
  const { id } = req.params;
  // Validate inputs
  if (!id || (!name)) {
    throw new BadRequestError('Category ID and at least one field (Category or price) are required');
  }

  // Find and update the Category by its ID
  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { name},
    { new: true } // Return the updated document
  );

  console.log("update")
  if (!updatedCategory) {
    throw new NotFoundError('Category not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Category updated successfully',
    Category: updatedCategory,
  });
});




const deleteCategory = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

  // Validate input
  if (!id) {
    throw new BadRequestError('Category ID is required');
  }

  // Find and delete the Category by its ID
  const deletedCategory = await Category.findByIdAndDelete(id);

  if (!deletedCategory) {
    throw new NotFoundError('Category not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Category deleted successfully',
  });
});



export { createCategory, getAllCategorys, updateCategory, deleteCategory  };