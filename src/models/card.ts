import mongoose from "mongoose";
import userReferenceSchema from "../helpers/userReferenceSchema"; 


const CardSchema = new mongoose.Schema({
  patient: {
    
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
    
  
  },
  cardprice: {
    type: Number,
    required: true,
    default: 200, // Calculated based on items
  },

  createdBy: userReferenceSchema,

}, 
{
  timestamps: true,
  strictPopulate: false,
});

const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);

export default Card;
