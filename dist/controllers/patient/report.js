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
exports.patientSearchController = exports.getMedicalFindingsForUser = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const MedicalFinding_1 = __importDefault(require("../../models/MedicalFinding"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
// Controller function to get medical findings for a user in the last month
const getMedicalFindingsForUser = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user is authenticated
    const user = req.user;
    if (!user) {
        throw new bad_request_1.default('User is not authenticated');
    }
    const createdBy = user.userId;
    if (!createdBy) {
        throw new bad_request_1.default('CreatedBy username is required');
    }
    // Get the date for one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    // Find medical findings created within the last month
    const recentMedicalFindings = yield MedicalFinding_1.default.find({
        'createdBy.id': createdBy,
        createdAt: { $gte: oneMonthAgo }
    }).exec();
    if (recentMedicalFindings.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "No recent medical findings available for this user",
            data: [],
        });
    }
    // Extract patient IDs from the findings
    const patientIds = recentMedicalFindings.map((finding) => finding.patientId.id);
    // Find the patients using the IDs from the findings
    const patients = yield Patient_1.default.find({
        _id: { $in: patientIds }
    }).exec();
    // Combine patient data with their medical findings
    const patientsWithFindings = patients.map((patient) => {
        const findings = recentMedicalFindings.filter((finding) => finding.patientId.id.toString() === patient._id.toString());
        return Object.assign(Object.assign({}, patient.toObject()), { MedicalFinding: findings });
    });
    console.log(patientsWithFindings);
    // Respond with combined data
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Patients and medical findings retrieved successfully',
        success: true,
        data: patientsWithFindings,
    });
}));
exports.getMedicalFindingsForUser = getMedicalFindingsForUser;
const patientSearchController = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, date } = req.body;
    // Validate input
    if (!firstName && !date) {
        throw new bad_request_1.default('At least one search criteria (firstName or date) is required');
    }
    // Build the query object
    const query = {}; // Now query is explicitly typed
    if (firstName) {
        query.firstname = { $regex: new RegExp(firstName, 'i') }; // Case-insensitive search
    }
    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day
        query.createdAt = { $gte: startDate, $lte: endDate }; // Filter for the entire day
    }
    // Search for patients matching the query
    const patients = yield Patient_1.default.find(query).exec();
    // Check if no patients found
    if (patients.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No patients found matching the criteria',
            data: [],
        });
        return; // Exit after sending the response
    }
    // Respond with the found patients
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Patients found successfully',
        success: true,
        data: patients,
    });
}));
exports.patientSearchController = patientSearchController;
