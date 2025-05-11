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
exports.updateCredits = exports.getUnconfirmedCredits = exports.fetchCredits = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const creadit_1 = __importDefault(require("../../models/creadit")); // Adjust path as needed
const Patient_1 = __importDefault(require("../../models/Patient")); // Import Patient model
const Orgnazation_1 = __importDefault(require("../../models/Orgnazation")); // Import Organization model
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
// Fetch Credits based on filters
const fetchCredits = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { createdBy, creditDate, organization, status } = req.body;
        // Initialize query object with the required condition
        const query = { 'currentPayment.confirm': false }; // Filter for unconfirmed credits
        // Add optional filters to the query
        if (createdBy) {
            query['createdBy.id'] = createdBy;
        }
        if ((creditDate === null || creditDate === void 0 ? void 0 : creditDate.start) && (creditDate === null || creditDate === void 0 ? void 0 : creditDate.end)) {
            query.creditDate = {
                $gte: new Date(creditDate.start), // Apply date range
                $lte: new Date(creditDate.end),
            };
        }
        if (organization) {
            console.log(`Searching for organization by name: ${organization}`);
            // Find organization by name
            const org = yield Orgnazation_1.default.findOne({ organization }).select('_id');
            if (org) {
                console.log(`Organization found with ID: ${org._id}`);
                // Find patients based on organization ID
                const patients = yield Patient_1.default.find({ Organization: org._id }).select('_id');
                if (patients.length > 0) {
                    const patientIds = patients.map(patient => patient._id);
                    console.log(`Patients found with IDs: ${patientIds}`);
                    query['customerName.id'] = { $in: patientIds }; // Filter credits by patient IDs in the specified organization
                }
                else {
                    console.log('No patients found for the given organization.');
                    res.status(http_status_codes_1.StatusCodes.OK).json([]); // Return empty result set if no patients found
                    return;
                }
            }
            else {
                console.log('No organization found with the given name.');
                res.status(http_status_codes_1.StatusCodes.OK).json([]); // Return empty result set if no organization found
                return;
            }
        }
        if (status) {
            query.status = status; // Filter by credit status (Paid, Pending, etc.)
        }
        // Execute query
        const credits = yield creadit_1.default.find(query)
            .populate({ path: 'customerName.id', model: 'Patient', select: 'firstname' })
            .populate({
            path: 'createdBy.id',
            model: 'User',
            select: 'username', // Populate only specific fields like username
        })
            .exec();
        console.log(`Credits found: ${credits.length}`);
        res.status(http_status_codes_1.StatusCodes.OK).json(credits);
    }
    catch (error) {
        console.error('Error fetching credits:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
    }
}));
exports.fetchCredits = fetchCredits;
const getUnconfirmedCredits = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find all Credit records where currentPayment.confirm is false and populate Patient data based on customer ID
        const unconfirmedCredits = yield creadit_1.default.find({
            'currentPayment.confirm': false,
        }).populate({ path: 'customerName.id', model: 'Patient' }).exec();
        if (unconfirmedCredits.length === 0) {
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: 'No unconfirmed Credit records available',
                data: [],
            });
            return;
        }
        // Create a Map to store unique patients based on their ID
        const uniquePatients = new Map();
        unconfirmedCredits.forEach((credit) => {
            if (credit.customerName && credit.customerName.id && !uniquePatients.has(credit.customerName.id._id)) {
                uniquePatients.set(credit.customerName.id._id, credit.customerName);
            }
        });
        // Convert the Map values to an array of unique patient data
        const uniquePatientData = Array.from(uniquePatients.values());
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Unconfirmed Credit records retrieved successfully',
            success: true,
            data: uniquePatientData,
        });
    }
    catch (error) {
        console.error('Error retrieving unconfirmed Credit records:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getUnconfirmedCredits = getUnconfirmedCredits;
const updateCredits = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { creditIds, status, currentPayment } = req.body;
    // Validate required fields
    if (!creditIds || !Array.isArray(creditIds) || creditIds.length === 0) {
        throw new bad_request_1.default('Credit IDs are required');
    }
    // Update multiple credits with the new status and payment confirmation
    const result = yield creadit_1.default.updateMany({ _id: { $in: creditIds } }, {
        $set: {
            status: status || 'Paid',
            'currentPayment.confirm': (_a = currentPayment === null || currentPayment === void 0 ? void 0 : currentPayment.confirm) !== null && _a !== void 0 ? _a : true,
        },
    });
    if (result.modifiedCount === 0) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
            error: 'No credits were updated',
        });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Credits updated successfully',
        success: true,
        modifiedCount: result.modifiedCount,
    });
}));
exports.updateCredits = updateCredits;
