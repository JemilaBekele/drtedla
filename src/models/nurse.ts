import mongoose from "mongoose";
import userReferenceSchema from "../helpers/userReferenceSchema"; 

// Nursing Process Schema
const NursingProcessSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  assessment: { type: String, required: true },
  diagnosis: { type: String, required: true },
  planning: { type: String, required: true },
  intervention: { type: String, required: true },
  evaluation: { type: String, required: true },
  scenario: { type: String },
  createdBy: userReferenceSchema,
  updatedBy: [userReferenceSchema],
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Tracks the user who updated the record
      updateTime: { type: Date, default: Date.now }, // Captures update timestamps
    },
  ],
}, { timestamps: true });

// Nursing Progress Note Schema
const NursingProgressNoteSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  progressNote: { type: String, required: true },
  createdBy: userReferenceSchema,
  updatedBy: [userReferenceSchema],
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Tracks the user who updated the record
      updateTime: { type: Date, default: Date.now }, // Captures update timestamps
    },
  ],
}, { timestamps: true });

// Medical Sheet Schema
const MedicalSheetSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  name: { type: String, required: true },  // Name of procedure/medication
  medicationProcedure: { type: String, required: true }, 
  doseGiven: { type: String },
  route: { type: String, required: true },  // e.g., IV, Oral, IM
  frequency: { type: String },
  remark: { type: String },
  createdBy: userReferenceSchema,
  updatedBy: [userReferenceSchema],
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Tracks the user who updated the record
      updateTime: { type: Date, default: Date.now }, // Captures update timestamps
    },
  ],
}, { timestamps: true });

// Model Exports
const NursingProcess = mongoose.models.NursingProcess || mongoose.model("NursingProcess", NursingProcessSchema);
const NursingProgressNote = mongoose.models.NursingProgressNote || mongoose.model("NursingProgressNote", NursingProgressNoteSchema);
const MedicalSheet = mongoose.models.MedicalSheet || mongoose.model("MedicalSheet", MedicalSheetSchema);

export { NursingProcess, NursingProgressNote, MedicalSheet };
