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
exports.getAllReferLabTests = exports.deleteReferLabTest = exports.updateReferLabTest = exports.getReferLabTests = exports.createReferLabTest = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const Referlabtest_1 = __importDefault(require("../../models/Referlabtest"));
// CREATE
const createReferLabTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID
    const data = req.body;
    if (!id)
        throw new bad_request_1.default('Patient ID is required');
    const patient = yield Patient_1.default.findById(id);
    if (!patient)
        throw new not_found_1.default('Patient not found');
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    const newReferLabTest = new Referlabtest_1.default(Object.assign(Object.assign({}, data), { patient: patient._id, createdBy }));
    const savedReferLabTest = yield newReferLabTest.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Refer Lab Test created successfully',
        success: true,
        data: savedReferLabTest,
    });
}));
exports.createReferLabTest = createReferLabTest;
// READ: Single Patient's ReferLabTests
const getReferLabTests = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        throw new bad_request_1.default('Patient ID is required');
    const tests = yield Referlabtest_1.default.find({ patient: id }).populate('patient').exec();
    if (!tests || tests.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No prescriptions available for this patient',
            data: [],
        });
        return;
    }
    tests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Refer Lab Tests retrieved successfully',
        success: true,
        data: tests,
    });
}));
exports.getReferLabTests = getReferLabTests;
// UPDATE
const updateReferLabTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // ReferLabTest ID
    const data = req.body;
    if (!id)
        throw new bad_request_1.default('Refer Lab Test ID is required');
    const referTest = yield Referlabtest_1.default.findById(id);
    if (!referTest)
        throw new not_found_1.default('Refer Lab Test not found');
    // Add to change history
    referTest.changeHistory.push({
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date(),
    });
    referTest.set(data);
    const updated = yield referTest.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Refer Lab Test updated successfully',
        success: true,
        data: updated,
    });
}));
exports.updateReferLabTest = updateReferLabTest;
// DELETE
const deleteReferLabTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        throw new bad_request_1.default('Refer Lab Test ID is required');
    const deleted = yield Referlabtest_1.default.findByIdAndDelete(id).exec();
    if (!deleted)
        throw new not_found_1.default('Refer Lab Test not found');
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Refer Lab Test deleted successfully',
        success: true,
    });
}));
exports.deleteReferLabTest = deleteReferLabTest;
// GET ALL
const getAllReferLabTests = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tests = yield Referlabtest_1.default.find({});
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'All Refer Lab Tests retrieved successfully',
            success: true,
            data: tests,
        });
    }
    catch (error) {
        console.error('Error retrieving refer lab tests:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
}));
exports.getAllReferLabTests = getAllReferLabTests;
