import mongoose from 'mongoose';
import userReferenceSchema from '../../helpers/userReferenceSchema';


const PatientIntakeSchema = new mongoose.Schema({
  
  ChiefCompliance: {
    type: String,
  },
  Allergies: {
    type: String,
  },
  currentmedicationList: {
    type: String,
  },
  pastmedicalHistory: {
    type: String,
  },
  PastSurgicalHostory: {
    type: String,
  },
  Maritalstatusoccupation: {
    type: String,
  },
  patientId: {
    
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],

    
  },
  createdBy: userReferenceSchema,
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Tracks the user who updated the record
      updateTime: { type: Date, default: Date.now }, // Captures update timestamps
    },
  ],
}, { timestamps: true });

const PatientIntake = mongoose.models.PatientIntake || mongoose.model('PatientIntake', PatientIntakeSchema);

export default PatientIntake;