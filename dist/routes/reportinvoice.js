"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const confirm_1 = require("../controllers/invoice/confirm");
const report_1 = require("../controllers/invoice/report");
const router = express_1.default.Router();
router.route('/:id').patch(confirm_1.updateInvoiceWithHistory);
router.route('/').post(report_1.getInvoicesCardsExpenses).get(report_1.getFinancialSummary);
router.route('/invoice').patch(report_1.getUnconfirmedInvoices);
router.route('/report/chart').get(report_1.getbarchart).post(report_1.getExpenses); // Delete a bicycle by ID
router.route('/report/patient').get(report_1.getPatientsByMonth);
router.route('/range').get(report_1.getPatientGenderCount);
router.route('/range/age').get(report_1.getPatientsByAgeRange);
router.route('/get/ServiceRankings').get(report_1.getServiceRankings).post(report_1.getServiceDateRankings);
exports.default = router;
