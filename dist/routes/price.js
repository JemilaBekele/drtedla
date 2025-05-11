"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TestPricing_1 = require("../controllers/TestPricing/TestPricing");
const router = express_1.default.Router();
// Get all test pricings
router.route('/').get(TestPricing_1.getAllTestPricing).post(TestPricing_1.upsertTestPricing);
// Get pricing by section
router.route('/section/:section').get(TestPricing_1.getTestPricingBySection);
// Delete pricing by ID
router.route('/:id').delete(TestPricing_1.deleteTestPricing);
;
const lab_1 = require("../controllers/labratory/lab");
router.route('/reception/confirm/:id').patch(lab_1.confirmLabTest);
exports.default = router;
