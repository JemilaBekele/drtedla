"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCard = exports.updateCard = exports.getCards = exports.createCard = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const card_1 = __importDefault(require("../../models/card"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
// Create a new card
const createCard = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params; // Patient ID from URL params
    const { cardprice } = req.body;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    if (!cardprice) {
        throw new bad_request_1.default('Missing required fields: cardprice');
    }
    // Find the patient by ID
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    const createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    // Create a new Card
    const newCard = new card_1.default({
        cardprice,
        patient: patient._id,
        createdBy,
    });
    const savedCard = yield newCard.save();
    // Link the card to the patient
    patient.Card = patient.Card || [];
    patient.Card.push(savedCard._id);
    yield patient.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Card created successfully',
        success: true,
        data: savedCard,
    });
}));
exports.createCard = createCard;
const getCards = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Patient ID from URL params
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Find the patient by ID and populate the Card field
    const patient = yield Patient_1.default.findById(id).populate('Card').exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found');
    }
    if (!patient.Card || patient.Card.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No Card available for this patient',
            data: [],
        });
        return;
    }
    // Sort the cards by `createdAt` in descending order
    const sortedCards = patient.Card.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Card retrieved successfully',
        success: true,
        data: sortedCards,
    });
}));
exports.getCards = getCards;
const updateCard = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { recordId } = _a, data = __rest(_a, ["recordId"]);
    // Validate the required fields
    if (!recordId) {
        throw new bad_request_1.default('Finding ID is required');
    }
    // Find and update the Card record by ID
    const updatedCard = yield card_1.default.findByIdAndUpdate(recordId, data, { new: true }).exec();
    if (!updatedCard) {
        throw new not_found_1.default('Card finding not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Card finding updated successfully',
        success: true,
        data: updatedCard,
    });
}));
exports.updateCard = updateCard;
const deleteCard = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recordId } = req.body;
    // Validate the required fields
    if (!recordId) {
        throw new bad_request_1.default('Finding ID is required');
    }
    // Find and delete the Card record by ID
    const deletedCard = yield card_1.default.findByIdAndDelete(recordId).exec();
    if (!deletedCard) {
        throw new not_found_1.default('Card finding not found');
    }
    // Optional: Remove references from related documents (if applicable)
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Card finding deleted successfully',
        success: true,
    });
}));
exports.deleteCard = deleteCard;
