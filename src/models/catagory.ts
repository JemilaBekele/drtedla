import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  Imaging:{
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;
//91 upper  rec
//99 ultra
//97 lab
//91  admin
//94 doctor