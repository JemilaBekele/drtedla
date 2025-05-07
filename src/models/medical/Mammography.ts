import mongoose from 'mongoose';
import userReferenceSchema from '../../helpers/userReferenceSchema';

const MammographySchema = new mongoose.Schema({
  duration: {
    type: String,
  },
  previousStudy: {
    type: String,
  },
  lnmpPostMenopausal: {
    type: String,
  },
  parity: {
    type: String,
  },
  pregnant: {
    type: Boolean,
    required: true,
  },
  breastFeeding: {
    type: Boolean,
    required: true,
  },
  hormonalTreatment: {
    type: Boolean,
    required: true,
  },
  breastLump: {
    type: Boolean,
    required: true,
  },
  nippleDischarge: {
    type: Boolean,
    required: true,
  },
  breastPain: {
    type: Boolean,
    required: true,
  },
  breastSurgery: {
    type: Boolean,
    required: true,
  },
  personalCancerHistory: {
    type: Boolean,
    required: true,
  },
  familyBreastCancerHistory: {
    type: Boolean,
    required: true,
  },
  patientId: {
    type: mongoose.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  createdBy: userReferenceSchema,
}, { timestamps: true });

const Mammography = mongoose.models.Mammography || mongoose.model('Mammography', MammographySchema);

export default Mammography;
