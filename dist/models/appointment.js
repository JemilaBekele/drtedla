"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema"));
const AppointmentSchema = new mongoose_1.default.Schema({
    appointmentDate: {
        type: Date,
        required: [true, 'Please provide an appointment date'],
    },
    appointmentTime: {
        type: String, // You can also use Number if you want to store time in a specific format like military time
        required: [true, 'Please provide an appointment time'],
    },
    doctorId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'User',
    },
    reasonForVisit: {
        type: String,
    },
    status: {
        type: String,
        required: [true, 'Please provide a status'],
        enum: ['Scheduled', 'Completed', 'Cancelled'],
    },
    patientId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
    },
    createdBy: userReferenceSchema_1.default,
}, { timestamps: true });
// Avoid model recompilation during hot reloads
const Appointment = mongoose_1.default.models.Appointment || mongoose_1.default.model('Appointment', AppointmentSchema);
exports.default = Appointment;
