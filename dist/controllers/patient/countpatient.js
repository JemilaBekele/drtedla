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
exports.getTotalPatients = exports.getMonthlyPatientCount = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const getMonthlyPatientCount = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the current date
        const currentDate = new Date();
        // 1. Calculate the start of the current month
        const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        // 2. Calculate the start of the last month (handle month & year transition)
        const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        // 3. Get the count of patients registered in the last month
        const lastMonthPatients = yield Patient_1.default.countDocuments({
            createdAt: {
                $gte: startOfLastMonth, // Patients created from the start of the last month onwards
                $lt: startOfCurrentMonth, // Patients created before the start of the current month
            },
        });
        // 4. Get the count of patients registered in the current month
        const currentMonthPatients = yield Patient_1.default.countDocuments({
            createdAt: {
                $gte: startOfCurrentMonth, // Patients created from the start of the current month onwards
                $lte: currentDate, // Patients created until the current date/time
            },
        });
        // 5. Return the count of patients registered in the last month and current month
        res.status(http_status_codes_1.StatusCodes.OK).json({
            lastMonthPatients,
            currentMonthPatients,
        });
    }
    catch (error) {
        console.error('Error retrieving monthly patient count:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getMonthlyPatientCount = getMonthlyPatientCount;
const getTotalPatients = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Count the total number of patients
        const totalPatients = yield Patient_1.default.countDocuments();
        // Return the total count
        res.status(http_status_codes_1.StatusCodes.OK).json({
            totalPatients,
        });
    }
    catch (error) {
        console.error('Error retrieving total patients count:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getTotalPatients = getTotalPatients;
