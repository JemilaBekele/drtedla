"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const test_1 = require("../controllers/TestSchema/test");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/').post(test_1.addTestConfig).get(test_1.getAllTestConfigs); // Get all bicycles
router.route('/:id').delete(test_1.deleteTestConfig).patch(test_1.updateTestConfig);
const TestPricing_1 = require("../controllers/TestPricing/TestPricing");
// Define routes for Bicycle
router.route('/price').post(TestPricing_1.upsertTestPricing).get(TestPricing_1.getAllTestPricing); // Get all bicycles
router.route('/price/:id').delete(TestPricing_1.deleteTestPricing).patch(TestPricing_1.updateTestPricing);
// Define routes for Bicycle
exports.default = router;
