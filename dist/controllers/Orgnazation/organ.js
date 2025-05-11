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
exports.getOrgall = exports.deleteOrganization = exports.updateOrganization = exports.getOrgnazations = exports.createOrgnazation = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Orgnazation_1 = __importDefault(require("../../models/Orgnazation"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a new Orgnazation
const createOrgnazation = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const { organization } = req.body;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    if (!organization) {
        throw new bad_request_1.default('Missing required fields: organization');
    }
    // Find the patient by ID
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    // Create a new Orgnazation
    const newOrgnazation = new Orgnazation_1.default({
        organization,
        patient: {
            id: patient._id,
        },
        createdBy,
    });
    const savedOrgnazation = yield newOrgnazation.save();
    // Link the Orgnazation to the patient
    patient.Orgnazation = patient.Orgnazation || [];
    patient.Orgnazation.push(savedOrgnazation._id);
    yield patient.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Orgnazation created successfully',
        success: true,
        data: savedOrgnazation,
    });
}));
exports.createOrgnazation = createOrgnazation;
// Retrieve Orgnazations for a patient
const getOrgnazations = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Patient ID from URL params
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Find the patient by ID and populate the Orgnazation field
    const patient = yield Patient_1.default.findById(id).populate('Orgnazation').exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    if (!patient.Orgnazation || patient.Orgnazation.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No Orgnazation available for this patient',
            data: [],
        });
        return;
    }
    // Sort the Orgnazations by `createdAt` in descending order
    const sortedOrgnazations = patient.Orgnazation.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Orgnazation retrieved successfully',
        success: true,
        data: sortedOrgnazations,
    });
}));
exports.getOrgnazations = getOrgnazations;
// Update an Organization
const updateOrganization = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { recordId } = _a, data = __rest(_a, ["recordId"]);
    // Validate required fields
    if (!recordId) {
        throw new bad_request_1.default('Finding ID is required');
    }
    // Find and update the Organization record by ID
    const updatedFinding = yield Orgnazation_1.default.findByIdAndUpdate(recordId, data, { new: true }).exec();
    if (!updatedFinding) {
        throw new not_found_1.default('Organization finding not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Organization finding updated successfully',
        success: true,
        data: updatedFinding,
    });
}));
exports.updateOrganization = updateOrganization;
// Delete an Organization
const deleteOrganization = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.body;
    // Validate required fields
    if (!recordId) {
        throw new bad_request_1.default('Organization ID is required');
    }
    // Find and delete the Organization by ID
    const deletedOrganization = yield Orgnazation_1.default.findByIdAndDelete(recordId).exec();
    if (!deletedOrganization) {
        throw new not_found_1.default('Organization not found');
    }
    // Remove the Organization reference from the associated Patient record
    const patient = yield Patient_1.default.findOneAndUpdate({ Orgnazation: recordId }, // Find the Patient with this Organization ID
    { $pull: { Orgnazation: recordId } }, // Remove the Organization ID from the array
    { new: true } // Return the updated Patient document
    );
    if (!patient) {
        console.warn(`No patient found with Organization ID: ${recordId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Organization deleted successfully and reference removed from patient.',
        success: true,
    });
}));
exports.deleteOrganization = deleteOrganization;
// Retrieve all Organizations
const getOrgall = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use the find method to retrieve all Organization documents
        const organizations = yield Orgnazation_1.default.find({});
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Organizations retrieved successfully',
            success: true,
            data: organizations,
        });
    }
    catch (error) {
        console.error('Error retrieving Organizations:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
}));
exports.getOrgall = getOrgall;
