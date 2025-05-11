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
exports.updateTestPricing = exports.deleteTestPricing = exports.getTestPricingBySection = exports.getAllTestPricing = exports.upsertTestPricing = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Pricing_1 = __importDefault(require("../../models/Pricing"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create or Update Test Pricing
const upsertTestPricing = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { section, testPrices, defaultSectionPrice } = req.body;
    // Make sure section is provided, and at least one of testPrices or defaultSectionPrice is present
    if (!section || (!testPrices && defaultSectionPrice === undefined)) {
        throw new bad_request_1.default('Please provide a section and at least one price.');
    }
    if (!req.user) {
        throw new bad_request_1.default('User information is missing.');
    }
    const userRef = {
        id: req.user.userId, // ObjectId of the user
        username: req.user.username, // Username of the user
    };
    // Check if a record exists
    const existingPricing = yield Pricing_1.default.findOne({ section });
    let updatedPricing;
    if (existingPricing) {
        // Update existing record
        existingPricing.testPrices = testPrices || existingPricing.testPrices;
        existingPricing.defaultSectionPrice = defaultSectionPrice !== null && defaultSectionPrice !== void 0 ? defaultSectionPrice : existingPricing.defaultSectionPrice;
        updatedPricing = yield existingPricing.save();
    }
    else {
        // Create new record with createdBy
        updatedPricing = yield Pricing_1.default.create({
            section,
            testPrices,
            defaultSectionPrice,
            createdBy: userRef, // Use `createdBy` correctly
            updatedAt: Date.now(),
        });
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: existingPricing ? 'Pricing updated successfully' : 'Pricing created successfully',
        success: true,
        data: updatedPricing,
    });
}));
exports.upsertTestPricing = upsertTestPricing;
// Get all test pricing
const getAllTestPricing = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pricing = yield Pricing_1.default.find();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        data: pricing,
    });
}));
exports.getAllTestPricing = getAllTestPricing;
// Get test pricing by section
const getTestPricingBySection = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const pricing = yield Pricing_1.default.findOne({ _id: id });
    if (!pricing) {
        throw new not_found_1.default(`Pricing for section ${id} not found.`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        data: pricing,
    });
}));
exports.getTestPricingBySection = getTestPricingBySection;
// Delete test pricing for a section
const deleteTestPricing = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const pricing = yield Pricing_1.default.findOneAndDelete({ _id: id
    });
    if (!pricing) {
        throw new not_found_1.default(`Pricing for section ${id} not found.`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: `Pricing for section ${id} deleted successfully.`,
        success: true,
    });
}));
exports.deleteTestPricing = deleteTestPricing;
const updateTestPricing = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Extract pricing ID from request parameters
    const { testPrices, defaultSectionPrice } = req.body; // Extract fields to update
    console.log(req.body);
    if (!id) {
        throw new bad_request_1.default('Pricing ID is required.');
    }
    if (!req.user) {
        throw new bad_request_1.default('User information is missing.');
    }
    const existingPricing = yield Pricing_1.default.findById(id);
    if (!existingPricing) {
        throw new not_found_1.default(`Pricing with ID ${id} not found.`);
    }
    // Update only the fields provided in the request body
    if (testPrices) {
        existingPricing.testPrices = testPrices;
    }
    if (defaultSectionPrice !== undefined) {
        existingPricing.defaultSectionPrice = defaultSectionPrice;
    }
    // Save the updated pricing document
    const updatedPricing = yield existingPricing.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Pricing updated successfully',
        success: true,
        data: updatedPricing,
    });
}));
exports.updateTestPricing = updateTestPricing;
