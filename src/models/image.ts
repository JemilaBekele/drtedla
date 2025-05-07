import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: false, // Optional: set to true if you want to require an image
        default: null, // Default value if no image is provided
      },
   
  patientId: {

      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
    
  },
}, { timestamps: true });

// Avoid model recompilation during hot reloads
const Image = mongoose.models.Image || mongoose.model('Image', ImageSchema);

export default Image;

