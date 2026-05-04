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
exports.searchPatients = exports.getAllpatient = exports.updatepatient = exports.getpatient = exports.createPatient = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const Users_1 = __importDefault(require("../../models/Users"));
// Create a new bicycle
// Create a new patient
const createPatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardno, firstname, status, age, sex, phoneNumber, Town, KK, HNo, description, isbrace, disablity, HomePhone, Address, Email, EmergencyContactPhone, FinancialResponsible, ParentGuardianInfo, DOB, Woreda, Region } = req.body;
    let createdBy;
    // Check if user is logged in
    if (req.user && req.user.userId && req.user.username) {
        // User is authenticated, use their info as creator
        createdBy = {
            id: req.user.userId,
            username: req.user.username,
        };
    }
    else {
        // No logged-in user - randomly select a user with role 'User' from User model
        // Find users with role 'User' and not locked
        const availableUsers = yield Users_1.default.find({
            role: 'User',
            lock: false // Only non-locked users
        });
        if (availableUsers.length === 0) {
            // Fallback: get any unlocked user if no 'User' role exists
            const anyUser = yield Users_1.default.findOne({ lock: false });
            if (anyUser) {
                createdBy = {
                    id: anyUser._id,
                    username: anyUser.username,
                };
            }
            else {
                // Ultimate fallback - system user
                createdBy = {
                    id: 'system',
                    username: 'system',
                };
            }
        }
        else {
            // Select random user from available 'User' role users
            const randomIndex = Math.floor(Math.random() * availableUsers.length);
            const randomUser = availableUsers[randomIndex];
            createdBy = {
                id: randomUser._id,
                username: randomUser.username,
            };
        }
    }
    const existingPatient = yield Patient_1.default.findOne({ cardno });
    if (existingPatient) {
        throw new bad_request_1.default('Patient ID already exists. Please use a unique patient ID.');
    }
    // Prepare patient data
    const patientData = {
        cardno,
        firstname,
        age,
        sex,
        status,
        phoneNumber,
        Town,
        KK,
        HNo,
        description,
        createdBy,
        isbrace: isbrace || false,
        disablity: disablity || false,
        HomePhone: HomePhone || '',
        Address: Address || '',
        Email: Email || '',
        EmergencyContactPhone: EmergencyContactPhone || '',
        FinancialResponsible: FinancialResponsible || 'Self',
        ParentGuardianInfo: ParentGuardianInfo || {},
        DOB: DOB || null,
        Woreda: Woreda || '',
        Region: Region || ''
    };
    const patient = yield Patient_1.default.create(patientData);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({ patient });
}));
exports.createPatient = createPatient;
// Get a single bicycle by ID
const getpatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: PatientId } = req.params;
    if (!PatientId) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Pass the ObjectId directly to findById
    const patient = yield Patient_1.default.findById({ _id: PatientId });
    if (!patient) {
        throw new not_found_1.default(`No Patient found with ID: ${PatientId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ patient });
}));
exports.getpatient = getpatient;
// Get all bicycles
// Get all patients with pagination
const getAllpatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const patients = yield Patient_1.default.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Sort by newest first
    const totalPatients = yield Patient_1.default.countDocuments({});
    const totalPages = Math.ceil(totalPatients / limit);
    console.log(`Fetching patients - Page: ${page}, Limit: ${limit}`);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        patients,
        count: patients.length,
        total: totalPatients,
        totalPages,
        currentPage: page,
        limit
    });
}));
exports.getAllpatient = getAllpatient;
// Update patient
const updatepatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: PatientId } = req.params;
    if (!PatientId) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const updatedpatient = yield Patient_1.default.findByIdAndUpdate(PatientId, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedpatient) {
        throw new not_found_1.default(`No Patient found with ID: ${PatientId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Patient updated successfully',
        Patient: updatedpatient
    });
}));
exports.updatepatient = updatepatient;
// Search patients with pagination
const searchPatients = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardno, name, phoneNumber } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    console.log(cardno);
    // Check if at least one search parameter is provided
    if (!cardno && !name && !phoneNumber) {
        throw new bad_request_1.default('Please provide at least one search parameter (cardno, name, or phoneNumber)');
    }
    // Build the search query dynamically based on provided parameters
    const query = {};
    if (cardno) {
        query.cardno = { $regex: cardno, $options: 'i' };
    }
    if (name) {
        query.$or = [
            { firstname: { $regex: name, $options: 'i' } },
            { lastname: { $regex: name, $options: 'i' } }
        ];
    }
    if (phoneNumber) {
        query.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    }
    const patients = yield Patient_1.default.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    const totalPatients = yield Patient_1.default.countDocuments(query);
    const totalPages = Math.ceil(totalPatients / limit);
    if (patients.length === 0) {
        throw new not_found_1.default('No patients found matching the search criteria');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        count: patients.length,
        total: totalPatients,
        totalPages,
        currentPage: page,
        limit,
        data: patients
    });
}));
exports.searchPatients = searchPatients;
