import mongoose from "mongoose";
import userReferenceSchema from "../helpers/userReferenceSchema";

const CreditHistorySchema = new mongoose.Schema({
  Credit: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'Credit',
      required: [true, 'Please provide user ID'],
    },
    
  customerName: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Patient', // Reference to Patient model
          required: [true, 'Please provide Patient ID'],
        }
      },
  created: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to Patient model
          required: [true, 'Please provide Patient ID'],
        }      
      },
  },
  
  createdBy: userReferenceSchema,  
}, 
{
  timestamps: true,
  strictPopulate: false,
});

const CreditHistory = mongoose.models.CreditHistory || mongoose.model('CreditHistory', CreditHistorySchema);

export default CreditHistory;