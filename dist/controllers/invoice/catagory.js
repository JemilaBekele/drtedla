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
exports.deleteCategory = exports.updateCategory = exports.getAllCategorys = exports.createCategory = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const catagory_1 = __importDefault(require("../../models/catagory"));
const createCategory = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, Imaging } = req.body;
    // Validate request
    if (!name) {
        throw new bad_request_1.default('Category and price are required');
    }
    // Create new Category
    const newCategory = yield catagory_1.default.create({
        name, Imaging
    });
    // Send response
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Category registered successfully',
        Category: newCategory,
    });
}));
exports.createCategory = createCategory;
const getAllCategorys = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all Categorys from the database
        const Categorys = yield catagory_1.default.find();
        console.log(Categorys);
        // Return the Categorys
        res.status(http_status_codes_1.StatusCodes.OK).json({ Categorys, count: Categorys.length });
    }
    catch (error) {
        console.error('Error fetching Categorys:', error);
        // Return a generic error response
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to fetch Categorys',
        });
    }
}));
exports.getAllCategorys = getAllCategorys;
const updateCategory = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    const { id } = req.params;
    // Validate inputs
    if (!id || (!name)) {
        throw new bad_request_1.default('Category ID and at least one field (Category or price) are required');
    }
    // Find and update the Category by its ID
    const updatedCategory = yield catagory_1.default.findByIdAndUpdate(id, { name }, { new: true } // Return the updated document
    );
    console.log("update");
    if (!updatedCategory) {
        throw new not_found_1.default('Category not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Category updated successfully',
        Category: updatedCategory,
    });
}));
exports.updateCategory = updateCategory;
const deleteCategory = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Validate input
    if (!id) {
        throw new bad_request_1.default('Category ID is required');
    }
    // Find and delete the Category by its ID
    const deletedCategory = yield catagory_1.default.findByIdAndDelete(id);
    if (!deletedCategory) {
        throw new not_found_1.default('Category not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Category deleted successfully',
    });
}));
exports.deleteCategory = deleteCategory;
