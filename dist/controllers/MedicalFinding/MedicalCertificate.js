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
exports.getAllMedicalCertificates = exports.deleteMedicalCertificate = exports.updateMedicalCertificate = exports.getMedicalCertificates = exports.createMedicalCertificate = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const medicalcerteficate_1 = __importDefault(require("../../models/medicalcerteficate"));
/**
 * Create a new Medical Certificate for a patient.
 * Expects the patient ID in req.params and certificate details in req.body.
 */
const createMedicalCertificate = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const { briefExplanation, diagnosis, medicationDate, restDate } = req.body;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    if (!briefExplanation) {
        throw new bad_request_1.default('Brief explanation is required');
    }
    if (!restDate ||
        !restDate.from ||
        !restDate.to ||
        restDate.totalRestDays === undefined) {
        throw new bad_request_1.default('Complete rest date information is required (from, to, totalRestDays)');
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
    // Create a new MedicalCertificate document
    const newCertificate = new medicalcerteficate_1.default({
        patient: patient._id,
        briefExplanation,
        diagnosis,
        restDate,
        medicationDate,
        createdBy,
    });
    const savedCertificate = yield newCertificate.save();
    patient.MedicalCertificate = patient.MedicalCertificate || [];
    patient.MedicalCertificate.push(savedCertificate._id);
    yield patient.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Medical Certificate created successfully',
        success: true,
        data: savedCertificate,
    });
}));
exports.createMedicalCertificate = createMedicalCertificate;
/**
 * Retrieve all Medical Certificates for a given patient.
 * Expects the patient ID in req.params.
 */
const getMedicalCertificates = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Patient ID from URL params
    // Validate required field
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Find all medical certificates associated with the patient
    const certificates = yield medicalcerteficate_1.default.find({ patient: id }).populate('patient') // <--- Populate the patient details
        .exec();
    if (!certificates || certificates.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No medical certificates available for this patient',
            data: [],
        });
        return;
    }
    // Optionally, sort certificates by createdAt descending
    certificates.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Medical Certificates retrieved successfully',
        success: true,
        data: certificates,
    });
}));
exports.getMedicalCertificates = getMedicalCertificates;
/**
 * Update an existing Medical Certificate.
 * Expects the certificate ID (recordId) and update data in req.body.
 */
const updateMedicalCertificate = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const data = __rest(req.body, []);
    const { id } = req.params;
    // Validate required field
    if (!id) {
        throw new bad_request_1.default('Medical Certificate ID is required');
    }
    // Find and update the MedicalCertificate document by ID
    const updatedCertificate = yield medicalcerteficate_1.default.findById(id);
    if (!updatedCertificate) {
        throw new not_found_1.default('Medical Certificate not found');
    }
    // If data contains changes, add to changeHistory
    const changeHistory = {
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date(),
    };
    // Add the new change history entry to the certificate
    updatedCertificate.changeHistory.push(changeHistory);
    // Update the certificate with the new data (excluding changeHistory)
    updatedCertificate.set(data);
    // Save the updated certificate
    yield updatedCertificate.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Medical Certificate updated successfully',
        success: true,
        data: updatedCertificate,
    });
}));
exports.updateMedicalCertificate = updateMedicalCertificate;
/**
 * Delete a Medical Certificate.
 * Expects the certificate ID (recordId) in req.body.
 */
const deleteMedicalCertificate = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Validate required field
    if (!id) {
        throw new bad_request_1.default('Medical Certificate ID is required');
    }
    // Find and delete the MedicalCertificate document by ID
    const deletedCertificate = yield medicalcerteficate_1.default.findByIdAndDelete(id).exec();
    if (!deletedCertificate) {
        throw new not_found_1.default('Medical Certificate not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Medical Certificate deleted successfully',
        success: true,
    });
}));
exports.deleteMedicalCertificate = deleteMedicalCertificate;
/**
 * Retrieve all Medical Certificates in the database.
 */
const getAllMedicalCertificates = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const certificates = yield medicalcerteficate_1.default.find({});
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Medical Certificates retrieved successfully',
            success: true,
            data: certificates,
        });
    }
    catch (error) {
        console.error('Error retrieving medical certificates:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getAllMedicalCertificates = getAllMedicalCertificates;
