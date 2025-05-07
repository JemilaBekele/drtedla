import mongoose from 'mongoose';
import userReferenceSchema from '../../helpers/userReferenceSchema';

const LaboratoryCertificateSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please provide Patient ID'],
  },
  HIV_1_2: {
    type: String,
    enum: ['NEGATIVE', 'POSITIVE'],
    required: true,
  },
  HBSAg: {
    type: String,
    enum: ['NEGATIVE', 'POSITIVE'],
    required: true,
  },
  HCV: {
    type: String,
    enum: ['NEGATIVE', 'POSITIVE'],
    required: true,
  },
  VDRL: {
    type: String,
    enum: ['NEGATIVE', 'POSITIVE'],
    required: true,
  },
  HCG: {
    type: String,
    enum: ['NEGATIVE', 'POSITIVE'],
    required: true,
  },
  Blood_Group: {
    type: String,
    required: true,
  },
  Other_Tests: {
    type: String, // or [String] if multiple entries
  },
  Abnormality_Specification: {
    type: String,
  },
  Employment_Fitness: {
    type: String,
    enum: ['Fit for Employment', 'Unfit for Employment'],
    required: true,
  },
  createdBy: userReferenceSchema,
  changeHistory: [
    {
      updatedBy: userReferenceSchema,
      updateTime: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const LaboratoryCertificate = mongoose.models.LaboratoryCertificate || mongoose.model('LaboratoryCertificate', LaboratoryCertificateSchema);

export { LaboratoryCertificate  };
