import mongoose from "mongoose";
import userReferenceSchema from "../helpers/userReferenceSchema";


const ReferLabTestSchema = new mongoose.Schema({
  patient: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
  },
  Xray: {
    type: String,
   
  },
  CtScanwith: {
    type: String,
  },
  CtScanwithout: {
    type: String,
   
  },
  MRI: {
    type: String,
  },
  ColonosCopy: {
    type: String,
   
  },
  EndosCopy: {
    type: String,
  },
  FNAC: {
    type: String,
  },
  Biopsy: {
    type: String,
  },
  Ecg: {
    type: String,
  },
  Echocardiography: {
    type: String,
  },
  Ultrasound: {
    type: String,
  },
  History: {
    type: String,
  },
  PysicalExamination: {
    type: String,
  },
  LabFinding: {
    type: String,
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

const ReferLabTest = mongoose.models.ReferLabTest || mongoose.model('ReferLabTest', ReferLabTestSchema);

export default ReferLabTest;