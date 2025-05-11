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
exports.getultraTestsByunconfirm = exports.finishultraTest = exports.getultraTestsFinish = exports.getultraTestsByforultra = exports.deleteultraTest = exports.upload = exports.getUltraTestsByid = exports.updateUltraTest = exports.getUltraTestsByPatient = exports.confirmultraTest = exports.createUltraTest = exports.updateUltraText = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const ultrasound_1 = require("../../models/ultrasound");
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const multer_1 = __importDefault(require("multer"));
const uploadImage_1 = require("../../helpers/uploadImage");
const payments_1 = __importDefault(require("../../models/payments"));
// Multer setup
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
}).fields([
    { name: 'images', maxCount: 10 }, // Expecting one image per test update
]);
exports.upload = upload;
// Controller to update test result and image
const updateUltraTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    console.log('Received files:', req.files);
    console.log('Received body:', req.body);
    const { ultraTestId, name, note, noteA, noteB, noteC, noteD, noteF, Recommendation, MedicalSummary } = req.body;
    if (!ultraTestId || !name) {
        throw new bad_request_1.default('Please provide ultraTestId, name.');
    }
    if (!req.files || typeof req.files !== 'object' || !('images' in req.files)) {
        throw new bad_request_1.default('Please provide the test image.');
    }
    const imageFile = (_a = req === null || req === void 0 ? void 0 : req.files['images']) === null || _a === void 0 ? void 0 : _a[0];
    console.log(imageFile);
    const imagePath = yield (0, uploadImage_1.uploadImage)(imageFile);
    // Find and update the specific test inside UltraTest
    const ultraTest = yield ultrasound_1.UltraTest.findOneAndUpdate({ _id: ultraTestId, 'tests.name': name }, {
        $set: {
            'tests.$.note': note,
            'tests.$.noteA': noteA,
            'tests.$.noteB': noteB,
            'tests.$.noteC': noteC,
            'tests.$.noteD': noteD,
            'tests.$.noteF': noteF,
            'tests.$.MedicalSummary': MedicalSummary,
            'tests.$.Recommendation': Recommendation,
            'tests.$.images': imagePath,
        },
    }, { new: true });
    if (!ultraTest) {
        throw new not_found_1.default('UltraTest or Test not found.');
    }
    ultraTest.status = "Pending";
    const changeHistory = {
        updatedBy: {
            id: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || '',
            username: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.username) || '',
        },
        updateTime: new Date()
    };
    ultraTest.changeHistory.push(changeHistory);
    yield ultraTest.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Test result and image updated successfully.',
        ultraTest,
    });
}));
exports.updateUltraTest = updateUltraTest;
const updateUltraText = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log('Received body:', req.body);
    const { ultraTestId, name, note, noteA, noteB, noteC, noteD, noteF, Recommendation, MedicalSummary } = req.body;
    if (!ultraTestId || !name) {
        throw new bad_request_1.default('Please provide ultraTestId and name.');
    }
    // Find and update the specific test inside UltraTest
    const ultraTest = yield ultrasound_1.UltraTest.findOneAndUpdate({ _id: ultraTestId, 'tests.name': name }, {
        $set: {
            'tests.$.note': note,
            'tests.$.noteA': noteA,
            'tests.$.noteB': noteB,
            'tests.$.noteC': noteC,
            'tests.$.noteD': noteD,
            'tests.$.noteF': noteF,
            'tests.$.MedicalSummary': MedicalSummary,
            'tests.$.Recommendation': Recommendation,
        },
    }, { new: true });
    if (!ultraTest) {
        throw new not_found_1.default('UltraTest or Test not found.');
    }
    ultraTest.status = "Pending";
    const changeHistory = {
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date()
    };
    ultraTest.changeHistory.push(changeHistory);
    yield ultraTest.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Test result updated successfully.',
        ultraTest,
    });
}));
exports.updateUltraText = updateUltraText;
const createUltraTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const { tests } = req.body; // Array of tests, not sections anymore
    console.log(tests);
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    if (!tests || !Array.isArray(tests)) {
        throw new bad_request_1.default('Tests array is required');
    }
    // Find the patient
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    // Build createdBy object using authenticated user details
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    // Format each test
    const formattedTests = tests.map((test) => ({
        name: test.name,
        note: test.note || null,
        noteA: test.noteA || null,
        noteB: test.noteB || null,
        noteC: test.noteC || null,
        noteD: test.noteD || null,
        noteF: test.noteF || null,
        MedicalSummary: test.MedicalSummary || null,
        Recommendation: test.Recommendation || null,
        unit: test.unit || null,
        referenceRange: test.referenceRange || null,
        Remark: test.Remark || null,
        price: test.price || 0,
    }));
    // Create a new UltraTest document with all tests
    const newUltraTest = new ultrasound_1.UltraTest({
        patient: patient._id,
        tests: formattedTests,
        createdBy,
        status: 'Order',
    });
    const savedUltraTest = yield newUltraTest.save();
    // Link the UltraTest to the patient
    patient.UltraTest = patient.UltraTest || [];
    patient.UltraTest.push(savedUltraTest._id);
    yield patient.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Lab Test created successfully',
        success: true,
        data: savedUltraTest,
    });
}));
exports.createUltraTest = createUltraTest;
/**
 * ✅ Retrieve all Lab Tests for a given patient.
 */
const getUltraTestsByPatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const UltraTests = yield ultrasound_1.UltraTest.find({ patient: id })
            .populate('patient')
            .sort({ createdAt: -1 }) // Sort by most recent
            .exec();
        console.log(UltraTests);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Lab tests retrieved successfully',
            success: true,
            data: UltraTests,
        });
    }
    catch (error) {
        console.error('Error retrieving lab tests:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getUltraTestsByPatient = getUltraTestsByPatient;
const getUltraTestsByid = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const ultraTest = yield ultrasound_1.UltraTest.find({ _id: id });
        console.log(ultraTest);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Lab tests retrieved successfully',
            success: true,
            data: ultraTest,
        });
    }
    catch (error) {
        console.error('Error retrieving lab tests:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error',
        });
    }
}));
exports.getUltraTestsByid = getUltraTestsByid;
const deleteultraTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new bad_request_1.default('Lab Test ID is required');
    }
    const deletedultraTest = yield ultrasound_1.UltraTest.findByIdAndDelete(id).exec();
    if (!deletedultraTest) {
        throw new not_found_1.default('Lab Test not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Lab Test deleted successfully',
        success: true,
    });
}));
exports.deleteultraTest = deleteultraTest;
const getultraTestsByforultra = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ultraTests = yield ultrasound_1.UltraTest.find({
            $or: [{ status: 'Pending' }, { status: 'Order' }]
        })
            .populate('patient', '_id cardno firstname age sex phoneNumber');
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'ultra tests retrieved successfully',
            data: ultraTests,
        });
    }
    catch (err) {
        console.error(err);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'An error occurred while retrieving ultra tests',
        });
    }
}));
exports.getultraTestsByforultra = getultraTestsByforultra;
const getultraTestsFinish = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve all lab tests with status 'Pending' or 'Order'
        const ultraTests = yield ultrasound_1.UltraTest.find({
            status: 'Finish' // Filter by Pending or Order status
        })
            .populate('patient', '_id cardno firstname age sex phoneNumber');
        // Retrieve pricing configurations for test sections
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'ultr tests  Finish retrieved successfully',
            data: ultraTests,
        });
    }
    catch (err) {
        console.error(err);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'An error occurred while retrieving ultra tests',
        });
    }
}));
exports.getultraTestsFinish = getultraTestsFinish;
const finishultraTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Lab test ID
    if (!id) {
        throw new bad_request_1.default('Lab Test ID is required');
    }
    const existingultraTest = yield ultrasound_1.UltraTest.findById(id);
    if (!existingultraTest) {
        throw new not_found_1.default('Lab Test not found');
    }
    if (existingultraTest.status === "Finish") {
        throw new bad_request_1.default('Lab Test is already marked as finished');
    }
    // Set the status to "Finish"
    existingultraTest.status = "Finish";
    const changeHistory = {
        updatedBy: {
            id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
            username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
        },
        updateTime: new Date()
    };
    // Add the new change history entry
    existingultraTest.changeHistory.push(changeHistory);
    // Save the updated lab test with the "Finish" status
    yield existingultraTest.save();
    res.status(200).json({ success: true, message: "Lab Test marked as finished", data: existingultraTest });
}));
exports.finishultraTest = finishultraTest;
const getultraTestsByunconfirm = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const GLOBAL_DEFAULT_PRICE = 0; // Fallback price if no pricing rules match
        // Fetch unconfirmed UltraTests and populate patient details
        const unconfirmedUltraTests = yield ultrasound_1.UltraTest.find({ confirm: false })
            .populate('patient', 'cardno firstname');
        // Map through the unconfirmed UltraTests to calculate individual and total prices
        const result = unconfirmedUltraTests.map((ultraTest) => {
            // Calculate the total price for all tests in this UltraTest
            const totalPrice = ultraTest.tests.reduce((sum, test) => {
                return sum + (test.price || GLOBAL_DEFAULT_PRICE); // Use fallback price if price is missing
            }, 0);
            // Return the UltraTest with additional price details
            return Object.assign(Object.assign({}, ultraTest.toObject()), { tests: ultraTest.tests.map((test) => (Object.assign(Object.assign({}, test.toObject()), { price: test.price || GLOBAL_DEFAULT_PRICE }))), totalPrice });
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Ultra tests retrieved successfully',
            data: result,
        });
    }
    catch (err) {
        console.error(err);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'An error occurred while retrieving lab tests',
        });
    }
}));
exports.getultraTestsByunconfirm = getultraTestsByunconfirm;
const confirmultraTest = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { amountPaid } = req.body; // Add amountPaid from the request body
    if (!id)
        throw new bad_request_1.default('Ultra Test ID is required');
    if (typeof amountPaid !== 'number' || amountPaid < 0) {
        throw new bad_request_1.default('Valid amount paid is required');
    }
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    try {
        // Fetch the UltraTest from the database
        const existingUltraTest = yield ultrasound_1.UltraTest.findById(id);
        if (!existingUltraTest)
            throw new not_found_1.default('Ultra Test not found');
        if (existingUltraTest.confirm)
            throw new bad_request_1.default('Ultra Test already confirmed');
        // Calculate the total price for all tests in the UltraTest
        const totalAmount = existingUltraTest.tests.reduce((sum, test) => {
            return sum + (test.price || 0); // Use fallback price if price is missing
        }, 0);
        console.log(`Total Amount Calculated: ${totalAmount}`);
        // Ensure the total amount is valid
        if (totalAmount <= 0) {
            throw new Error('Total amount must be greater than zero');
        }
        // Ensure that the amount paid is less than or equal to the total amount
        if (amountPaid > totalAmount) {
            throw new bad_request_1.default('Amount paid cannot exceed the total amount');
        }
        // Calculate amount due
        const amountDue = totalAmount - amountPaid;
        // Mark the UltraTest as confirmed
        existingUltraTest.confirm = true;
        // Save the updated UltraTest
        const updatedUltraTest = yield existingUltraTest.save();
        // Create a payment record for the confirmed UltraTest
        const payment = new payments_1.default({
            ultraTest: updatedUltraTest._id,
            customerName: updatedUltraTest.patient,
            OrderBy: updatedUltraTest.createdBy.id,
            totalAmount, // Total amount calculated from the tests
            amountPaid, // Amount paid from the request body
            amountDue, // Amount due calculated as totalAmount - amountPaid
            paymentHistory: [],
            createdBy, // Initialize payment history
        });
        console.log('Payment Total Amount:', totalAmount);
        // Save the payment record
        yield payment.save();
        // Respond to client
        res.status(200).json({
            success: true,
            message: "Ultra Test confirmed and payment record created",
            data: {
                ultraTest: updatedUltraTest,
                payment: {
                    totalAmount: payment.totalAmount,
                    amountPaid: payment.amountPaid,
                    amountDue: payment.amountDue,
                    paymentId: payment._id,
                },
            },
        });
    }
    catch (error) {
        console.error('Error confirming Ultra Test:', error);
        res.status(400).json({
            success: false,
            message: 'Confirmation failed',
        });
    }
}));
exports.confirmultraTest = confirmultraTest;
