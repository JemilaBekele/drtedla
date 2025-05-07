import mongoose, { Schema } from 'mongoose';
import userReferenceSchema from "../helpers/userReferenceSchema";
import { MedicalSummary } from './medical/Medicalsummary';

// Schema for each test in a section
const TestSchema = new Schema({
  name: { type: String, required: true },
  note: {
    type: String,
   
  },
  noteA: {
    type: String,
 
  },
  noteB: {
    type: String,
 
  },
  noteC: {
    type: String,
 
  },
  noteD: {
    type: String,
 
  },
  noteF: {
    type: String,
  },
  
  MedicalSummary: {
    type: String,
  },
  Recommendation: {
    type: String,
  },

  price: { type: Number, required: false },

  images: { type: String }

});


// Main UltraTest schema with embedded TestSchema
const UltraTestSchema = new Schema({
  patient: {
    type: mongoose.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please provide Patient ID'],
  },
  status: {
    type: String,
    required: [true, 'Please provide a status'],
    enum: ['Pending', 'Cancel', 'Finish', 'Order'],
  },
  comments: { type: String, default: null },
  confirm: { type: Boolean, default: false },

  tests: [TestSchema], // Embedding multiple tests inside UltraTest

  createdBy: { type: userReferenceSchema, required: true },
  changeHistory: [
    {
      updatedBy: userReferenceSchema,
      updateTime: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const UltraTest = mongoose.model('UltraTest', UltraTestSchema);

export { UltraTest };
