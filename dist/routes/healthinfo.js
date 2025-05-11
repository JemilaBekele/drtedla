"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const healthinfo_1 = require("../controllers/healthinfo/healthinfo");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:id').post(healthinfo_1.createHealthinfo); // Create a new bicycle
router.route('/:id').get(healthinfo_1.getHealthinfo); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(healthinfo_1.deleteHealthinfoRecord);
router.route('/:id').patch(healthinfo_1.updateHealthinfoRecord); // Delete a bicycle by ID
exports.default = router;
