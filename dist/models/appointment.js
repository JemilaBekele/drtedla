"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("./userReferenceSchema"));
const AppointmentSchema = new mongoose_1.default.Schema({
    appointmentDate: {
        type: Date,
    },
    appointmentTime: {
        type: String, // You can also use Number if you want to store time in a specific format like military time
    },
    appointmentEndTime: {
        type: String,
    },
    reasonForVisit: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
    },
    doctorId: {
        id: {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'User',
        },
        username: {
            type: String,
        },
    },
    patientId: {
        id: {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'Patient',
            required: [true, 'Please provide Patient ID'],
        },
        username: {
            type: String,
            required: [true, 'Please provide Patient name'],
        },
        cardno: {
            type: String,
            required: [true, 'Please provide Patient name'],
        },
    },
    createdBy: userReferenceSchema_1.default,
}, { timestamps: true });
// Avoid model recompilation during hot reloads
const Appointment = mongoose_1.default.models.Appointment || mongoose_1.default.model('Appointment', AppointmentSchema);
exports.default = Appointment;
