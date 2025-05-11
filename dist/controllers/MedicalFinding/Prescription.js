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
exports.getAllPrescriptions = exports.deletePrescription = exports.updatePrescription = exports.getPrescriptions = exports.createPrescription = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const prescription_1 = __importDefault(require("../../models/prescription"));
/**
 * Create a new Prescription for a patient.
 * Expects the patient ID in req.params and a description in req.body.
 */
const createPrescription = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const { description, Diagnosis } = req.body;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    if (!description) {
        throw new bad_request_1.default('Description is required');
    }
    // Find the patient by ID
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    // Build createdBy object using authenticated user details
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    // Create a new Prescription document
    const newPrescription = new prescription_1.default({
        patient: patient._id,
        description,
        Diagnosis,
        createdBy,
    });
    const savedPrescription = yield newPrescription.save();
    patient.prescriptions = patient.prescriptions || [];
    patient.prescriptions.push(savedPrescription._id);
    yield patient.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Prescription created successfully',
        success: true,
        data: savedPrescription,
    });
}));
exports.createPrescription = createPrescription;
/**
 * Retrieve all Prescriptions for a given patient.
 * Expects the patient ID in req.params.
 */
const getPrescriptions = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Patient ID from URL params
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Fetch prescriptions and populate the patient field
    const prescriptions = yield prescription_1.default.find({ patient: id })
        .populate('patient') // <--- Populate the patient details
        .exec();
    if (!prescriptions || prescriptions.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No prescriptions available for this patient',
            data: [],
        });
        return;
    }
    // Sort by createdAt descending
    prescriptions.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Prescriptions retrieved successfully',
        success: true,
        data: prescriptions,
    });
}));
exports.getPrescriptions = getPrescriptions;
/**
 * Update an existing Prescription.
 * Expects the prescription ID (recordId) and update data in req.body.
 */
const updatePrescription = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const data = __rest(req.body, []);
    const { id } = req.params;
    // Validate required field
    if (!id) {
        throw new bad_request_1.default('Prescription ID is required');
    }
    // Find and update the Prescription document by ID
    const updatedPrescription = yield prescription_1.default.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updatedPrescription) {
        throw new not_found_1.default('Prescription not found');
    }
    const changeHistory = {
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date(),
    };
    // Add the new change history entry to the certificate
    updatedPrescription.changeHistory.push(changeHistory);
    // Update the certificate with the new data (excluding changeHistory)
    updatedPrescription.set(data);
    // Save the updated certificate
    yield updatedPrescription.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Prescription updated successfully',
        success: true,
        data: updatedPrescription,
    });
}));
exports.updatePrescription = updatePrescription;
/**
 * Delete a Prescription.
 * Expects the prescription ID (recordId) in req.body.
 */
const deletePrescription = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Validate required field
    if (!id) {
        throw new bad_request_1.default('Prescription ID is required');
    }
    // Find and delete the Prescription document by ID
    const deletedPrescription = yield prescription_1.default.findByIdAndDelete(id).exec();
    if (!deletedPrescription) {
        throw new not_found_1.default('Prescription not found');
    }
    // Optionally, remove the Prescription reference from the Patient document
    // if you have such a relationship defined:
    // await Patient.findOneAndUpdate(
    //   { prescriptions: recordId },
    //   { $pull: { prescriptions: recordId } },
    //   { new: true }
    // );
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Prescription deleted successfully',
        success: true,
    });
}));
exports.deletePrescription = deletePrescription;
/**
 * Retrieve all Prescriptions in the database.
 */
const getAllPrescriptions = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prescriptions = yield prescription_1.default.find({});
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Prescriptions retrieved successfully',
            success: true,
            data: prescriptions,
        });
    }
    catch (error) {
        console.error('Error retrieving prescriptions:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
}));
exports.getAllPrescriptions = getAllPrescriptions;
