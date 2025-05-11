"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const im_1 = require("../controllers/image/im");
const ultra_1 = require("../controllers/labratory/ultra");
const router = express_1.default.Router();
// Define routes for Bicycle    createImage,
// deleteImage,
// getImagesByPatientId
router.route('/:id').post(ultra_1.upload, im_1.createImage); // Create a new bicycle
router.route('/:id').get(im_1.getImagesByPatientId); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(im_1.deleteImage);
exports.default = router;
