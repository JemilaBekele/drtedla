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
exports.getUltranotesByname = exports.getUltranote = exports.deleteUltranote = exports.updateUltranote = exports.getUltranotesByUltra = exports.createUltranote = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const ultranote_1 = __importDefault(require("../../models/ultranote"));
const Services_1 = __importDefault(require("../../models/Services"));
/**
 * Create a new Ultranote
 */
const createUltranote = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ultraId } = req.params;
    const { note, noteA, noteB, noteC, noteD, noteF } = req.body;
    // Validate required fields
    if (!ultraId) {
        throw new bad_request_1.default('Ultra ID is required');
    }
    // Create a new Ultranote document
    const newUltranote = new ultranote_1.default({
        note,
        noteA,
        noteB,
        noteC,
        noteD,
        noteF,
        Ultra: ultraId,
    });
    const savedUltranote = yield newUltranote.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Ultranote created successfully',
        success: true,
        data: savedUltranote,
    });
}));
exports.createUltranote = createUltranote;
/**
 * Get all Ultranotes for a specific Ultra test
 */
const getUltranotesByUltra = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ultraId } = req.params;
    // Validate required field
    if (!ultraId) {
        throw new bad_request_1.default('Ultra ID is required');
    }
    // Find all ultranotes for the given ultra test
    const ultranotes = yield ultranote_1.default.find({ Ultra: ultraId }).exec();
    if (!ultranotes || ultranotes.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No ultranotes available for this ultra test',
            data: [],
        });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Ultranotes retrieved successfully',
        success: true,
        data: ultranotes,
    });
}));
exports.getUltranotesByUltra = getUltranotesByUltra;
const getUltranotesByname = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { testName } = req.params;
    if (!testName) {
        throw new bad_request_1.default('Ultra ID is required');
    }
    const services = yield Services_1.default.findOne({ service: testName });
    // Validate required field
    // Find all ultranotes for the given ultra test
    const ultranotes = yield ultranote_1.default.find({ Ultra: services._id }).exec();
    if (!ultranotes || ultranotes.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No ultranotes available for this ultra test',
            data: [],
        });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Ultranotes retrieved successfully',
        success: true,
        data: ultranotes,
    });
}));
exports.getUltranotesByname = getUltranotesByname;
/**
 * Update an existing Ultranote
 */
const updateUltranote = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ultraId } = req.params;
    const { note, noteA, noteB, noteC, noteD, noteF } = req.body;
    // Validate required field
    if (!ultraId) {
        throw new bad_request_1.default('Ultranote ID is required');
    }
    // Find and update the Ultranote document by ID
    const updatedUltranote = yield ultranote_1.default.findByIdAndUpdate(ultraId, { note, noteA, noteB, noteC, noteD, noteF }, { new: true }).exec();
    if (!updatedUltranote) {
        throw new not_found_1.default('Ultranote not found');
    }
    // Save the updated ultranote
    yield updatedUltranote.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Ultranote updated successfully',
        success: true,
        data: updatedUltranote,
    });
}));
exports.updateUltranote = updateUltranote;
/**
 * Delete an Ultranote
 */
const deleteUltranote = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ultraId } = req.params;
    // Validate required field
    if (!ultraId) {
        throw new bad_request_1.default('Ultranote ID is required');
    }
    // Find and delete the Ultranote document by ID
    const deletedUltranote = yield ultranote_1.default.findByIdAndDelete(ultraId).exec();
    if (!deletedUltranote) {
        throw new not_found_1.default('Ultranote not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Ultranote deleted successfully',
        success: true,
    });
}));
exports.deleteUltranote = deleteUltranote;
/**
 * Get a single Ultranote by ID
 */
const getUltranote = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Validate required field
    if (!id) {
        throw new bad_request_1.default('Ultranote ID is required');
    }
    // Find the ultranote by ID
    const ultranote = yield ultranote_1.default.findById(id).exec();
    if (!ultranote) {
        throw new not_found_1.default('Ultranote not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Ultranote retrieved successfully',
        success: true,
        data: ultranote,
    });
}));
exports.getUltranote = getUltranote;
