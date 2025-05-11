"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ultra_1 = require("../controllers/labratory/ultra");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:id').post(ultra_1.createUltraTest).get(ultra_1.getUltraTestsByPatient);
router.route('/:id').patch(ultra_1.upload, ultra_1.updateUltraTest).delete(ultra_1.deleteultraTest);
router.route('/dietail/:id').get(ultra_1.getUltraTestsByid).patch(ultra_1.finishultraTest);
router.route('/UltraText/update/:id').patch(ultra_1.upload, ultra_1.updateUltraText);
router.route('/image/forlab').get(ultra_1.getultraTestsByforultra);
router.route('/finish/lab').get(ultra_1.getultraTestsFinish);
router.route('/confirm/lab/:id').patch(ultra_1.confirmultraTest);
router.route('/uncomfirm/lab').get(ultra_1.getultraTestsByunconfirm);
exports.default = router;
