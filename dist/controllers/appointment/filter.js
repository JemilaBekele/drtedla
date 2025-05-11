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
exports.getTodayAppointments = exports.filterAppointmentsByDoctorAndDate = exports.filterAppointmentsByDate = exports.getDoctorAppointments = exports.Appointments = exports.getTodayDocAppointments = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const appointment_1 = __importDefault(require("../../models/appointment"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const getDoctorAppointments = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user; // Assuming middleware attaches the user object
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
        return;
    }
    const appointments = yield appointment_1.default.find({
        status: 'Scheduled',
        'doctorId': user.userId,
    })
        .populate('patientId').populate({ path: 'doctorId',
        select: 'username', // Include disease name and exclude _id
        model: 'User' })
        .sort({ appointmentDate: 1 })
        .exec();
    if (!appointments.length) {
        throw new not_found_1.default('No scheduled appointments found.');
    }
    console.log(appointments);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Scheduled appointments retrieved successfully',
        success: true,
        data: appointments,
    });
}));
exports.getDoctorAppointments = getDoctorAppointments;
const filterAppointmentsByDate = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate } = req.body;
    if (!startDate) {
        throw new bad_request_1.default('Start date is required.');
    }
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
        throw new bad_request_1.default('Invalid date format.');
    }
    const startOfDay = new Date(startDateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(startDateObj.setHours(23, 59, 59, 999));
    const appointments = yield appointment_1.default.find({
        appointmentDate: { $gte: startOfDay, $lt: endOfDay },
        status: 'Scheduled',
    })
        .populate('patientId').populate({ path: 'doctorId',
        select: 'username', // Include disease name and exclude _id
        model: 'User' })
        .exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Appointments retrieved successfully',
        success: true,
        data: appointments,
    });
}));
exports.filterAppointmentsByDate = filterAppointmentsByDate;
//reception
const Appointments = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const appointments = yield appointment_1.default.find({
        status: 'Scheduled',
    })
        .populate('patientId').populate({ path: 'doctorId',
        select: 'username', // Include disease name and exclude _id
        model: 'User' })
        .exec();
    console.log(appointments);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Appointments retrieved successfully',
        success: true,
        data: appointments,
    });
}));
exports.Appointments = Appointments;
const filterAppointmentsByDoctorAndDate = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
        return;
    }
    const { startDate } = req.body;
    if (!startDate) {
        throw new bad_request_1.default('Start date is required.');
    }
    // Validate and parse startDate
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
        throw new bad_request_1.default(`Invalid date format. Received: ${startDate}`);
    }
    const startOfDay = new Date(startDateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(startDateObj.setHours(23, 59, 59, 999));
    console.log('Start of Day:', startOfDay);
    console.log('End of Day:', endOfDay);
    const appointments = yield appointment_1.default.find({
        appointmentDate: { $gte: startOfDay, $lt: endOfDay },
        status: 'Scheduled',
        'doctorId': user.userId,
    })
        .populate('patientId').populate({ path: 'doctorId',
        select: 'username', // Include disease name and exclude _id
        model: 'User' })
        .exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Appointments retrieved successfully',
        success: true,
        data: appointments,
    });
}));
exports.filterAppointmentsByDoctorAndDate = filterAppointmentsByDoctorAndDate;
const getTodayAppointments = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Patient_1.default.find({});
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const appointments = yield appointment_1.default.find({
            appointmentDate: { $gte: startOfDay, $lt: endOfDay },
            status: "Scheduled",
        }).populate({
            path: "patientId",
            select: "firstname phoneNumber", // Select only the fields needed
        }).populate({ path: 'doctorId',
            select: 'username', // Include disease name and exclude _id
            model: 'User' })
            .exec();
        console.log("populatedAppointments", appointments);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Today's appointments retrieved successfully",
            success: true,
            data: appointments
        });
    }
    catch (error) {
        console.error("Error retrieving today's appointments:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to retrieve today's appointments.",
            success: false,
        });
    }
}));
exports.getTodayAppointments = getTodayAppointments;
const getTodayDocAppointments = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
        return;
    }
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    // Log the values of date range and user ID
    console.log('Start of Day:', startOfDay);
    console.log('End of Day:', endOfDay);
    console.log('User ID:', user.userId);
    try {
        const appointments = yield appointment_1.default.find({
            appointmentDate: { $gte: startOfDay, $lt: endOfDay },
            status: 'Scheduled',
            'doctorId': user.userId,
        }).populate({ path: 'doctorId',
            select: 'username', // Include disease name and exclude _id
            model: 'User' }).exec();
        appointments.forEach(appointment => {
            console.log('Appointment Date:', appointment.appointmentDate);
        });
        console.log('Raw Appointments:', appointments); // Log raw data before populating
        // Populate and return the response
        const populatedAppointments = yield appointment_1.default.populate(appointments, {
            path: 'patientId',
        });
        console.log('Populated Appointments:', populatedAppointments);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Today's appointments retrieved successfully",
            success: true,
            data: populatedAppointments,
        });
    }
    catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
}));
exports.getTodayDocAppointments = getTodayDocAppointments;
