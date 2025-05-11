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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointment = exports.updateAppointment = exports.getAppointment = exports.getAppointments = exports.createAppointment = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const appointment_1 = __importDefault(require("../../models/appointment"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const Users_1 = __importDefault(require("../../models/Users"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new appointment
const createAppointment = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { id } = req.params; // Patient ID from URL params
    const { appointmentDate, appointmentTime, reasonForVisit, status, doctorId } = req.body;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    if (!appointmentDate || !appointmentTime || !status) {
        throw new bad_request_1.default('Missing required fields');
    }
    // Find the patient by ID
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    // Determine doctor ID based on user role
    let assignedDoctorId;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'doctor') {
        // If user is a doctor, use their own ID
        assignedDoctorId = new mongoose_1.default.Types.ObjectId(req.user.userId);
    }
    else if (doctorId) {
        // For non-doctors, doctorId must be provided in request body
        assignedDoctorId = new mongoose_1.default.Types.ObjectId(doctorId);
        // Verify the doctor exists
        const doctorExists = yield Users_1.default.findById(doctorId).exec();
        if (!doctorExists || doctorExists.role !== 'doctor') {
            throw new bad_request_1.default('Invalid doctor ID provided');
        }
    }
    else {
        throw new bad_request_1.default('Doctor ID is required for non-doctor users');
    }
    const createdBy = {
        id: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || '',
        username: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.username) || '',
    };
    // Create a new Appointment
    const newAppointment = new appointment_1.default({
        appointmentDate,
        appointmentTime,
        reasonForVisit,
        status,
        patientId: patient._id, // Simplified from { id: patient._id }
        doctorId: assignedDoctorId,
        createdBy,
    });
    const savedAppointment = yield newAppointment.save();
    // Link the appointment to the patient
    patient.Appointment = patient.Appointment || [];
    patient.Appointment.push(savedAppointment._id);
    yield patient.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Appointment created successfully',
        success: true,
        data: savedAppointment,
    });
}));
exports.createAppointment = createAppointment;
// Get all appointments for a patient
const getAppointments = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Patient ID from URL params
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Find the patient by ID and populate the Appointment field
    const patient = yield Patient_1.default.findById(id).populate('Appointment').exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    if (!patient.Appointment || patient.Appointment.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No Appointment available for this patient',
            data: [],
        });
        return;
    }
    // Sort the appointments by `createdAt` in descending order
    const sortedAppointments = patient.Appointment.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Appointments retrieved successfully',
        success: true,
        data: sortedAppointments,
    });
}));
exports.getAppointments = getAppointments;
// Get a specific appointment by patientId and recordId
const getAppointment = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId, recordId } = req.params;
    // Validate required fields
    if (!patientId || !recordId) {
        throw new bad_request_1.default('Patient ID and Appointment ID are required');
    }
    // Find the patient by ID
    const patient = yield Patient_1.default.findById(patientId).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    // Find the appointment by ID
    const appointment = yield appointment_1.default.findById(recordId).exec();
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
    const _a = req.body, { appointmentId } = _a, data = __rest(_a, ["appointmentId"]);
    // Validate required fields
    if (!appointmentId) {
        throw new bad_request_1.default('Appointment ID is required');
    }
    // Find and update the appointment by ID
    const updatedAppointment = yield appointment_1.default.findByIdAndUpdate(appointmentId, data, { new: true }).exec();
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
// Delete a specific appointment
const deleteAppointment = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { appointmentId } = req.body;
    // Validate required fields
    if (!appointmentId) {
        throw new bad_request_1.default('Appointment ID is required');
    }
    // Find and delete the appointment by ID
    const deletedAppointment = yield appointment_1.default.findByIdAndDelete(appointmentId).exec();
    if (!deletedAppointment) {
        throw new not_found_1.default('Appointment not found');
    }
    // Remove the appointment reference from the associated patient's record
    const patient = yield Patient_1.default.findOneAndUpdate({ Appointment: appointmentId }, // Find the patient with this appointment ID
    { $pull: { Appointment: appointmentId } }, // Remove the appointment ID from the array
    { new: true } // Return the updated patient document
    );
    if (!patient) {
        console.warn(`No patient found with Appointment ID: ${appointmentId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Appointment deleted successfully and reference removed from patient',
        success: true,
    });
}));
exports.deleteAppointment = deleteAppointment;
