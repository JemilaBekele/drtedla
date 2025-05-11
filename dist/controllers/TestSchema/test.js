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
exports.deleteTestConfig = exports.getAllTestConfigs = exports.updateTestConfig = exports.addTestConfig = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const TestSchema_1 = __importDefault(require("../../models/TestSchema"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a new test configuration (Admin only)
const addTestConfig = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, unit, referenceRange } = req.body;
    if (!name || !unit || !referenceRange) {
        throw new bad_request_1.default('Name, unit, and reference range are required');
    }
    // Check if test config already exists
    const existingTest = yield TestSchema_1.default.findOne({ name });
    if (existingTest) {
        throw new bad_request_1.default('Test configuration already exists');
    }
    const newTestConfig = new TestSchema_1.default({ name, unit, referenceRange });
    yield newTestConfig.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Test configuration added successfully',
        success: true,
        data: newTestConfig,
    });
}));
exports.addTestConfig = addTestConfig;
// Update an existing test configuration (Admin only)
const updateTestConfig = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { unit, referenceRange } = req.body;
    if (!unit && !referenceRange) {
        throw new bad_request_1.default('At least one field (unit or reference range) must be provided');
    }
    const updatedTestConfig = yield TestSchema_1.default.findByIdAndUpdate(id, { unit, referenceRange }, { new: true, runValidators: true });
    if (!updatedTestConfig) {
        throw new not_found_1.default('Test configuration not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Test configuration updated successfully',
        success: true,
        data: updatedTestConfig,
    });
}));
exports.updateTestConfig = updateTestConfig;
// Get all test configurations
const getAllTestConfigs = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const testConfigs = yield TestSchema_1.default.find();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Test configurations retrieved successfully',
        success: true,
        data: testConfigs,
    });
}));
exports.getAllTestConfigs = getAllTestConfigs;
// Delete a test configuration
const deleteTestConfig = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedTestConfig = yield TestSchema_1.default.findByIdAndDelete(id);
    if (!deletedTestConfig) {
        throw new not_found_1.default('Test configuration not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Test configuration deleted successfully',
        success: true,
    });
}));
exports.deleteTestConfig = deleteTestConfig;
