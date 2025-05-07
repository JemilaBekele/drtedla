import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Service from '../../models/Services';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import Category from '../../models/catagory';






const createService = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { service, price,catagory } = req.body;

  // Validate request
  if (!service || !price) {
    throw new BadRequestError('Service and price are required');
  }

   const Categorys = await Category.findById({_id:catagory});

  // Check if the service already exists
  const existingService = await Service.findOne({ service });
  if (existingService) {
    throw new BadRequestError('Service already exists');
  }

  // Create new service
  const newService = await Service.create({
    service,
    price,
    categoryId: Categorys._id
  });

  // Send response
  res.status(StatusCodes.CREATED).json({
    message: 'Service registered successfully',
    service: newService,
  });
});





const getAllServices = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all services and populate the categoryId with the category name
    const services = await Service.find()
      .populate('categoryId', 'name'); // Populate categoryId with the 'name' field from the Category model

    // Return the services
    res.status(StatusCodes.OK).json({services, count: services.length});
  } catch (error) {
    console.error('Error fetching services:', error);

    // Return a generic error response
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch services',
    });
  }
});


const getAllcatultrasoun = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Find ALL categories where Imaging is true
    const imagingCategories = await Category.find({ Imaging: true });

    if (!imagingCategories || imagingCategories.length === 0) {
       res.status(StatusCodes.NOT_FOUND).json({ 
        message: "No imaging categories found" 
      });
    }

    // 2. Get all category IDs
    const categoryIds = imagingCategories.map(cat => cat._id);

    // 3. Find services that belong to ANY of these categories
    const services = await Service.find({ 
      categoryId: { $in: categoryIds } 
    }).populate('categoryId', 'name');

    // 4. Return the services
    res.status(StatusCodes.OK).json({ 
      services, 
      count: services.length 
    });

  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch services",
    });
  }
});

const getIdcatultrasoun = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Fetch only the `service` field of the matching service
    const services = await Service.find({ _id: id })
      .select('service') // Only include `service` field
     // Optional: include category name if needed

    res.status(StatusCodes.OK).json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch services",
    });
  }
});
const getAllservice = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const {id}=req.params;
  console.log(id)
  try {
 
    // Fetch services that belong to the retrieved category
    const services = await Service.find({ categoryId: id}).populate('categoryId', 'name'); 

    // Return the services
    console.log(services)
    res.status(StatusCodes.OK).json({services, count: services.length});
  } catch (error) {
    console.error("Error fetching services:", error);

    // Return a generic error response
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch services",
    });
  }
});


const updateService = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id, service, price,catagory } = req.body;

  // Validate inputs
  if (!id || (!service && !price)) {
    throw new BadRequestError('Service ID and at least one field (service or price) are required');
  }
  const Categorys = await Category.findById({_id:catagory});

  // Find and update the service by its ID
  const updatedService = await Service.findByIdAndUpdate(
    id,
    { service, price,  categoryId: Categorys._id },
    { new: true } // Return the updated document
  );

  console.log("update")
  if (!updatedService) {
    throw new NotFoundError('Service not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Service updated successfully',
    service: updatedService,
  });
});




const deleteService = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body;

  // Validate input
  if (!id) {
    throw new BadRequestError('Service ID is required');
  }

  // Find and delete the service by its ID
  const deletedService = await Service.findByIdAndDelete(id);

  if (!deletedService) {
    throw new NotFoundError('Service not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Service deleted successfully',
  });
});



export { createService, getAllServices, updateService, deleteService ,getAllcatultrasoun ,getAllservice,getIdcatultrasoun };