import mongoose from "mongoose";
import userReferenceSchema from "../helpers/userReferenceSchema";

const HistorySchema = new mongoose.Schema({
  Invoice: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'Invoice',
      required: [true, 'Please provide user ID'],
    },
    
    amount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Amount must be an integer',
      },
    },
    receipt: {
      type: Boolean,
      default: false,
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
          ref: 'Patient', // Reference to Patient model
          required: [true, 'Please provide Patient ID'],
        },
        username: {
          type: String,
          required: [true, 'Please provide Patient name'],
        },
       
      },
  },
  
  createdBy: userReferenceSchema,  
}, 
{
  timestamps: true,
  strictPopulate: false,
});

const History = mongoose.models.History || mongoose.model('History', HistorySchema);

export default History;
