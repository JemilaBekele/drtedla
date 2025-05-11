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
exports.deleteLaboratoryCertificate = exports.updateLaboratoryCertificate = exports.getLaboratoryCertificate = exports.getLaboratoryCertificates = exports.createLaboratoryCertificate = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const labceriteficate_1 = require("../../models/medical/labceriteficate");
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a Laboratory Certificate
const createLaboratoryCertificate = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID
    const certificateData = req.body;
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    const newCertificate = new labceriteficate_1.LaboratoryCertificate(Object.assign(Object.assign({}, certificateData), { patientId: patient._id, createdBy }));
    const savedCertificate = yield newCertificate.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Laboratory Certificate created successfully',
        success: true,
        data: savedCertificate,
    });
}));
exports.createLaboratoryCertificate = createLaboratoryCertificate;
// Get all Laboratory Certificates for a patient
const getLaboratoryCertificates = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const certificates = yield labceriteficate_1.LaboratoryCertificate.find({ patientId: id }).exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Laboratory Certificates retrieved successfully',
        success: true,
        data: certificates || [],
    });
}));
exports.getLaboratoryCertificates = getLaboratoryCertificates;
// Get a specific Laboratory Certificate by patientId and recordId
const getLaboratoryCertificate = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId, recordId } = req.params;
    if (!patientId || !recordId) {
        throw new bad_request_1.default('Patient ID and Record ID are required');
    }
    const certificate = yield labceriteficate_1.LaboratoryCertificate.findOne({
        _id: recordId,
        patientId,
    }).exec();
    if (!certificate) {
        throw new not_found_1.default('Laboratory Certificate not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Laboratory Certificate retrieved successfully',
        success: true,
        data: certificate,
    });
}));
exports.getLaboratoryCertificate = getLaboratoryCertificate;
// Update a Laboratory Certificate
const updateLaboratoryCertificate = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { recordId } = req.params;
    const updateData = req.body;
    if (!recordId) {
        throw new bad_request_1.default('Certificate record ID is required');
    }
    const certificate = yield labceriteficate_1.LaboratoryCertificate.findById(recordId).exec();
    if (!certificate) {
        throw new not_found_1.default('Laboratory Certificate not found');
    }
    const changeHistory = {
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date(),
    };
    certificate.set(updateData);
    certificate.changeHistory.push(changeHistory);
    const updatedCertificate = yield certificate.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Laboratory Certificate updated successfully',
        success: true,
        data: updatedCertificate,
    });
}));
exports.updateLaboratoryCertificate = updateLaboratoryCertificate;
// Delete a Laboratory Certificate
const deleteLaboratoryCertificate = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    if (!recordId) {
        throw new bad_request_1.default('Certificate record ID is required');
    }
    const deleted = yield labceriteficate_1.LaboratoryCertificate.findByIdAndDelete(recordId).exec();
    if (!deleted) {
        throw new not_found_1.default('Laboratory Certificate not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Laboratory Certificate deleted successfully',
        success: true,
    });
}));
exports.deleteLaboratoryCertificate = deleteLaboratoryCertificate;
