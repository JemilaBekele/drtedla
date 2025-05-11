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
exports.deleteROSRecord = exports.updateROSRecord = exports.getROSRecord = exports.getROS = exports.createROS = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const ROS_1 = __importDefault(require("../../models/medical/ROS"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a new ROS record
const createROS = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const rosData = req.body;
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
    const newROS = new ROS_1.default(Object.assign(Object.assign({}, rosData), { patientId: { id: patient._id }, createdBy }));
    const savedROS = yield newROS.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'ROS record created successfully',
        success: true,
        data: savedROS,
    });
}));
exports.createROS = createROS;
// Retrieve ROS records for a specific patient
const getROS = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const records = yield ROS_1.default.find({ 'patientId.id': id }).sort({ createdAt: -1 }).exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'ROS records retrieved successfully',
        success: true,
        data: records,
    });
}));
exports.getROS = getROS;
// Retrieve a specific ROS record
const getROSRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    if (!recordId) {
        throw new bad_request_1.default('Record ID is required');
    }
    const record = yield ROS_1.default.findById(recordId).exec();
    if (!record) {
        throw new not_found_1.default('ROS record not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'ROS record retrieved successfully',
        success: true,
        data: record,
    });
}));
exports.getROSRecord = getROSRecord;
// Update a specific ROS record
const updateROSRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    const data = __rest(req.body, []);
    if (!recordId) {
        throw new bad_request_1.default('Record ID is required');
    }
    const updatedRecord = yield ROS_1.default.findByIdAndUpdate(recordId, data, { new: true }).exec();
    if (!updatedRecord) {
        throw new not_found_1.default('ROS record not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'ROS record updated successfully',
        success: true,
        data: updatedRecord,
    });
}));
exports.updateROSRecord = updateROSRecord;
// Delete a specific ROS record
const deleteROSRecord = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    if (!recordId) {
        throw new bad_request_1.default('Record ID is required');
    }
    const deletedRecord = yield ROS_1.default.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) {
        throw new not_found_1.default('ROS record not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'ROS record deleted successfully',
        success: true,
    });
}));
exports.deleteROSRecord = deleteROSRecord;
