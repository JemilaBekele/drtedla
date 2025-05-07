import mongoose from 'mongoose';
import userReferenceSchema from '../../helpers/userReferenceSchema';

const ECGSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please provide Patient ID'],
  },
  HR: {
    type: String,
  },
  Rhythm: {
    type: String,
  },
  Axis: {
    type: String,
  },
  PR_Interval: {
    type: String,
  },
  QRS_Morphology: {
    type: String,
  },
  QTC: {
    type: String,
  },
  ST_Changes: {
    type: String,
  },
  T_wave_Changes: {
    type: String,
  },
  Conclusion: {
    type: String,
  },

  createdBy: userReferenceSchema,
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Tracks the user who updated the record
      updateTime: { type: Date, default: Date.now }, // Captures update timestamps
    },
  ],
}, { timestamps: true });

const ECG = mongoose.models.ECG || mongoose.model('ECG', ECGSchema);

export default ECG;
