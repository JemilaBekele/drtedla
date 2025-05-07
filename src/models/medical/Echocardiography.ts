import mongoose from 'mongoose';
import userReferenceSchema from '../../helpers/userReferenceSchema';

const EchocardiographySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  aorticRootAnnulus: {  type: String, },
  aorticRootSinus: { type: String, },
  leftAtrium: { type: String, },
  leftVentricleDiastole: { type: String, },
  leftVentricleSystole: { type: String, },
  IVS: { type: String, },
  PW: { type: String, },
  LVEF: { type: String,  },
  RVBasel: { type: String },
  RA: { type: String, },
  TAPSE: { type: String},
  IVC: { type: String },
  EARatio: { type: String },
  DecelerationTime: { type: String, },
  IVRT: { type: String },
  AverageEE: { type: String },
  MV_MvScore: { type: String, },
  Mv_MVA: { type: String, },
  Mv_MPG: { type: String, },
  TRVelocity: { type: String, },
  RVSP: { type: String, },
  AV_PeakV: { type: String, },
  AV_MPG: { type: String, },
  MPA: { type: String },
  PASP: { type: String },

  summary: { type: String },
  conclusion: { type: String },
  createdBy: userReferenceSchema,
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Tracks the user who updated the record
      updateTime: { type: Date, default: Date.now }, // Captures update timestamps
    },
  ],
}, { timestamps: true });

const Echocardiography = mongoose.models.Echocardiography || mongoose.model('Echocardiography', EchocardiographySchema);

export default Echocardiography;
