"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientStatistics = exports.getDiseaseStatistics = exports.searchDiseases = exports.deleteDisease = exports.updateDisease = exports.getDiseaseById = exports.getAllDiseases = exports.createDisease = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Disease_1 = __importDefault(require("../../models/Disease"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const MedicalFinding_1 = __importDefault(require("../../models/MedicalFinding"));
const Agestatic_1 = __importDefault(require("../../models/Agestatic"));
/**
 * Create a new Disease record
 * Expects the `disease` field in the request body.
 */
const createDisease = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { disease } = req.body;
    // Validate required field
    if (!disease) {
        throw new bad_request_1.default("Disease name is required");
    }
    // Build createdBy object using authenticated user details
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || "",
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || "",
    };
    // Create a new Disease document
    const newDisease = new Disease_1.default({
        disease,
        createdBy,
    });
    const savedDisease = yield newDisease.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: "Disease created successfully",
        success: true,
        data: savedDisease,
    });
}));
exports.createDisease = createDisease;
/**
 * Retrieve all Disease records.
 */
const getAllDiseases = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const diseases = yield Disease_1.default.find({});
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Diseases retrieved successfully",
            success: true,
            data: diseases,
        });
    }
    catch (error) {
        console.error("Error retrieving diseases:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
}));
exports.getAllDiseases = getAllDiseases;
const searchDiseases = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        // Validate and convert page and limit to numbers
        const pageNumber = Math.max(1, parseInt(page) || 1);
        const limitNumber = Math.max(1, parseInt(limit)) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        // Build the query
        const query = {};
        if (search && typeof search === 'string' && search.trim() !== '') {
            // Search by disease name (case insensitive)
            query.disease = { $regex: search.trim(), $options: "i" };
        }
        // Execute the query with pagination
        const [diseases, total] = yield Promise.all([
            Disease_1.default.find(query)
                .skip(skip)
                .limit(limitNumber)
                .sort({ disease: 1 })
                .lean(),
            Disease_1.default.countDocuments(query)
        ]);
        res.status(http_status_codes_1.StatusCodes.OK).json({
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
    }
    catch (error) {
        console.error("Error searching diseases:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Internal server error"
        });
    }
}));
exports.searchDiseases = searchDiseases;
/**
 * Retrieve a Disease by ID.
 */
const getDiseaseById = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new bad_request_1.default("Disease ID is required");
    }
    const disease = yield Disease_1.default.findById(id).exec();
    if (!disease) {
        throw new not_found_1.default("Disease not found");
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: "Disease retrieved successfully",
        success: true,
        data: disease,
    });
}));
exports.getDiseaseById = getDiseaseById;
/**
 * Update an existing Disease record by ID.
 */
const updateDisease = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { disease } = req.body;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default("Disease ID is required");
    }
    if (!disease) {
        throw new bad_request_1.default("Disease name is required");
    }
    const updatedDisease = yield Disease_1.default.findByIdAndUpdate(id, { disease }, { new: true }).exec();
    if (!updatedDisease) {
        throw new not_found_1.default("Disease not found");
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: "Disease updated successfully",
        success: true,
        data: updatedDisease,
    });
}));
exports.updateDisease = updateDisease;
/**
 * Delete a Disease record by ID.
 */
const deleteDisease = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Validate required field
    if (!id) {
        throw new bad_request_1.default("Disease ID is required");
    }
    // Find and delete the Disease document by ID
    const deletedDisease = yield Disease_1.default.findByIdAndDelete(id).exec();
    if (!deletedDisease) {
        throw new not_found_1.default("Disease not found");
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: "Disease deleted successfully",
        success: true,
    });
}));
exports.deleteDisease = deleteDisease;
const getDiseaseStatistics = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
        throw new bad_request_1.default("Start date and end date are required");
    }
    // Parse and validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!start || !end) {
        throw new bad_request_1.default("start and end date is required");
    }
    // Aggregation pipeline
    const diseaseStatistics = yield MedicalFinding_1.default.aggregate([
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
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: "Data retrieved successfully",
        success: true,
        data: diseaseStatistics,
    });
}));
exports.getDiseaseStatistics = getDiseaseStatistics;
const getPatientStatistics = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
        throw new bad_request_1.default("Start date and end date are required");
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new bad_request_1.default("Invalid date format");
    }
    const statistics = yield Agestatic_1.default.aggregate([
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
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: "Statistics fetched successfully",
        success: true,
        data: statistics
    });
}));
exports.getPatientStatistics = getPatientStatistics;
