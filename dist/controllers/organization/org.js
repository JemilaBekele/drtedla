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
exports.searchOrganizations = exports.deleteOrganization = exports.updateOrganization = exports.getOrganization = exports.getAllOrganizations = exports.createOrganization = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const organization_1 = __importDefault(require("../../models/organization"));
/**
 * Create a new Organization
 */
const createOrganization = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, phone, website, email } = req.body;
    // Validate required fields
    if (!name) {
        throw new bad_request_1.default('Organization name is required');
    }
    // Build createdBy object using authenticated user details
    // Create a new Organization document
    const newOrganization = new organization_1.default({
        name,
        address,
        phone,
        website,
        email,
    });
    const savedOrganization = yield newOrganization.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Organization created successfully',
        success: true,
        data: savedOrganization,
    });
}));
exports.createOrganization = createOrganization;
/**
 * Get all Organizations
 */
const getAllOrganizations = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const organizations = yield organization_1.default.find({}).sort({ createdAt: -1 }).exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Organizations retrieved successfully',
        success: true,
        count: organizations.length,
        data: organizations,
    });
}));
exports.getAllOrganizations = getAllOrganizations;
/**
 * Get a single Organization by ID
 */
const getOrganization = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Validate required field
    if (!id) {
        throw new bad_request_1.default('Organization ID is required');
    }
    const organization = yield organization_1.default.findById(id).exec();
    if (!organization) {
        throw new not_found_1.default('Organization not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Organization retrieved successfully',
        success: true,
        data: organization,
    });
}));
exports.getOrganization = getOrganization;
/**
 * Update an existing Organization
 */
const updateOrganization = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, address, phone, website, email } = req.body;
    // Validate required field
    if (!id) {
        throw new bad_request_1.default('Organization ID is required');
    }
    // Find and update the Organization document by ID
    const updatedOrganization = yield organization_1.default.findByIdAndUpdate(id, { name, address, phone, website, email }, { new: true, runValidators: true }).exec();
    if (!updatedOrganization) {
        throw new not_found_1.default('Organization not found');
    }
    // Save the updated organization
    yield updatedOrganization.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Organization updated successfully',
        success: true,
        data: updatedOrganization,
    });
}));
exports.updateOrganization = updateOrganization;
/**
 * Delete an Organization
 */
const deleteOrganization = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Validate required field
    if (!id) {
        throw new bad_request_1.default('Organization ID is required');
    }
    // Find and delete the Organization document by ID
    const deletedOrganization = yield organization_1.default.findByIdAndDelete(id).exec();
    if (!deletedOrganization) {
        throw new not_found_1.default('Organization not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Organization deleted successfully',
        success: true,
    });
}));
exports.deleteOrganization = deleteOrganization;
/**
 * Search Organizations by name or other fields
 */
const searchOrganizations = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    if (!query) {
        throw new bad_request_1.default('Search query is required');
    }
    const organizations = yield organization_1.default.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { address: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
        ],
    }).exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Organizations search completed',
        success: true,
        count: organizations.length,
        data: organizations,
    });
}));
exports.searchOrganizations = searchOrganizations;
