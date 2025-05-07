import mongoose from 'mongoose';
import userReferenceSchema from '../../helpers/userReferenceSchema';

const GastrointestinalEndoscopySchema = new mongoose.Schema({
  referringPhysician: {
    type: String,
    
  },
  treatmentGiven: {
    type: String,
    
  },
  biopsy: {
    type: String,
    
  },
  clinicalHistory: {
    type: String,
    
  },
  indication: {
    type: String,
    
  },
  endoscopyFinding: {
    type: String,
    
  },
  conclusion: {
    type: String,
    
  },
  recommendation: {
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

const GastrointestinalEndoscopy = mongoose.models.GastrointestinalEndoscopy || mongoose.model('GastrointestinalEndoscopy', GastrointestinalEndoscopySchema);

export default GastrointestinalEndoscopy;
