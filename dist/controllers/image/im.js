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
exports.getImagesByPatientId = exports.deleteImage = exports.createImage = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const multer_1 = __importDefault(require("multer"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const image_1 = __importDefault(require("../../models/image"));
const uploadImage_1 = require("../../helpers/uploadImage");
// Multer setup for image upload
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
}).fields([
    { name: 'image', maxCount: 1 },
]);
// Create image
const createImage = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { patientId } = req.body;
    if (!patientId) {
        throw new bad_request_1.default('Patient ID is required');
    }
    if (!req.files || typeof req.files !== 'object' || !('image' in req.files)) {
        throw new bad_request_1.default('Please provide an image');
    }
    const imageFile = (_a = req.files['image']) === null || _a === void 0 ? void 0 : _a[0];
    const imagePath = yield (0, uploadImage_1.uploadImage)(imageFile);
    const newImage = yield image_1.default.create({
        patientId,
        image: imagePath,
    });
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Image uploaded successfully',
        data: newImage,
    });
}));
exports.createImage = createImage;
// Get all images for a patient
const getImagesByPatientId = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // patientId
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const images = yield image_1.default.find({ patientId: id }).sort({ createdAt: -1 });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Images retrieved successfully',
        data: images,
    });
}));
exports.getImagesByPatientId = getImagesByPatientId;
// Delete image by 
const deleteImage = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // imageId
    if (!id) {
        throw new bad_request_1.default('Image ID is required');
    }
    const deletedImage = yield image_1.default.findByIdAndDelete(id);
    if (!deletedImage) {
        throw new not_found_1.default('Image not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Image deleted successfully',
    });
}));
exports.deleteImage = deleteImage;
