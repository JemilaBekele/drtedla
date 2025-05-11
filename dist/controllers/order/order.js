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
exports.getnurse = exports.createOrder = exports.gerdocorder = exports.getpatients = exports.getOrderById = exports.updateOrder = exports.fetchPatient = exports.getDoctors = exports.getDoc = exports.getcretore = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const Users_1 = __importDefault(require("../../models/Users"));
const Order_1 = __importDefault(require("../../models/Order"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const Agestatic_1 = __importDefault(require("../../models/Agestatic"));
// Create or update an order for a patient
const createOrder = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { patientId, assignedDoctorId, status } = req.body;
    // Validate required fields
    if (!patientId || !assignedDoctorId || !status) {
        throw new bad_request_1.default('Missing required fields: patientId, assignedDoctorId, and status are required.');
    }
    // Find the patient by ID
    const patient = yield Patient_1.default.findById(patientId).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    // Find the assigned doctor by ID
    const assignedDoctor = yield Users_1.default.findById(assignedDoctorId).exec();
    if (!assignedDoctor) {
        throw new not_found_1.default('Assigned doctor not found');
    }
    // Check if the patient already has an order
    if (patient.Order && patient.Order.length > 0) {
        const existingOrder = yield Order_1.default.findById(patient.Order[0]).exec(); // Assuming we update the first order
        if (existingOrder) {
            existingOrder.assignedDoctorTo = {
                id: assignedDoctor._id,
                username: assignedDoctor.username,
            };
            existingOrder.status = status;
            existingOrder.updatedAt = new Date();
            const updatedOrder = yield existingOrder.save();
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: 'Order updated successfully',
                success: true,
                data: updatedOrder,
            });
            return;
        }
    }
    // If no order exists, create a new one
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    const newOrder = new Order_1.default({
        assignedDoctorTo: {
            id: assignedDoctor._id,
            username: assignedDoctor.username,
        },
        patientId: {
            id: patient._id,
        },
        createdBy,
        status,
    });
    const savedOrder = yield newOrder.save();
    // Link the new order to the patient
    patient.Order = patient.Order || [];
    patient.Order.push(savedOrder._id);
    yield patient.save();
    // ✅ Create Age document
    yield new Agestatic_1.default({ patient: patient._id }).save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Order created successfully',
        success: true,
        data: savedOrder,
    });
}));
exports.createOrder = createOrder;
//order route getActiveOrdersAndPatients
const gerdocorder = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Extract doctor ID from the request (e.g., from middleware)
    if (!doctorId) {
        throw new not_found_1.default('Doctor ID not provided or invalid');
    }
    // Fetch active orders for the doctor
    const activeOrders = yield Order_1.default.find({
        'assignedDoctorTo.id': doctorId,
        status: 'Active',
    })
        .sort({ updatedAt: 1 })
        .populate({
        path: 'patientId.id', // Correctly populate the `id` field inside `patientId`
        model: 'Patient', // Ensure the `Patient` model is used for population
    })
        .exec();
    if (!activeOrders.length) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No active orders found',
            success: true,
            orders: [],
        });
        return;
    }
    const ordersWithPatients = activeOrders.map((order) => (Object.assign(Object.assign({}, order.toObject()), { patient: order.patientId })));
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Active orders retrieved successfully',
        success: true,
        orders: ordersWithPatients,
    });
}));
exports.gerdocorder = gerdocorder;
const getDoctors = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find users with the role of 'doctor'
        const doctors = yield Users_1.default.find({ role: { $in: ['doctor', 'nurse'] } }, { username: 1, _id: 1, role: 1 }).exec();
        if (!doctors || doctors.length === 0) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                message: 'No doctors, nurse  found',
                success: false,
            });
        }
        // Return the list of doctors
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Doctors fetched successfully',
            success: true,
            data: doctors,
        });
    }
    catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal server error",
            success: false,
        });
    }
}));
exports.getDoctors = getDoctors;
const getcretore = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find users with the role of 'doctor'
        const doctors = yield Users_1.default.find({ role: { $in: ['doctor', 'Laboratory', 'Ultrasound'] } }, { username: 1, _id: 1, role: 1 }).exec();
        if (!doctors || doctors.length === 0) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                message: 'No doctors, Laboratory  found',
                success: false,
            });
        }
        // Return the list of doctors
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Doctors fetched successfully',
            success: true,
            data: doctors,
        });
    }
    catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal server error",
            success: false,
        });
    }
}));
exports.getcretore = getcretore;
const getnurse = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find users with the role of 'doctor'
        const doctors = yield Users_1.default.find({ role: { $in: ['nurse'] } }, { username: 1, _id: 1, role: 1 }).exec();
        if (!doctors || doctors.length === 0) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                message: 'No doctors, nurse  found',
                success: false,
            });
        }
        // Return the list of doctors
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Doctors fetched successfully',
            success: true,
            data: doctors,
        });
    }
    catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal server error",
            success: false,
        });
    }
}));
exports.getnurse = getnurse;
const getpatients = (0, async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch active orders
        const activeOrders = yield Order_1.default.find({ status: 'Active' }).exec();
        if (!activeOrders || activeOrders.length === 0) {
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: 'No active orders found',
                success: true,
                data: [],
            });
            return;
        }
        // Extract patient IDs from active orders
        const patientIds = activeOrders.map(order => order.patientId.id);
        // Fetch patients based on the extracted IDs and populate their associated orders
        const patients = yield Patient_1.default.find({ _id: { $in: patientIds } }).populate('Order').exec();
        if (!patients || patients.length === 0) {
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: 'No patients found for active orders',
                success: true,
                data: [],
            });
            return;
        }
        // Map patients with their associated orders
        const patientsWithOrders = patients.map(patient => ({
            _id: patient._id,
            firstname: patient.firstname,
            cardno: patient.cardno,
            orders: patient.Order, // Return the populated orders from the patient document
        }));
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Patients with orders retrieved successfully',
            success: true,
            data: patientsWithOrders,
        });
    }
    catch (error) {
        console.error('Error in fetching active orders and associated patients:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
            success: false
        });
    }
}));
exports.getpatients = getpatients;
//active id 
const getOrderById = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Extract order ID from URL params
    // Find the order by ID
    const order = yield Order_1.default.findById(id).exec();
    if (!order) {
        throw new not_found_1.default('Order not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Order retrieved successfully',
        success: true,
        order,
    });
}));
exports.getOrderById = getOrderById;
// Update an order by ID
const updateOrder = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, status, assignedDoctorTo } = req.body;
    // Validate input
    if (!orderId) {
        throw new bad_request_1.default('Order ID is required');
    }
    if (!status || !['Active', 'Inactive'].includes(status)) {
        throw new bad_request_1.default('Valid status is required');
    }
    if (!assignedDoctorTo || !assignedDoctorTo.id) {
        throw new bad_request_1.default('Valid assigned doctor ID is required');
    }
    if (!assignedDoctorTo.username) {
        throw new bad_request_1.default('Assigned doctor username is required');
    }
    // Find the existing order by ID
    const existingOrder = yield Order_1.default.findById(orderId).exec();
    if (!existingOrder) {
        throw new not_found_1.default('Order not found');
    }
    // If status is Inactive, delete order and remove from Patient
    if (status === 'Inactive') {
        // Remove the order reference from the patient
        yield Patient_1.default.updateOne({ _id: existingOrder.patientId.id }, { $pull: { Order: existingOrder._id } }).exec();
        // Delete the order
        yield Order_1.default.findByIdAndDelete(orderId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Order deleted and removed from patient because status was set to Inactive',
            success: true,
        });
        return;
    }
    // Update order fields
    existingOrder.status = status;
    existingOrder.assignedDoctorTo = {
        id: assignedDoctorTo.id,
        username: assignedDoctorTo.username,
    };
    existingOrder.updatedAt = new Date();
    // Save the updated order
    const updatedOrder = yield existingOrder.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Order updated successfully',
        success: true,
        updatedOrder,
    });
}));
exports.updateOrder = updateOrder;
//order patient 
const fetchPatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, cardno } = req.body;
    console.log('Received Body Parameters:', { phoneNumber, cardno });
    // Validate input
    if (!phoneNumber && !cardno) {
        throw new bad_request_1.default('phoneNumber or Card ID is required');
    }
    // Build the query based on input
    const query = phoneNumber ? { phoneNumber } : { cardno };
    // Fetch the patient from the database
    const patient = yield Patient_1.default.findOne(query).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Patient retrieved successfully',
        success: true,
        patient,
    });
}));
exports.fetchPatient = fetchPatient;
const getDoc = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find users with the role of 'doctor'
        const doctors = yield Users_1.default.find({ role: { $in: ['doctor'] } }, { username: 1, _id: 1, role: 1 }).exec();
        if (!doctors || doctors.length === 0) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                message: 'No doctors, nurse  found',
                success: false,
            });
        }
        // Return the list of doctors
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'Doctors fetched successfully',
            success: true,
            data: doctors,
        });
    }
    catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal server error",
            success: false,
        });
    }
}));
exports.getDoc = getDoc;
