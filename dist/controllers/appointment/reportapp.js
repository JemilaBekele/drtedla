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
exports.getTodayAppointments = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const appointment_1 = __importDefault(require("../../models/appointment"));
const getTodayAppointments = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today
        // Log today's date range (optional for debugging)
        console.log('Start of Day:', startOfDay);
        console.log('End of Day:', endOfDay);
        // Find all scheduled appointments for today
        const todayAppointments = yield appointment_1.default.find({
            appointmentDate: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
            status: 'Scheduled', // Filter for 'Scheduled' status
        })
            .populate('patientId.id') // Populate nested patient reference
            .exec();
        // Check if any appointments were found
        if (!todayAppointments || todayAppointments.length === 0) {
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: 'No scheduled appointments for today',
                data: [],
            });
            return; // Ensure the function exits after responding
        }
        // Return today's scheduled appointments
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Today's scheduled appointments retrieved successfully",
            success: true,
            data: todayAppointments,
        });
    }
    catch (error) {
        console.error("Error retrieving today's appointments:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getTodayAppointments = getTodayAppointments;
