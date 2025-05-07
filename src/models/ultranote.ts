import mongoose from "mongoose";
const UltranoteSchema = new mongoose.Schema({

  note: {
    type: String,
   
  },
  noteA: {
    type: String,
 
  },
  noteB: {
    type: String,
 
  },
  noteC: {
    type: String,
 
  },
  noteD: {
    type: String,
 
  },
  noteF: {
    type: String,
 
  },

 Ultra: {
      type: mongoose.Types.ObjectId,
      ref: 'UltraTest',
      required: [true, 'Please provide ultra ID']
  
  },
}, 
{
  timestamps: true,
  strictPopulate: false,
});

const Ultranote = mongoose.models.Ultranote || mongoose.model('Ultranote', UltranoteSchema);

export default Ultranote;