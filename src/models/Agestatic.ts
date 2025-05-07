import mongoose from "mongoose";


const AgeSchema = new mongoose.Schema({
  patient: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
    
  
  },
}, 
{
  timestamps: true,
  strictPopulate: false,
});

const Age = mongoose.models.Age || mongoose.model('Age', AgeSchema);

export default Age;
