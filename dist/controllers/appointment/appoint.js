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
exports.getAppointmentsschejule = exports.updateAppointment = exports.getAppointment = exports.getAppointments = exports.createAppointment = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const appointment_1 = __importDefault(require("../../models/appointment"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const Users_1 = __importDefault(require("../../models/Users"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new appointment
// Create a new appointment
const createAppointment = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId } = req.params; // Patient ID from URL params
    const { appointmentDate, appointmentTime, reasonForVisit, doctorId } = req.body;
    // Validate required fields
    if (!patientId) {
        throw new bad_request_1.default('Patient ID is required');
    }
    if (!appointmentDate || !appointmentTime) {
        throw new bad_request_1.default('Missing required fields: appointmentDate and appointmentTime are required');
    }
    // Find the patient by ID
    const patient = yield Patient_1.default.findById(patientId).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    // Validate doctorId is provided
    if (!doctorId) {
        throw new bad_request_1.default('Doctor ID is required');
    }
    // Determine doctor information
    let doctorInfo;
    // For non-doctors, doctorId must be provided in request body
    const doctorExists = yield Users_1.default.findById(doctorId).exec();
    if (!doctorExists || doctorExists.role !== 'doctor') {
        throw new bad_request_1.default('Invalid doctor ID provided');
    }
    doctorInfo = {
        id: new mongoose_1.default.Types.ObjectId(doctorId),
        username: doctorExists.username,
    };
    // Determine createdBy - randomly select a user with role 'User' from User model
    let createdBy;
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
    // Prepare patient info for the appointment
    const patientInfo = {
        id: patient._id,
        username: patient.firstname, // Using firstname as username for patient
        cardno: patient.cardno,
    };
    // Create a new Appointment with default status 'Scheduled'
    const newAppointment = new appointment_1.default({
        appointmentDate,
        appointmentTime,
        reasonForVisit: reasonForVisit || '', // Optional field
        status: 'Scheduled', // Default status
        doctorId: doctorInfo,
        patientId: patientInfo,
        createdBy,
    });
    const savedAppointment = yield newAppointment.save();
    // Link the appointment to the patient
    patient.Appointment = patient.Appointment || [];
    patient.Appointment.push(savedAppointment._id);
    yield patient.save();
    // Remove createdBy from the response
    const appointmentResponse = savedAppointment.toObject();
    delete appointmentResponse.createdBy;
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Appointment created successfully',
        success: true,
        data: appointmentResponse,
    });
}));
exports.createAppointment = createAppointment;
// Get all appointments for a patient
// Get all appointments for a patient
const getAppointments = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId } = req.params; // Patient ID from URL params
    // Validate required fields
    if (!patientId) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Find all appointments for this patient using the new schema structure
    const appointments = yield appointment_1.default.find({ 'patientId.id': patientId })
        .sort({ createdAt: -1 }) // Sort by newest first
        .exec();
    if (!appointments || appointments.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No appointments available for this patient',
            success: true,
            data: [],
            count: 0,
        });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Appointments retrieved successfully',
        success: true,
        data: appointments,
        count: appointments.length,
    });
}));
exports.getAppointments = getAppointments;
// Get a specific appointment by ID
const getAppointment = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { appointmentId } = req.params; // Appointment ID from URL params
    // Validate required fields
    if (!appointmentId) {
        throw new bad_request_1.default('Appointment ID is required');
    }
    // Find the appointment by ID directly from Appointment model
    const appointment = yield appointment_1.default.findById(appointmentId).exec();
    if (!appointment) {
        throw new not_found_1.default('Appointment not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Appointment retrieved successfully',
        success: true,
        data: appointment,
    });
}));
exports.getAppointment = getAppointment;
// Update a specific appointment
const updateAppointment = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { appointmentId } = req.params; // Get appointmentId from URL params
    const updateData = req.body;
    // Validate required fields
    if (!appointmentId) {
        throw new bad_request_1.default('Appointment ID is required');
    }
    // Allowed updates including doctorId
    const allowedUpdates = ['appointmentDate', 'appointmentTime', 'reasonForVisit', 'status', 'doctorId'];
    const filteredUpdateData = {};
    for (const key of Object.keys(updateData)) {
        if (allowedUpdates.includes(key)) {
            // Handle doctorId update specially
            if (key === 'doctorId') {
                // Check if doctorId is provided as a string (ID only) or as an object
                if (typeof updateData.doctorId === 'string') {
                    // Fetch doctor details from User model
                    const doctorExists = yield Users_1.default.findById(updateData.doctorId).exec();
                    if (!doctorExists || doctorExists.role !== 'doctor') {
                        throw new bad_request_1.default('Invalid doctor ID provided');
                    }
                    filteredUpdateData.doctorId = {
                        id: doctorExists._id,
                        username: doctorExists.username,
                    };
                }
                else if (typeof updateData.doctorId === 'object' && updateData.doctorId.id) {
                    // If doctorId is provided as an object with id
                    const doctorExists = yield Users_1.default.findById(updateData.doctorId.id).exec();
                    if (!doctorExists || doctorExists.role !== 'doctor') {
                        throw new bad_request_1.default('Invalid doctor ID provided');
                    }
                    filteredUpdateData.doctorId = {
                        id: doctorExists._id,
                        username: doctorExists.username,
                    };
                }
                else {
                    throw new bad_request_1.default('Invalid doctor ID format');
                }
            }
            else {
                filteredUpdateData[key] = updateData[key];
            }
        }
    }
    // Find and update the appointment by ID
    const updatedAppointment = yield appointment_1.default.findByIdAndUpdate(appointmentId, filteredUpdateData, {
        new: true, // Return the updated document
        runValidators: true // Run schema validations
    }).exec();
    if (!updatedAppointment) {
        throw new not_found_1.default('Appointment not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Appointment updated successfully',
        success: true,
        data: updatedAppointment,
    });
}));
exports.updateAppointment = updateAppointment;
// Get all scheduled appointments
const getAppointmentsschejule = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Find all appointments and populate patient and doctor info
    const appointments = yield appointment_1.default.find({ status: 'Scheduled' })
        .sort({ appointmentDate: 1, appointmentTime: 1 }) // Sort by date and time ascending
        .select('-createdBy') // Exclude createdBy field from the query
        .exec();
    if (!appointments || appointments.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No scheduled appointments available',
            success: true,
            data: [],
            count: 0,
        });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Appointments retrieved successfully',
        success: true,
        data: appointments,
        count: appointments.length,
    });
}));
exports.getAppointmentsschejule = getAppointmentsschejule;
