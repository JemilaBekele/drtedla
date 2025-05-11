"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const custom_api_1 = __importDefault(require("../errors/custom-api"));
const http_status_codes_1 = require("http-status-codes");
const errorHandlerMiddleware = (err, req, res) => {
    console.log(err);
    if (err instanceof custom_api_1.default) {
        return res.status(err.statusCode).json({ msg: err.message });
    }
    return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
};
exports.default = errorHandlerMiddleware;
