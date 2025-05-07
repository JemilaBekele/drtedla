import mongoose from 'mongoose';
import userReferenceSchema from '../../helpers/userReferenceSchema';

const PhysicalExamSchema = new mongoose.Schema({
  constitutional: {
    type: String,
  },
  heedEyesEarNoseThroat: {
    type: String,
  },
  cardiovascular: {
    type: String,
  },
  Respiratory: {
    type: String,
   
  },
  GastroIntestinal: {
    type: String,
   
  },
  Gentitourinary: {
    type: String,
    
  },
  Musculosekeletal: {
    type: String,
  },
  Integumentary: {
    type: String,
  },
  Breast: {
    type: String,
   
  },
  Neurologic: {
    type: String,

  },
  Psychiatric: {
    type: String,
    
  },
  Endocrine: {
    type: String,
   
  },
  Hematology: {
    type: String,
  },
  Allergic: {
    type: String,
   
  },
  patientId: {
    type: mongoose.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  createdBy: userReferenceSchema,
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Tracks the user who updated the record
      updateTime: { type: Date, default: Date.now }, // Captures update timestamps
    },
  ],
}, { timestamps: true });

const PhysicalExam = mongoose.models.PhysicalExam || mongoose.model('PhysicalExam', PhysicalExamSchema);

export default PhysicalExam;
