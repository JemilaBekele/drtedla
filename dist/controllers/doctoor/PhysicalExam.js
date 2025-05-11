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
exports.deletePhysicalExamRecord = exports.updatePhysicalExamRecord = exports.getPhysicalExamRecord = exports.getPhysicalExams = exports.createPhysicalExam = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const PhysicalExam_1 = __importDefault(require("../../models/medical/PhysicalExam"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a new Physical Exam record
const createPhysicalExam = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const examData = req.body;
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
    const newExam = new PhysicalExam_1.default(Object.assign(Object.assign({}, examData), { patientId: patient._id, createdBy }));
    const savedExam = yield newExam.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Physical exam record created successfully',
        success: true,
        data: savedExam,
    });
}));
exports.createPhysicalExam = createPhysicalExam;
// Retrieve Physical Exam records for a specific patient
const getPhysicalExams = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hi");
    const { id } = req.params;
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const physicalExam = yield PhysicalExam_1.default.find({ patientId: id }).sort({ createdAt: -1 }).exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Physical exam records retrieved successfully',
        success: true,
        data: physicalExam || [],
    });
}));
exports.getPhysicalExams = getPhysicalExams;
// Retrieve a specific Physical Exam record
const getPhysicalExamRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    if (!recordId) {
        throw new bad_request_1.default('Record ID is required');
    }
    const record = yield PhysicalExam_1.default.findById(recordId).exec();
    if (!record) {
        throw new not_found_1.default('Physical exam record not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Physical exam record retrieved successfully',
        success: true,
        data: record,
    });
}));
exports.getPhysicalExamRecord = getPhysicalExamRecord;
// Update a specific Physical Exam record
const updatePhysicalExamRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { recordId } = req.params;
    const updateData = req.body;
    if (!recordId) {
        throw new bad_request_1.default('Record ID is required');
    }
    const updatedRecord = yield PhysicalExam_1.default.findByIdAndUpdate(recordId, updateData, { new: true }).exec();
    if (!updatedRecord) {
        throw new not_found_1.default('Physical exam record not found');
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
        message: 'Physical exam record updated successfully',
        success: true,
        data: updatedRecord,
    });
}));
exports.updatePhysicalExamRecord = updatePhysicalExamRecord;
// Delete a specific Physical Exam record
const deletePhysicalExamRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    if (!recordId) {
        throw new bad_request_1.default('Record ID is required');
    }
    const deletedRecord = yield PhysicalExam_1.default.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) {
        throw new not_found_1.default('Physical exam record not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Physical exam record deleted successfully',
        success: true,
    });
}));
exports.deletePhysicalExamRecord = deletePhysicalExamRecord;
