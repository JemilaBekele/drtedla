"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const organ_1 = require("../controllers/Orgnazation/organ");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:id').post(organ_1.createOrgnazation); // Create a new bicycle
router.route('/:id').get(organ_1.getOrgnazations); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(organ_1.deleteOrganization);
router.route('/:id').patch(organ_1.updateOrganization);
router.route('/').get(organ_1.getOrgall); // Delete a bicycle by ID
exports.default = router;
