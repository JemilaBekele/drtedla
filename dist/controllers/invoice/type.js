"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/LabTest.ts
const mongoose_1 = require("mongoose");
const LabTestSchema = new mongoose_1.Schema({
// Schema definition
});
const UltraTestSchema = new mongoose_1.Schema({
    patient: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Patient', required: true },
    // Other fields
});
