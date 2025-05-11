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
exports.getIdcatultrasoun = exports.getAllservice = exports.getAllcatultrasoun = exports.deleteService = exports.updateService = exports.getAllServices = exports.createService = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Services_1 = __importDefault(require("../../models/Services"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const catagory_1 = __importDefault(require("../../models/catagory"));
const createService = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { service, price, catagory } = req.body;
    // Validate request
    if (!service || !price) {
        throw new bad_request_1.default('Service and price are required');
    }
    const Categorys = yield catagory_1.default.findById({ _id: catagory });
    // Check if the service already exists
    const existingService = yield Services_1.default.findOne({ service });
    if (existingService) {
        throw new bad_request_1.default('Service already exists');
    }
    // Create new service
    const newService = yield Services_1.default.create({
        service,
        price,
        categoryId: Categorys._id
    });
    // Send response
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Service registered successfully',
        service: newService,
    });
}));
exports.createService = createService;
const getAllServices = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all services and populate the categoryId with the category name
        const services = yield Services_1.default.find()
            .populate('categoryId', 'name'); // Populate categoryId with the 'name' field from the Category model
        // Return the services
        res.status(http_status_codes_1.StatusCodes.OK).json({ services, count: services.length });
    }
    catch (error) {
        console.error('Error fetching services:', error);
        // Return a generic error response
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to fetch services',
        });
    }
}));
exports.getAllServices = getAllServices;
const getAllcatultrasoun = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Find ALL categories where Imaging is true
        const imagingCategories = yield catagory_1.default.find({ Imaging: true });
        if (!imagingCategories || imagingCategories.length === 0) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                message: "No imaging categories found"
            });
        }
        // 2. Get all category IDs
        const categoryIds = imagingCategories.map(cat => cat._id);
        // 3. Find services that belong to ANY of these categories
        const services = yield Services_1.default.find({
            categoryId: { $in: categoryIds }
        }).populate('categoryId', 'name');
        // 4. Return the services
        res.status(http_status_codes_1.StatusCodes.OK).json({
            services,
            count: services.length
        });
    }
    catch (error) {
        console.error("Error fetching services:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch services",
        });
    }
}));
exports.getAllcatultrasoun = getAllcatultrasoun;
const getIdcatultrasoun = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Fetch only the `service` field of the matching service
        const services = yield Services_1.default.find({ _id: id })
            .select('service'); // Only include `service` field
        // Optional: include category name if needed
        res.status(http_status_codes_1.StatusCodes.OK).json({ services });
    }
    catch (error) {
        console.error("Error fetching services:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch services",
        });
    }
}));
exports.getIdcatultrasoun = getIdcatultrasoun;
const getAllservice = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(id);
    try {
        // Fetch services that belong to the retrieved category
        const services = yield Services_1.default.find({ categoryId: id }).populate('categoryId', 'name');
        // Return the services
        console.log(services);
        res.status(http_status_codes_1.StatusCodes.OK).json({ services, count: services.length });
    }
    catch (error) {
        console.error("Error fetching services:", error);
        // Return a generic error response
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch services",
        });
    }
}));
exports.getAllservice = getAllservice;
const updateService = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, service, price, catagory } = req.body;
    // Validate inputs
    if (!id || (!service && !price)) {
        throw new bad_request_1.default('Service ID and at least one field (service or price) are required');
    }
    const Categorys = yield catagory_1.default.findById({ _id: catagory });
    // Find and update the service by its ID
    const updatedService = yield Services_1.default.findByIdAndUpdate(id, { service, price, categoryId: Categorys._id }, { new: true } // Return the updated document
    );
    console.log("update");
    if (!updatedService) {
        throw new not_found_1.default('Service not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Service updated successfully',
        service: updatedService,
    });
}));
exports.updateService = updateService;
const deleteService = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    // Validate input
    if (!id) {
        throw new bad_request_1.default('Service ID is required');
    }
    // Find and delete the service by its ID
    const deletedService = yield Services_1.default.findByIdAndDelete(id);
    if (!deletedService) {
        throw new not_found_1.default('Service not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Service deleted successfully',
    });
}));
exports.deleteService = deleteService;
