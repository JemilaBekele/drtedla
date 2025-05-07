import mongoose from "mongoose";
import userReferenceSchema from "../helpers/userReferenceSchema";


const MedicalCertificateSchema = new mongoose.Schema({
  patient: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
  },
  
  briefExplanation: {
    type: String,
    required: [true, "Please provide a brief explanation"],
  },
  diagnosis: {
    type: String,

  },
  restDate: {
    from: {
      type: Date,
      required: [true, "Please provide the start date for the rest period"],
    },
    to: {
      type: Date,
      required: [true, "Please provide the end date for the rest period"],
    },
    totalRestDays: {
      type: Number,
      required: [true, "Please provide the total number of rest days"],
    },
  },
  medicationDate:{
    type: Date,
    required: [true, "Please provide the medication date "],
  },
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Reusing your existing userReferenceSchema
      updateTime: { type: Date, default: Date.now }, // Automatically captures the update time
    },
  ],
  createdBy: userReferenceSchema,

}, 
{
  timestamps: true,
  strictPopulate: false,
});

const MedicalCertificate = mongoose.models.MedicalCertificate || mongoose.model('MedicalCertificate', MedicalCertificateSchema);

export default MedicalCertificate;