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
exports.getAllLabTests = exports.deleteLabTest = exports.updateLabTest = exports.getLabTestsByPatient = exports.createLabTest = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const LabTest_1 = require("../../models/LabTest");
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
/**
 * ✅ Create a new Lab Test for a patient.
 * Expects patient ID in req.params and test details in req.body.
 */
const createLabTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const { sections } = req.body; // Array of sections with tests
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    if (!sections || !Array.isArray(sections)) {
        throw new bad_request_1.default('Sections array is required');
    }
    // Find the patient
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    // Build createdBy object using authenticated user details
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    // Format each section and its tests
    const formattedSections = sections.map((section) => ({
        section: section.section,
        tests: section.tests.map((test) => ({
            name: test.name,
            selectedForLab: true,
            isResult: false,
            result: null,
            unit: null,
            referenceRange: null,
            comments: null,
        })),
    }));
    // Create a single LabTest document with all sections
    const newLabTest = new LabTest_1.LabTest({
        patient: patient._id,
        sections: formattedSections,
        createdBy,
        status: 'Pending',
    });
    const savedLabTest = yield newLabTest.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Lab Test created successfully',
        success: true,
        data: savedLabTest,
    });
}));
exports.createLabTest = createLabTest;
/**
 * ✅ Retrieve all Lab Tests for a given patient.
 */
const getLabTestsByPatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Patient ID from URL params
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const labTests = yield LabTest_1.LabTest.find({ patient: id }).exec();
    if (!labTests || labTests.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No lab tests available for this patient',
            data: [],
        });
        return;
    }
    // Sort lab tests by most recent
    labTests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Lab tests retrieved successfully',
        success: true,
        data: labTests,
    });
}));
exports.getLabTestsByPatient = getLabTestsByPatient;
const updateLabTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { tests, status } = req.body;
    if (!id) {
        throw new bad_request_1.default('Lab Test ID is required');
    }
    // Fetch the existing LabTest
    // Save only once after modifying the document
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Lab Test updated successfully',
        success: true,
    });
}));
exports.updateLabTest = updateLabTest;
/**
 * ✅ Delete a Lab Test by ID.
 */
const deleteLabTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new bad_request_1.default('Lab Test ID is required');
    }
    const deletedLabTest = yield LabTest_1.LabTest.findByIdAndDelete(id).exec();
    if (!deletedLabTest) {
        throw new not_found_1.default('Lab Test not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Lab Test deleted successfully',
        success: true,
    });
}));
exports.deleteLabTest = deleteLabTest;
/**
 * ✅ Retrieve all Lab Tests in the database.
 */
const getAllLabTests = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labTests = yield LabTest_1.LabTest.find({});
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Lab tests retrieved successfully',
            success: true,
            data: labTests,
        });
    }
    catch (error) {
        console.error('Error retrieving lab tests:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getAllLabTests = getAllLabTests;
