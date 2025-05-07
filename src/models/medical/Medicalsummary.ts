import mongoose from 'mongoose';
import userReferenceSchema from '../../helpers/userReferenceSchema';


const MedicalSummarySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please provide Patient ID'],
  },
  Constitutional: {
    type: String,
  },
  Hear_Eyes_Ear_Nose_Throat: {
    type: String,
  },
  Cardiovascular: {
    type: String,
  },
  Respiratory: {
    type: String,
  },
  Gastrointestinal: {
    type: String,
  },
  Genitourinary: {
    type: String,
  },
  Musculoskeletal: {
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
  Hematology_Lymphatic: {
    type: String,
  },
  Allergic_Immunologic: {
    type: String,
  },
  Endocrine: {
    type: String,
  },
  Lifestyle_Recommendation: {
    type: String,
  },
  createdBy: userReferenceSchema,
}, { timestamps: true });

const MedicalSummary = mongoose.models.MedicalSummary || mongoose.model('MedicalSummary', MedicalSummarySchema);

export {  MedicalSummary };
