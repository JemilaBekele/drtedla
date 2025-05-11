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
exports.deleteGastrointestinalEndoscopyRecord = exports.updateGastrointestinalEndoscopyRecord = exports.getGastrointestinalEndoscopyRecord = exports.getGastrointestinalEndoscopies = exports.createGastrointestinalEndoscopy = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const GastrointestinalEndoscopy_1 = __importDefault(require("../../models/medical/GastrointestinalEndoscopy"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a new Gastrointestinal Endoscopy record
const createGastrointestinalEndoscopy = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const endoscopyData = req.body;
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
    const newEndoscopy = new GastrointestinalEndoscopy_1.default(Object.assign(Object.assign({}, endoscopyData), { patientId: patient._id, createdBy }));
    const savedEndoscopy = yield newEndoscopy.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Gastrointestinal endoscopy record created successfully',
        success: true,
        data: savedEndoscopy,
    });
}));
exports.createGastrointestinalEndoscopy = createGastrointestinalEndoscopy;
// Retrieve Gastrointestinal Endoscopy records for a specific patient
const getGastrointestinalEndoscopies = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const records = yield GastrointestinalEndoscopy_1.default.find({ patientId: id })
        .sort({ createdAt: -1 })
        .exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Gastrointestinal endoscopy records retrieved successfully',
        success: true,
        data: records,
    });
}));
exports.getGastrointestinalEndoscopies = getGastrointestinalEndoscopies;
// Retrieve a specific Gastrointestinal Endoscopy record
const getGastrointestinalEndoscopyRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    if (!recordId) {
        throw new bad_request_1.default('Record ID is required');
    }
    const record = yield GastrointestinalEndoscopy_1.default.findById(recordId).exec();
    if (!record) {
        throw new not_found_1.default('Gastrointestinal endoscopy record not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Gastrointestinal endoscopy record retrieved successfully',
        success: true,
        data: record,
    });
}));
exports.getGastrointestinalEndoscopyRecord = getGastrointestinalEndoscopyRecord;
// Update a specific Gastrointestinal Endoscopy record
const updateGastrointestinalEndoscopyRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { recordId } = req.params;
    const updateData = req.body;
    if (!recordId) {
        throw new bad_request_1.default('Record ID is required');
    }
    const updatedRecord = yield GastrointestinalEndoscopy_1.default.findByIdAndUpdate(recordId, updateData, { new: true }).exec();
    if (!updatedRecord) {
        throw new not_found_1.default('Gastrointestinal endoscopy record not found');
    }
    const changeHistory = {
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date(),
    };
    updatedRecord.changeHistory.push(changeHistory);
    // Update the certificate with the new data (excluding changeHistory)
    updatedRecord.set(updateData);
    // Save the updated certificate
    yield updatedRecord.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Gastrointestinal endoscopy record updated successfully',
        success: true,
        data: updatedRecord,
    });
}));
exports.updateGastrointestinalEndoscopyRecord = updateGastrointestinalEndoscopyRecord;
// Delete a specific Gastrointestinal Endoscopy record
const deleteGastrointestinalEndoscopyRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    if (!recordId) {
        throw new bad_request_1.default('Record ID is required');
    }
    const deletedRecord = yield GastrointestinalEndoscopy_1.default.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) {
        throw new not_found_1.default('Gastrointestinal endoscopy record not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Gastrointestinal endoscopy record deleted successfully',
        success: true,
    });
}));
exports.deleteGastrointestinalEndoscopyRecord = deleteGastrointestinalEndoscopyRecord;
