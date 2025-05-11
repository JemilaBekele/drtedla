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
exports.deleteMedicalFinding = exports.updateMedicalFinding = exports.getMedicalFinding = exports.getMedicalFindings = exports.createMedicalFinding = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const MedicalFinding_1 = __importDefault(require("../../models/MedicalFinding"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new medical finding
const createMedicalFinding = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    // console.log("hi"); // Keep for debugging if needed
    const { id } = req.params; // Patient ID from URL params
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) { // Validate ID format
        throw new bad_request_1.default('Valid Patient ID is required');
    }
    const { ChiefCompliance, Historypresent, Pastmedicalhistory, Pastmedicationtaken, Assessment, Treatment, Recommendation, GCS, consciousness, meningealsigns, SystemicExamination, diseases, // <-- Extract diseases array from body
     } = req.body;
    // Validate patient existence
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default(`Patient not found with ID: ${id}`);
    }
    // --- Validate and Format Diseases Array ---
    let formattedDiseases = []; // Initialize empty array
    if (Array.isArray(diseases)) {
        formattedDiseases = diseases
            // Filter out items that don't have a valid _id string
            .filter(item => item && typeof item._id === 'string' && mongoose_1.default.Types.ObjectId.isValid(item._id))
            // Map to the schema structure { disease: ObjectId }
            .map(item => ({
            disease: new mongoose_1.default.Types.ObjectId(item._id) // Convert string ID to ObjectId
        }));
    }
    else if (diseases != null) {
        // Optional: Handle case where 'diseases' is present but not an array
        console.warn("Received 'diseases' field is not an array:", diseases);
        // Depending on requirements, you might throw an error or ignore it
        // throw new BadRequestError("'diseases' field must be an array.");
    }
    // --- End Disease Formatting ---
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '', // Make sure userId exists on req.user
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '', // Make sure username exists on req.user
    };
    // Validate createdBy.id format if it's expected to be an ObjectId
    if (!createdBy.id || (((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId) && !mongoose_1.default.Types.ObjectId.isValid(req.user.userId))) {
        console.error("Invalid User ID in token:", (_d = req.user) === null || _d === void 0 ? void 0 : _d.userId);
        throw new bad_request_1.default('Invalid user identifier in token.');
    }
    // Create a new MedicalFinding
    const newMedicalFinding = new MedicalFinding_1.default({
        ChiefCompliance,
        Historypresent,
        Pastmedicalhistory,
        Pastmedicationtaken,
        Assessment,
        Treatment,
        Recommendation,
        GCS,
        consciousness,
        meningealsigns: {
            Neckstiffness: (_e = meningealsigns === null || meningealsigns === void 0 ? void 0 : meningealsigns.Neckstiffness) !== null && _e !== void 0 ? _e : '', // Use nullish coalescing
            Kernigssign: (_f = meningealsigns === null || meningealsigns === void 0 ? void 0 : meningealsigns.Kernigssign) !== null && _f !== void 0 ? _f : '',
            Brudzinskissign: (_g = meningealsigns === null || meningealsigns === void 0 ? void 0 : meningealsigns.Brudzinskissign) !== null && _g !== void 0 ? _g : '',
            Photophobia: (_h = meningealsigns === null || meningealsigns === void 0 ? void 0 : meningealsigns.Photophobia) !== null && _h !== void 0 ? _h : '',
            Headachefevervomiting: (_j = meningealsigns === null || meningealsigns === void 0 ? void 0 : meningealsigns.Headachefevervomiting) !== null && _j !== void 0 ? _j : '', // Keep ?? if empty string is valid default
        },
        SystemicExamination: {
            HEENT: (_k = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.HEENT) !== null && _k !== void 0 ? _k : '',
            LGS: (_l = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.LGS) !== null && _l !== void 0 ? _l : '',
            Chest: (_m = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.Chest) !== null && _m !== void 0 ? _m : '',
            CVS: (_o = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.CVS) !== null && _o !== void 0 ? _o : '',
            Abdomen: (_p = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.Abdomen) !== null && _p !== void 0 ? _p : '',
            GastrointestinalSystem: (_q = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.GastrointestinalSystem) !== null && _q !== void 0 ? _q : '',
            MusculoskeletalSystem: (_r = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.MusculoskeletalSystem) !== null && _r !== void 0 ? _r : '',
            IntegumentarySystem: (_s = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.IntegumentarySystem) !== null && _s !== void 0 ? _s : '',
            CNS: {
                CN: (_u = (_t = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.CNS) === null || _t === void 0 ? void 0 : _t.CN) !== null && _u !== void 0 ? _u : '',
                Motor: (_w = (_v = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.CNS) === null || _v === void 0 ? void 0 : _v.Motor) !== null && _w !== void 0 ? _w : '',
                Sensory: (_y = (_x = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.CNS) === null || _x === void 0 ? void 0 : _x.Sensory) !== null && _y !== void 0 ? _y : '',
                Tone: (_0 = (_z = SystemicExamination === null || SystemicExamination === void 0 ? void 0 : SystemicExamination.CNS) === null || _z === void 0 ? void 0 : _z.Tone) !== null && _0 !== void 0 ? _0 : '',
            },
        },
        patientId: { id: patient._id },
        createdBy,
        diseases: formattedDiseases, // <-- Assign the formatted diseases array
        // changeHistory will be empty initially
    });
    const savedFinding = yield newMedicalFinding.save();
    // Link the medical finding to the patient (Assuming Patient model has MedicalFinding array)
    // Ensure this field exists and is correctly typed in your Patient model
    if (patient.MedicalFinding && Array.isArray(patient.MedicalFinding)) {
        patient.MedicalFinding.push(savedFinding._id);
        yield patient.save();
    }
    else {
        console.warn(`Patient ${patient._id} does not have a valid MedicalFinding array field.`);
        // Handle this case if necessary (e.g., initialize the array)
        // patient.MedicalFinding = [savedFinding._id];
        // await patient.save();
    }
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Medical finding created successfully',
        success: true,
        data: savedFinding,
    });
}));
exports.createMedicalFinding = createMedicalFinding;
// Get medical findings for a patient
const getMedicalFindings = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Patient ID from URL params
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Find the patient by ID and populate MedicalFinding
    const patient = yield Patient_1.default.findById(id)
        .populate({
        path: 'MedicalFinding',
        populate: {
            path: 'diseases.disease',
            model: 'Disease',
        },
    })
        .exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    if (!patient.MedicalFinding || patient.MedicalFinding.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No medical findings available for this patient',
            data: [],
        });
        return;
    }
    // Sort medical findings by `createdAt` in descending order
    const sortedFindings = patient.MedicalFinding.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    console.log(sortedFindings);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Medical findings retrieved successfully',
        success: true,
        data: sortedFindings,
    });
}));
exports.getMedicalFindings = getMedicalFindings;
// Get a specific medical finding
const getMedicalFinding = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    if (!recordId) {
        throw new bad_request_1.default('Medical Finding ID is required');
    }
    const finding = yield MedicalFinding_1.default.findById(recordId)
        .populate({
        path: 'diseases.disease',
        select: 'disease', // Include disease name and exclude _id
        model: 'Disease'
    }).exec();
    console.log(finding);
    if (!finding) {
        throw new not_found_1.default('Medical finding not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Medical finding retrieved successfully',
        success: true,
        data: finding,
    });
}));
exports.getMedicalFinding = getMedicalFinding;
// Update a medical finding
const updateMedicalFinding = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const _c = req.body, { diseases } = _c, data = __rest(_c, ["diseases"]);
    const { recordId } = req.params;
    console.log(diseases);
    if (!recordId)
        throw new bad_request_1.default('Finding ID required');
    const updateData = Object.assign({}, data);
    // Handle diseases array conversion to ObjectIds
    // Modify the disease handling in updateMedicalFinding:
    if (diseases) {
        updateData.diseases = diseases.map((d) => ({
            _id: d._id || new mongoose_1.default.Types.ObjectId(), // Use existing ID or create new
            disease: new mongoose_1.default.Types.ObjectId(d.disease), // Convert disease ID
            diseaseTime: d.diseaseTime || new Date(),
        }));
    }
    const updatedFinding = yield MedicalFinding_1.default.findByIdAndUpdate(recordId, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedFinding) {
        throw new not_found_1.default('Medical finding not found');
    }
    const changeHistory = {
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date(),
    };
    // Add the new change history entry to the certificate
    updatedFinding.changeHistory.push(changeHistory);
    // Update the certificate with the new data (excluding changeHistory)
    updatedFinding.set(data);
    // Save the updated certificate
    yield updatedFinding.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Medical finding updated successfully',
        success: true,
        data: updatedFinding,
    });
}));
exports.updateMedicalFinding = updateMedicalFinding;
// Delete a medical finding
const deleteMedicalFinding = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.params;
    console.log(recordId);
    if (!recordId) {
        throw new bad_request_1.default('Finding ID is required');
    }
    // Find and delete the medical finding by ID
    const deletedFinding = yield MedicalFinding_1.default.findById(recordId);
    if (!deletedFinding) {
        throw new not_found_1.default('Medical finding not found');
    }
    // Proceed to delete
    yield MedicalFinding_1.default.findByIdAndDelete(recordId);
    // Remove the reference from the associated patient
    yield Patient_1.default.updateOne({ MedicalFinding: recordId }, // Locate the patient containing the reference
    { $pull: { MedicalFinding: recordId } } // Remove the reference from the array
    ).exec();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Medical finding deleted successfully',
        success: true,
    });
}));
exports.deleteMedicalFinding = deleteMedicalFinding;
