import mongoose from 'mongoose';
import userReferenceSchema from '../../helpers/userReferenceSchema';



const ROSSchema = new mongoose.Schema({
  
  Constitutional: {
    type: String,
  },
  HeedEyesEarNoseThroat: {
    type: String,
  },
  Throat:{
    type: String
  },
  Respiratory: {
    type: String,
  },
  Gastrointestinal: {
    type: String,
  },
  Museuloskeletal: {
    type: String,
  },
  Integumentart: {
    type: String,
  },
  Neurologic: {
    type: String,
  },
  HematologyLymphatic: {
    type: String,
  },
  Psychiatric: {
    type: String,
  },
  Allergic:{type:String,},
  patientId: {
    id: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
    }
    
  },
  createdBy: userReferenceSchema,
}, { timestamps: true });

const ROS = mongoose.models.ROS || mongoose.model('ROS', ROSSchema);

export default ROS;