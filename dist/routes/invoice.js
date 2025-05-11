"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoice_1 = require("../controllers/invoice/invoice");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:id').post(invoice_1.createInvoice); // Create a new bicycle
router.route('/:id').get(invoice_1.getInvoices); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(invoice_1.deleteInvoice);
router.route('/:id').patch(invoice_1.updateInvoice); // Delete a bicycle by ID
exports.default = router;
