"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_1 = require("../controllers/labratory/payment");
const router = express_1.default.Router();
router.route('/ultra/:id').get(payment_1.getultraCustomerId);
router.route('/:id').get(payment_1.getPaymentsByCustomerId).patch(payment_1.updatePaymentAmount);
exports.default = router;
