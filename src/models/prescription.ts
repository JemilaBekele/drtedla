import mongoose from "mongoose";
import userReferenceSchema from "../helpers/userReferenceSchema";


const PrescriptionSchema = new mongoose.Schema({
  patient: {

      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],

  
  },
  Diagnosis: {
    type: String,
   
  },
  description: {
    type: String,
    required: [true, "Please provide a brief explanation"],
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

const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);

export default Prescription;