"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_1 = require("../controllers/order/order");
const router = express_1.default.Router();
router.route('/doc').get(order_1.getDoc);
router.route('/doctor').get(order_1.getDoctors);
router.route('/nurse').get(order_1.getnurse);
router.route('/employee').get(order_1.getcretore);
router.route('/').get(order_1.getpatients);
// Patient-related routes
router.route('/').post(order_1.fetchPatient);
exports.default = router;
