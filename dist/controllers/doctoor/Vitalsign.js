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
exports.deleteVitalSignRecord = exports.updateVitalSignRecord = exports.getVitalSignRecord = exports.getVitalSigns = exports.createVitalSign = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Vitalsign_1 = require("../../models/medical/Vitalsign");
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a new Vital Sign record
const createVitalSign = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const vitalSignData = req.body;
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
    const newVitalSign = new Vitalsign_1.VitalSign(Object.assign(Object.assign({}, vitalSignData), { patientId: patient._id, createdBy }));
    const savedVitalSign = yield newVitalSign.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Vital Sign record created successfully',
        success: true,
        data: savedVitalSign,
    });
}));
exports.createVitalSign = createVitalSign;
// Retrieve Vital Sign records for a specific patient
const getVitalSigns = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Patient ID
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const VitalSigns = yield Vitalsign_1.VitalSign.find({ patientId: id });
    if (!VitalSigns) {
        throw new not_found_1.default('Patient not found');
    }
    console.log(VitalSigns);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Vital Signs retrieved successfully',
        success: true,
        data: VitalSigns || [],
    });
}));
exports.getVitalSigns = getVitalSigns;
// Retrieve a specific Vital Sign record by patientId and recordId
const getVitalSignRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId, recordId } = req.params;
    if (!patientId || !recordId) {
        throw new bad_request_1.default('Patient ID and Record ID are required');
    }
    const record = yield Vitalsign_1.VitalSign.findOne({ _id: recordId, patientId }).exec();
    if (!record) {
        throw new not_found_1.default('Vital Sign record not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Vital Sign record retrieved successfully',
        success: true,
        data: record,
    });
}));
exports.getVitalSignRecord = getVitalSignRecord;
// Update a specific Vital Sign record
const updateVitalSignRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const updateData = __rest(req.body, []);
    const { recordId } = req.params;
    if (!recordId) {
        throw new bad_request_1.default('Vital Sign record ID is required');
    }
    const updatedRecord = yield Vitalsign_1.VitalSign.findByIdAndUpdate(recordId, updateData, { new: true }).exec();
    if (!updatedRecord) {
        throw new not_found_1.default('Vital Sign record not found');
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
        message: 'Vital Sign record updated successfully',
        success: true,
        data: updatedRecord,
    });
}));
exports.updateVitalSignRecord = updateVitalSignRecord;
// Delete a specific Vital Sign record
const deleteVitalSignRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    if (!recordId) {
        throw new bad_request_1.default('Vital Sign record ID is required');
    }
    const deletedRecord = yield Vitalsign_1.VitalSign.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) {
        throw new not_found_1.default('Vital Sign record not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Vital Sign record deleted successfully',
        success: true,
    });
}));
exports.deleteVitalSignRecord = deleteVitalSignRecord;
