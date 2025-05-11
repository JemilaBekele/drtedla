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
exports.deleteHealthinfoRecord = exports.updateHealthinfoRecord = exports.getHealthinfoRecord = exports.getHealthinfo = exports.createHealthinfo = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const healthinfo_1 = __importDefault(require("../../models/healthinfo"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a new health information record
const createHealthinfo = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const { bloodgroup, weight, height, allergies, habits } = req.body;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Validate patient existence
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    // Create new Healthinfo
    const newHealthinfo = new healthinfo_1.default({
        bloodgroup,
        weight,
        height,
        allergies,
        habits,
        patientId: { id: patient._id },
        createdBy,
    });
    const savedHealthinfo = yield newHealthinfo.save();
    // Link the new health info to the patient
    patient.Healthinfo = patient.Healthinfo || [];
    patient.Healthinfo.push(savedHealthinfo._id);
    yield patient.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Healthinfo created successfully',
        success: true,
        data: savedHealthinfo,
    });
}));
exports.createHealthinfo = createHealthinfo;
// Retrieve health information for a specific patient
const getHealthinfo = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Patient ID from URL params
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Find the patient by ID and populate Healthinfo
    const patient = yield Patient_1.default.findById(id).populate('Healthinfo').exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    if (!patient.Healthinfo || patient.Healthinfo.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No Healthinfo available for this patient',
            data: [],
        });
        return;
    }
    // Sort health information by `createdAt` in descending order
    const sortedHealthinfo = patient.Healthinfo.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Healthinfo retrieved successfully',
        success: true,
        data: sortedHealthinfo,
    });
}));
exports.getHealthinfo = getHealthinfo;
// Retrieve a specific medical finding by patientId and recordId
const getHealthinfoRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId, recordId } = req.params;
    // Validate required fields
    if (!patientId || !recordId) {
        throw new bad_request_1.default('Patient ID and Finding ID are required');
    }
    // Validate patient existence
    const patient = yield Patient_1.default.findById(patientId).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    // Find the medical finding by ID
    const finding = yield healthinfo_1.default.findById(recordId).exec();
    if (!finding) {
        throw new not_found_1.default('Medical finding not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Medical finding retrieved successfully',
        success: true,
        data: finding,
    });
}));
exports.getHealthinfoRecord = getHealthinfoRecord;
// Update a specific medical finding
const updateHealthinfoRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { recordId } = _a, data = __rest(_a, ["recordId"]);
    // Validate required fields
    if (!recordId) {
        throw new bad_request_1.default('Finding ID is required');
    }
    // Find and update the medical finding by ID
    const updatedFinding = yield healthinfo_1.default.findByIdAndUpdate(recordId, data, { new: true }).exec();
    if (!updatedFinding) {
        throw new not_found_1.default('Medical finding not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Medical finding updated successfully',
        success: true,
        data: updatedFinding,
    });
}));
exports.updateHealthinfoRecord = updateHealthinfoRecord;
// Delete a specific medical finding
const deleteHealthinfoRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.body;
    // Validate required fields
    if (!recordId) {
        throw new bad_request_1.default('Healthinfo ID is required');
    }
    // Find and delete the Healthinfo record by ID
    const deletedFinding = yield healthinfo_1.default.findByIdAndDelete(recordId).exec();
    if (!deletedFinding) {
        throw new not_found_1.default('Healthinfo record not found');
    }
    // Remove the Healthinfo reference from the associated patient's record
    const patient = yield Patient_1.default.findOneAndUpdate({ Healthinfo: recordId }, // Find patient with this Healthinfo ID
    { $pull: { Healthinfo: recordId } }, // Remove the Healthinfo ID from the array
    { new: true } // Return the updated patient document
    );
    if (!patient) {
        console.warn(`No patient found with Healthinfo ID: ${recordId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Healthinfo record deleted successfully and reference removed from patient',
        success: true,
    });
}));
exports.deleteHealthinfoRecord = deleteHealthinfoRecord;
