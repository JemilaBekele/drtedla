import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncWrapper from "../../middleware/async";
import Disease from "../../models/Disease";
import BadRequestError from "../../errors/bad-request";
import NotFoundError from "../../errors/not-found";
import MedicalFinding from "../../models/MedicalFinding";
import Patient from "../../models/Patient";
import Age from "../../models/Agestatic";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

/**
 * Create a new Disease record
 * Expects the `disease` field in the request body.
 */
const createDisease = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { disease } = req.body;

    // Validate required field
    if (!disease) {
      throw new BadRequestError("Disease name is required");
    }

    // Build createdBy object using authenticated user details
    const createdBy = {
      id: req.user?.userId || "",
      username: req.user?.username || "",
    };

    // Create a new Disease document
    const newDisease = new Disease({
      disease,
      createdBy,
    });

    const savedDisease = await newDisease.save();

    res.status(StatusCodes.CREATED).json({
      message: "Disease created successfully",
      success: true,
      data: savedDisease,
    });
  }
);

/**
 * Retrieve all Disease records.
 */
const getAllDiseases = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  try {
    const diseases = await Disease.find({});
    res.status(StatusCodes.OK).json({
      message: "Diseases retrieved successfully",
      success: true,
      data: diseases,
    });
  } catch (error) {
    console.error("Error retrieving diseases:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
  }
});



const searchDiseases = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    // Validate and convert page and limit to numbers
    const pageNumber = Math.max(1, parseInt(page as string) || 1)
    const limitNumber = Math.max(1, parseInt(limit as string)) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Build the query
    const query: any = {};
    
    if (search && typeof search === 'string' && search.trim() !== '') {
      // Search by disease name (case insensitive)
      query.disease = { $regex: search.trim(), $options: "i" };
    }

    // Execute the query with pagination
    const [diseases, total] = await Promise.all([
      Disease.find(query)
        .skip(skip)
        .limit(limitNumber)
        .sort({ disease: 1 })
        .lean(),
      Disease.countDocuments(query)
    ]);

    res.status(StatusCodes.OK).json({
      message: "Diseases retrieved successfully",
      success: true,
      data: diseases,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error searching diseases:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});

/**
 * Retrieve a Disease by ID.
 */
const getDiseaseById = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError("Disease ID is required");
  }

  const disease = await Disease.findById(id).exec();
  if (!disease) {
    throw new NotFoundError("Disease not found");
  }

  res.status(StatusCodes.OK).json({
    message: "Disease retrieved successfully",
    success: true,
    data: disease,
  });
});

/**
 * Update an existing Disease record by ID.
 */
const updateDisease = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { disease } = req.body;

  // Validate required fields
  if (!id) {
    throw new BadRequestError("Disease ID is required");
  }
  if (!disease) {
    throw new BadRequestError("Disease name is required");
  }

  const updatedDisease = await Disease.findByIdAndUpdate(id, { disease }, { new: true }).exec();

  if (!updatedDisease) {
    throw new NotFoundError("Disease not found");
  }

  res.status(StatusCodes.OK).json({
    message: "Disease updated successfully",
    success: true,
    data: updatedDisease,
  });
});

/**
 * Delete a Disease record by ID.
 */
const deleteDisease = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Validate required field
  if (!id) {
    throw new BadRequestError("Disease ID is required");
  }

  // Find and delete the Disease document by ID
  const deletedDisease = await Disease.findByIdAndDelete(id).exec();
  if (!deletedDisease) {
    throw new NotFoundError("Disease not found");
  }

  res.status(StatusCodes.OK).json({
    message: "Disease deleted successfully",
    success: true,
  });
});


const getDiseaseStatistics = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      throw new BadRequestError("Start date and end date are required");
    }

    // Parse and validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    if (!start || !end) {
      throw new BadRequestError("start and end date is required");
    }
    // Aggregation pipeline
    const diseaseStatistics = await MedicalFinding.aggregate([
      {
        $match: {
          diseases: { $exists: true, $ne: [] },
          "diseases.diseaseTime": { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "patientId.id",
          foreignField: "_id",
          as: "patientInfo",
        },
      },
      { $unwind: "$patientInfo" },
      {
        $lookup: {
          from: "diseases",
          localField: "diseases.disease",
          foreignField: "_id",
          as: "diseaseInfo",
        },
      },
      { $unwind: "$diseaseInfo" },
      {
        $addFields: {
          age: { $toInt: "$patientInfo.age" },
          gender: "$patientInfo.sex",
          disease: "$diseaseInfo.disease",
        },
      },
      {
        $group: {
          _id: {
            disease: "$disease",
            gender: "$gender",
            ageGroup: {
              $switch: {
                branches: [
                  { case: { $lt: ["$age", 1] }, then: "<1" },
                  { case: { $and: [{ $gte: ["$age", 1] }, { $lte: ["$age", 4] }] }, then: "1-4" },
                  { case: { $and: [{ $gte: ["$age", 5] }, { $lte: ["$age", 14] }] }, then: "5-14" },
                  { case: { $and: [{ $gte: ["$age", 15] }, { $lte: ["$age", 29] }] }, then: "15-29" },
                  { case: { $and: [{ $gte: ["$age", 30] }, { $lte: ["$age", 64] }] }, then: "30-64" },
                  { case: { $gte: ["$age", 65] }, then: "65+" }
                ],
                default: "Unknown"
              }
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.disease",
          stats: {
            $push: {
              gender: "$_id.gender",
              ageGroup: "$_id.ageGroup",
              count: "$count",
            },
          },
        },
      },
    ]);

    res.status(StatusCodes.OK).json({
      message: "Data retrieved successfully",
      success: true,
      data: diseaseStatistics,
    });
  }
);

const getPatientStatistics = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      throw new BadRequestError("Start date and end date are required");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestError("Invalid date format");
    }

    const statistics = await Age.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: "patients",
          localField: "patient",
          foreignField: "_id",
          as: "patient"
        }
      },
      {
        $unwind: "$patient"
      },
      {
        $addFields: {
          ageInt: { $toInt: "$patient.age" }
        }
      },
      {
        $group: {
          _id: {
            gender: "$patient.sex",
            ageGroup: {
              $switch: {
                branches: [
                  { case: { $lt: ["$ageInt", 5] }, then: "<5" },
                  { case: { $and: [{ $gte: ["$ageInt", 5] }, { $lte: ["$ageInt", 10] }] }, then: "5-10" },
                  { case: { $and: [{ $gte: ["$ageInt", 11] }, { $lte: ["$ageInt", 19] }] }, then: "11-19" },
                  { case: { $and: [{ $gte: ["$ageInt", 20] }, { $lte: ["$ageInt", 29] }] }, then: "20-29" },
                  { case: { $and: [{ $gte: ["$ageInt", 30] }, { $lte: ["$ageInt", 45] }] }, then: "30-45" },
                  { case: { $and: [{ $gte: ["$ageInt", 46] }, { $lte: ["$ageInt", 65] }] }, then: "46-65" },
                  { case: { $gte: ["$ageInt", 66] }, then: "66+" }
                ],
                default: "Unknown"
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.gender",
          ageGroups: {
            $push: {
              ageGroup: "$_id.ageGroup",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      },
      {
        $project: {
          gender: "$_id",
          ageGroups: 1,
          total: 1,
          _id: 0
        }
      }
    ]);

    res.status(StatusCodes.OK).json({
      message: "Statistics fetched successfully",
      success: true,
      data: statistics
    });
  }
);

export {
  createDisease,
  getAllDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease,
  searchDiseases,
  getDiseaseStatistics,getPatientStatistics
};
