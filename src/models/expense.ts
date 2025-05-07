import mongoose from "mongoose";
import userReferenceSchema from "../helpers/userReferenceSchema";


const ExpenseSchema = new mongoose.Schema({
 
  description: {
        type: String,
        required: true,
        
      },   
  
  amount: {
    type: Number,
    required: true,
     
      },

  createdBy: userReferenceSchema,

}, 
{
  timestamps: true,
  strictPopulate: false,
});

const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

export default Expense;

