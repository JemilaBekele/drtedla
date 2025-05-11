"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const confirm_1 = require("../controllers/invoice/confirm");
const router = express_1.default.Router();
// Create a new bicycle
router.route('/').get(confirm_1.getInvoices);
router.route('/:id').patch(confirm_1.updateInvoiceWithHistory);
exports.default = router;
