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
exports.getRecentNursingPatients = exports.updateNursingProgressNote = exports.deleteNursingProgressNote = exports.deleteMedicalSheet = exports.updateMedicalSheet = exports.getMedicalSheet = exports.createMedicalSheet = exports.getNursingProgressNote = exports.createNursingProgressNote = exports.deleteNursingProcess = exports.updateNursingProcess = exports.getNursingProcess = exports.createNursingProcess = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const nurse_1 = require("../../models/nurse");
const Vitalsign_1 = require("../../models/medical/Vitalsign");
// Create Nursing Process Record
const createNursingProcess = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { assessment, diagnosis, planning, intervention, evaluation, scenario } = req.body;
    if (!id)
        throw new bad_request_1.default('Patient ID is required');
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient)
        throw new not_found_1.default('Patient not found');
    const createdBy = { id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '', username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '' };
    const newRecord = yield nurse_1.NursingProcess.create({
        patientId: id,
        assessment, diagnosis, planning, intervention, evaluation, scenario,
        createdBy,
    });
    res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: 'Nursing Process created', success: true, data: newRecord });
}));
exports.createNursingProcess = createNursingProcess;
// Retrieve Nursing Process for a Patient
const getNursingProcess = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        throw new bad_request_1.default('Patient ID is required');
    const records = yield nurse_1.NursingProcess.find({ patientId: id }).sort({ createdAt: -1 }).exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Nursing Process retrieved', success: true, data: records });
}));
exports.getNursingProcess = getNursingProcess;
// Update Nursing Process Record
const updateNursingProcess = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const _c = req.body, { recordId } = _c, data = __rest(_c, ["recordId"]);
    if (!recordId)
        throw new bad_request_1.default('Record ID is required');
    const updatedRecord = yield nurse_1.NursingProcess.findByIdAndUpdate(recordId, data, { new: true }).exec();
    if (!updatedRecord)
        throw new not_found_1.default('Record not found');
    const changeHistory = {
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date(),
    };
    updatedRecord.changeHistory.push(changeHistory);
    // Update the certificate with the new data (excluding changeHistory)
    updatedRecord.set(data);
    // Save the updated certificate
    yield updatedRecord.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Nursing Process updated', success: true, data: updatedRecord });
}));
exports.updateNursingProcess = updateNursingProcess;
// Delete Nursing Process Record
const deleteNursingProcess = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.body;
    console.log(recordId);
    if (!recordId)
        throw new bad_request_1.default('Record ID is required');
    const deletedRecord = yield nurse_1.NursingProcess.findByIdAndDelete(recordId).exec();
    if (!deletedRecord)
        throw new not_found_1.default('Record not found');
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Nursing Process deleted', success: true });
}));
exports.deleteNursingProcess = deleteNursingProcess;
// Create Nursing Progress Note Record
const createNursingProgressNote = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { progressNote } = req.body;
    if (!id)
        throw new bad_request_1.default('Patient ID is required');
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient)
        throw new not_found_1.default('Patient not found');
    const createdBy = { id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '', username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '' };
    const newRecord = yield nurse_1.NursingProgressNote.create({ patientId: id, progressNote, createdBy });
    res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: 'Nursing Progress Note created', success: true, data: newRecord });
}));
exports.createNursingProgressNote = createNursingProgressNote;
// Retrieve Nursing Progress Notes for a Patient
const getNursingProgressNote = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        throw new bad_request_1.default('Patient ID is required');
    const records = yield nurse_1.NursingProgressNote.find({ patientId: id }).sort({ createdAt: -1 }).exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Nursing Progress Notes retrieved', success: true, data: records });
}));
exports.getNursingProgressNote = getNursingProgressNote;
// Update Nursing Progress Note Record
const updateNursingProgressNote = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const data = __rest(req.body, []);
    const { recordId } = req.params;
    if (!recordId)
        throw new bad_request_1.default('Record ID is required');
    const updatedRecord = yield nurse_1.NursingProgressNote.findByIdAndUpdate(recordId, data, { new: true }).exec();
    if (!updatedRecord)
        throw new not_found_1.default('Record not found');
    const changeHistory = {
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date(),
    };
    updatedRecord.changeHistory.push(changeHistory);
    // Update the certificate with the new data (excluding changeHistory)
    updatedRecord.set(data);
    // Save the updated certificate
    yield updatedRecord.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Nursing Progress Note updated', success: true, data: updatedRecord });
}));
exports.updateNursingProgressNote = updateNursingProgressNote;
// Delete Nursing Progress Note Record
const deleteNursingProgressNote = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    console.log(recordId);
    if (!recordId)
        throw new bad_request_1.default('Record ID is required');
    const deletedRecord = yield nurse_1.NursingProgressNote.findByIdAndDelete(recordId).exec();
    if (!deletedRecord)
        throw new not_found_1.default('Record not found');
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Nursing Progress Note deleted', success: true });
}));
exports.deleteNursingProgressNote = deleteNursingProgressNote;
// Create Medical Sheet Record
const createMedicalSheet = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { name, medicationProcedure, doseGiven, route, frequency, remark } = req.body;
    if (!id)
        throw new bad_request_1.default('Patient ID is required');
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient)
        throw new not_found_1.default('Patient not found');
    const createdBy = { id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '', username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '' };
    const newRecord = yield nurse_1.MedicalSheet.create({
        patientId: id, name, medicationProcedure, doseGiven, route, frequency, remark, createdBy,
    });
    res.status(http_status_codes_1.StatusCodes.CREATED).json({ message: 'Medical Sheet created', success: true, data: newRecord });
}));
exports.createMedicalSheet = createMedicalSheet;
// Retrieve Medical Sheets for a Patient
const getMedicalSheet = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        throw new bad_request_1.default('Patient ID is required');
    const records = yield nurse_1.MedicalSheet.find({ patientId: id }).sort({ createdAt: -1 }).exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Medical Sheets retrieved', success: true, data: records });
}));
exports.getMedicalSheet = getMedicalSheet;
// Update Medical Sheet Record
const updateMedicalSheet = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const _c = req.body, { recordId } = _c, data = __rest(_c, ["recordId"]);
    if (!recordId)
        throw new bad_request_1.default('Record ID is required');
    const updatedRecord = yield nurse_1.MedicalSheet.findByIdAndUpdate(recordId, data, { new: true }).exec();
    if (!updatedRecord)
        throw new not_found_1.default('Record not found');
    const changeHistory = {
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date(),
    };
    // Add the new change history entry to the certificate
    updatedRecord.changeHistory.push(changeHistory);
    // Update the certificate with the new data (excluding changeHistory)
    updatedRecord.set(data);
    // Save the updated certificate
    yield updatedRecord.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Medical Sheet updated', success: true, data: updatedRecord });
}));
exports.updateMedicalSheet = updateMedicalSheet;
// Delete Medical Sheet Record
const deleteMedicalSheet = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.body;
    if (!recordId)
        throw new bad_request_1.default('Record ID is required');
    const deletedRecord = yield nurse_1.MedicalSheet.findByIdAndDelete(recordId).exec();
    if (!deletedRecord)
        throw new not_found_1.default('Record not found');
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Medical Sheet deleted', success: true });
}));
exports.deleteMedicalSheet = deleteMedicalSheet;
const SIX_MONTHS_AGO = new Date();
SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);
const getRecentNursingPatients = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nursingProcessPatients = yield nurse_1.NursingProcess.find({
        updatedAt: { $gte: SIX_MONTHS_AGO }
    }).distinct('patientId');
    const nursingProgressNotePatients = yield nurse_1.NursingProgressNote.find({
        updatedAt: { $gte: SIX_MONTHS_AGO }
    }).distinct('patientId');
    const medicalSheetPatients = yield nurse_1.MedicalSheet.find({
        updatedAt: { $gte: SIX_MONTHS_AGO }
    }).distinct('patientId');
    const vitalSignPatients = yield Vitalsign_1.VitalSign.find({
        updatedAt: { $gte: SIX_MONTHS_AGO }
    }).distinct('patientId');
    // Combine and deduplicate all patient IDs
    const allPatientIds = Array.from(new Set([
        ...nursingProcessPatients,
        ...nursingProgressNotePatients,
        ...medicalSheetPatients,
        ...vitalSignPatients
    ]));
    // Fetch patient data
    const patients = yield Patient_1.default.find({ _id: { $in: allPatientIds } });
    res.status(http_status_codes_1.StatusCodes.OK).json({ patients, count: patients.length });
}));
exports.getRecentNursingPatients = getRecentNursingPatients;
