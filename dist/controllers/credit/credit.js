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
exports.updateCredit = exports.deleteCredit = exports.getCreditById = exports.getCredits = exports.createCredit = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Services_1 = __importDefault(require("../../models/Services"));
const creadit_1 = __importDefault(require("../../models/creadit"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a new credit
const createCredit = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { id } = req.params; // Patient ID from URL params
    const { items, currentPayment, status } = req.body;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const validStatuses = ['Paid', 'Pending', 'Cancel', 'Credit'];
    if (!validStatuses.includes(status)) {
        throw new bad_request_1.default('Invalid status value.');
    }
    // Find the patient by ID
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found.');
    }
    // Validate services in the items
    const serviceIds = items.map((item) => item.service.id);
    const services = yield Services_1.default.find({ _id: { $in: serviceIds } });
    const serviceMap = new Map(services.map((service) => [service._id.toString(), service]));
    for (const item of items) {
        if (!((_a = item.service) === null || _a === void 0 ? void 0 : _a.id) || !serviceMap.has(item.service.id)) {
            throw new not_found_1.default(`Service with ID ${(_b = item.service) === null || _b === void 0 ? void 0 : _b.id} not found.`);
        }
    }
    const createdBy = {
        id: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId) || '',
        username: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.username) || '',
    };
    // Map items with the validated services
    const mappedItems = items.map((item) => ({
        service: {
            id: item.service.id,
            service: item.service.service, // Include the service name from the object
        },
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.quantity * item.price, // Calculate total price
    }));
    // Create the new credit
    const newCredit = new creadit_1.default({
        items: mappedItems,
        customerName: { id: patient._id },
        currentPayment,
        status,
        createdBy,
        totalAmount: mappedItems.reduce((total, item) => total + item.totalPrice, 0),
    });
    const savedCredit = yield newCredit.save();
    // Link the credit to the patient
    patient.Credit = patient.Credit || [];
    patient.Credit.push(savedCredit._id);
    yield patient.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Credit record created successfully.',
        success: true,
        data: savedCredit,
    });
}));
exports.createCredit = createCredit;
// Retrieve all credits for a specific patient
const getCredits = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required.');
    }
    // Find the patient by ID and populate credits
    const patient = yield Patient_1.default.findById(id).populate('Credit').exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found.');
    }
    if (!patient.Credit || patient.Credit.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No Credit records available for this patient.',
            data: [],
        });
        return;
    }
    // Sort credits by `createdAt` in descending order
    const sortedCredits = patient.Credit.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Credit records retrieved successfully.',
        success: true,
        data: sortedCredits,
    });
}));
exports.getCredits = getCredits;
// GET: Retrieve credit details
const getCreditById = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { creditId } = req.body; // Assuming the creditId is passed in the request body
    // Validate required fields
    if (!creditId) {
        throw new bad_request_1.default('Credit ID is required');
    }
    // Find the credit by ID
    const credit = yield creadit_1.default.findById(creditId).exec();
    if (!credit) {
        throw new not_found_1.default('Credit not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Credit retrieved successfully.',
        success: true,
        data: credit,
    });
}));
exports.getCreditById = getCreditById;
// DELETE: Delete a credit
const deleteCredit = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { creditId } = req.body; // Assuming the creditId is passed in the request body
    // Validate required fields
    if (!creditId) {
        throw new bad_request_1.default('Credit ID is required');
    }
    // Find and delete the credit
    const deletedCredit = yield creadit_1.default.findByIdAndDelete(creditId).exec();
    if (!deletedCredit) {
        throw new not_found_1.default('Credit not found');
    }
    // Remove the credit reference from the associated patient's record
    const patient = yield Patient_1.default.findOneAndUpdate({ Credit: creditId }, // Find the patient with this credit ID
    { $pull: { Credit: creditId } }, // Remove the credit ID from the array
    { new: true } // Return the updated patient document
    );
    if (!patient) {
        console.warn(`No patient found with Credit ID: ${creditId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Credit deleted successfully and reference removed from patient.',
        success: true,
    });
}));
exports.deleteCredit = deleteCredit;
// PATCH: Update a credit
const updateCredit = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const _c = req.body, { creditId } = _c, data = __rest(_c, ["creditId"]); // Extract creditId and the data to update
    // Validate required fields
    if (!creditId) {
        throw new bad_request_1.default('Credit ID is required');
    }
    // Find the credit by ID
    const credit = yield creadit_1.default.findById(creditId).exec();
    if (!credit) {
        throw new not_found_1.default('Credit not found');
    }
    // Update the credit with the provided data
    Object.assign(credit, data);
    // Recalculate the balance
    credit.createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    credit.balance = credit.totalAmount - credit.totalPaid;
    // Save the updated credit
    yield credit.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Credit updated successfully.',
        success: true,
        data: credit,
    });
}));
exports.updateCredit = updateCredit;
