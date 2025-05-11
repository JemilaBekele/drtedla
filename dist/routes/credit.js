"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const credit_1 = require("../controllers/credit/credit");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:id').post(credit_1.createCredit); // Create a new bicycle
router.route('/:id').get(credit_1.getCredits); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(credit_1.deleteCredit);
router.route('/:id').patch(credit_1.updateCredit); // Delete a bicycle by ID
exports.default = router;
