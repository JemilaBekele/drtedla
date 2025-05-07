import mongoose from 'mongoose';
import userReferenceSchema from '../../helpers/userReferenceSchema';

const GastrointestinalColonoscopySchema = new mongoose.Schema({
  referringPhysician: {
    type: String,
    
  },
  clinicalHistory: {
    type: String,
   
  },
  indication: {
    type: String,
   
  },
  bowelPreparation: {
    type: String,
   
  },
  treatmentGiven: {
    type: String,
   
  },
  biopsy: {
    type: String,
   
  },
  colonoscopyFinding: {
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

const GastrointestinalColonoscopy = mongoose.models.GastrointestinalColonoscopy || mongoose.model('GastrointestinalColonoscopy', GastrointestinalColonoscopySchema);

export default GastrointestinalColonoscopy;
