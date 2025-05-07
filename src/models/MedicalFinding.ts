import mongoose from 'mongoose';
import userReferenceSchema from "../helpers/userReferenceSchema";

const MedicalFindingSchema = new mongoose.Schema({
  ChiefCompliance: {
    type: String,
  },
  Historypresent: {
    type: String,
  },
  Pastmedicalhistory: {
    type: String,
  },
  Pastmedicationtaken: {
    type: String,
  },
  SystemicExamination: {
    HEENT: { type: String, default: 'Normal' },
    LGS: { type: String, default: 'Normal' },
    Chest: { type: String, default: 'Normal' },
    CVS: { type: String, default: 'Normal' },
    Abdomen: { type: String },
    GastrointestinalSystem: { type: String },
    MusculoskeletalSystem: { type: String },
    IntegumentarySystem: { type: String },
    CNS: {
      CN: { type: String },
      Motor: { type: String },
      Sensory: { type: String },
      Tone: { type: String },
    },
  },
  meningealsigns: {
    Neckstiffness: { type: String, default: '' },
    Kernigssign: { type: String, default: '' },
    Brudzinskissign: { type: String, default: '' },
    Photophobia: { type: String, default: '' },
    Headachefevervomiting: { type: String },
  },
  consciousness:{
    type: String
  },
  GCS:{
    type: String
  },
  Assessment: {
    type: String,
  },
  Treatment: {
    type: String,
  },
  Recommendation: {
    type: String,
  },
  patientId: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
    }
  },
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Reusing your existing userReferenceSchema
      updateTime: { type: Date, default: Date.now }, // Automatically captures the update time
    },
  ],
  diseases: [
    {
      disease: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to Disease model
        ref: 'Disease',
      },
      diseaseTime: { 
        type: Date, 
        default: Date.now 
      },
    },
  ],
  createdBy: userReferenceSchema,
}, { timestamps: true });

const MedicalFinding = mongoose.models.MedicalFinding || mongoose.model('MedicalFinding', MedicalFindingSchema);

export default MedicalFinding;