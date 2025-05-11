"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomAPIError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name; // Set the error name to the class name
        this.statusCode = statusCode; // Assign the status code to the property
        Error.captureStackTrace(this, this.constructor); // Capture the stack trace
    }
}
exports.default = CustomAPIError;
