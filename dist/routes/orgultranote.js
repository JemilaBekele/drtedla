"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ultranote_1 = require("../controllers/labratory/ultranote");
const org_1 = require("../controllers/organization/org");
const router = express_1.default.Router();
// Order-related routes    name
router.route('/Ultranote/:ultraId').post(ultranote_1.createUltranote).get(ultranote_1.getUltranotesByUltra);
router.route('/Ultranote/name/:testName').get(ultranote_1.getUltranotesByname);
router.route('/Ultranote/:ultraId').get(ultranote_1.getUltranote).patch(ultranote_1.updateUltranote).delete(ultranote_1.deleteUltranote);
// Order-related routes   
router.route('/organization').post(org_1.createOrganization).get(org_1.getAllOrganizations);
router.route('/organization/:id').get(org_1.getOrganization).patch(org_1.updateOrganization).delete(org_1.deleteOrganization);
exports.default = router;
