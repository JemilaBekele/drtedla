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
exports.getAllRecentPatients = exports.getoutpatient = exports.deletepatient = exports.searchPatients = exports.getAllpatient = exports.updatepatient = exports.getpatient = exports.createPatient = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const Order_1 = __importDefault(require("../../models/Order"));
const MedicalFinding_1 = __importDefault(require("../../models/MedicalFinding"));
const healthinfo_1 = __importDefault(require("../../models/healthinfo"));
const appointment_1 = __importDefault(require("../../models/appointment"));
const Invoice_1 = __importDefault(require("../../models/Invoice"));
const card_1 = __importDefault(require("../../models/card"));
const creadit_1 = __importDefault(require("../../models/creadit"));
const Orgnazation_1 = __importDefault(require("../../models/Orgnazation"));
const prescription_1 = __importDefault(require("../../models/prescription"));
const medicalcerteficate_1 = __importDefault(require("../../models/medicalcerteficate"));
const image_1 = __importDefault(require("../../models/image")); // Ensure Image is imported as a Mongoose model
// Create a new bicycle
const createPatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { cardno, firstname, status, age, sex, phoneNumber, Town, KK, HNo, description } = req.body;
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    const existingPatient = yield Patient_1.default.findOne({ cardno });
    if (existingPatient) {
        throw new bad_request_1.default('Patient ID already exists. Please use a unique bicycle ID.');
    }
    const patient = yield Patient_1.default.create({ cardno, firstname, age, sex, status, phoneNumber, Town, KK, HNo, description, createdBy });
    res.status(http_status_codes_1.StatusCodes.CREATED).json({ patient });
}));
exports.createPatient = createPatient;
// Get a single bicycle by ID
const getpatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: PatientId } = req.params;
    if (!PatientId) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Pass the ObjectId directly to findById
    const patient = yield Patient_1.default.findById({ _id: PatientId });
    if (!patient) {
        throw new not_found_1.default(`No Patient found with ID: ${PatientId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ patient });
}));
exports.getpatient = getpatient;
// Get all bicycles
const getAllpatient = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const patients = yield Patient_1.default.find({});
    console.log(patients);
    res.status(http_status_codes_1.StatusCodes.OK).json({ patients, count: patients.length });
}));
exports.getAllpatient = getAllpatient;
const getAllRecentPatients = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentPatients = yield Patient_1.default.find({
        createdAt: { $gte: sixMonthsAgo }
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        patients: recentPatients,
        count: recentPatients.length
    });
}));
exports.getAllRecentPatients = getAllRecentPatients;
const getoutpatient = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const patients = yield Patient_1.default.find({ status: 'Out' })
        .sort({ createdAt: -1 }) // Newest patients first
        .limit(100); // Limit to 100 patients
    res.status(http_status_codes_1.StatusCodes.OK).json({ patients });
}));
exports.getoutpatient = getoutpatient;
// Delete a bicycle by ID
const deletepatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: PatientId } = req.params;
    if (!PatientId) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const patient = yield Patient_1.default.findById(PatientId).exec();
    if (!patient) {
        throw new not_found_1.default(`No Patient found with ID: ${PatientId}`);
    }
    // Delete associated documents
    const modelsToDelete = [
        { model: Order_1.default, ids: patient.Order },
        { model: MedicalFinding_1.default, ids: patient.MedicalFinding },
        { model: healthinfo_1.default, ids: patient.Healthinfo },
        { model: appointment_1.default, ids: patient.Appointment },
        { model: image_1.default, ids: patient.Image },
        { model: Invoice_1.default, ids: patient.Invoice },
        { model: card_1.default, ids: patient.Card },
        { model: creadit_1.default, ids: patient.Credit },
        { model: Orgnazation_1.default, ids: patient.Orgnazation },
        { model: prescription_1.default, ids: patient.Prescription },
        { model: medicalcerteficate_1.default, ids: patient.MedicalCertificate },
    ];
    for (const entry of modelsToDelete) {
        if (entry.ids && entry.ids.length > 0) {
            yield entry.model.deleteMany({ _id: { $in: entry.ids } });
        }
    }
    // Also delete the Age model
    // Finally, delete the patient
    yield Patient_1.default.findByIdAndDelete(PatientId);
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Patient and all related records deleted successfully' });
}));
exports.deletepatient = deletepatient;
const updatepatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: PatientId } = req.params;
    if (!PatientId) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const updatedpatient = yield Patient_1.default.findByIdAndUpdate(PatientId, req.body, // Update with the fields provided in the request body
    {
        new: true, // Return the updated document
        runValidators: true, // Ensure the update adheres to schema validation
    });
    if (!updatedpatient) {
        throw new not_found_1.default(`No Patient found with ID: ${PatientId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'Patient updated successfully', Patient: updatedpatient });
}));
exports.updatepatient = updatepatient;
const searchPatients = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardno, name, phoneNumber } = req.query;
    console.log(cardno);
    // Check if at least one search parameter is provided
    if (!cardno && !name && !phoneNumber) {
        throw new bad_request_1.default('Please provide at least one search parameter (cardno, name, or phoneNumber)');
    }
    // Build the search query dynamically based on provided parameters
    const query = {};
    if (cardno) {
        query.cardno = { $regex: cardno, $options: 'i' };
    }
    if (name) {
        query.$or = [
            { firstname: { $regex: name, $options: 'i' } },
            { lastname: { $regex: name, $options: 'i' } } // Assuming you have a lastname field
        ];
    }
    if (phoneNumber) {
        query.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    }
    const patients = yield Patient_1.default.find(query);
    if (patients.length === 0) {
        throw new not_found_1.default('No patients found matching the search criteria');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        count: patients.length,
        data: patients
    });
}));
exports.searchPatients = searchPatients;
