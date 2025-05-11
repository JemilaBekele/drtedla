"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_1 = require("../controllers/order/order");
const router = express_1.default.Router();
// Order-related routes
router.route('/').post(order_1.createOrder); // Create a new bicycle
router.route('/:id').get(order_1.getOrderById); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').patch(order_1.updateOrder);
router.route('/').get(order_1.gerdocorder);
exports.default = router;
