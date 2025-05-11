"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const card_1 = require("../controllers/card/card");
const router = express_1.default.Router();
// Define routes for Bicycle
router.route('/:id').post(card_1.createCard); // Create a new bicycle
router.route('/:id').get(card_1.getCards); // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(card_1.deleteCard);
router.route('/:id').patch(card_1.updateCard); // Delete a bicycle by ID
exports.default = router;
