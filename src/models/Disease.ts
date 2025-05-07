import mongoose from "mongoose";
import userReferenceSchema from "../helpers/userReferenceSchema"; 

const DiseaseSchema = new mongoose.Schema({
 
    disease: {
    type: String,
    required: [true, 'Please provide a Disease'],
    trim: true,
    unique: true
  },

  createdBy: userReferenceSchema,

}, 
{
  timestamps: true,
  strictPopulate: false,
});

const Disease = mongoose.models.Disease || mongoose.model('Disease', DiseaseSchema);

export default Disease;