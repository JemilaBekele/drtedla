"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const referelab_1 = require("../controllers/labratory/referelab");
const router = express_1.default.Router();
// Order-related routes    name
router.route('/:id').post(referelab_1.createReferLabTest).get(referelab_1.getReferLabTests);
router.route('/:id').patch(referelab_1.updateReferLabTest).delete(referelab_1.deleteReferLabTest);
exports.default = router;
