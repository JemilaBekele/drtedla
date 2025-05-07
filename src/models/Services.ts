// models/Service.js
import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
    unique: true,
    set: (v: string) => v.replace(/\s+/g, ''), // removes all spaces
    validate: {
      validator: function (v: string) {
        return !/\s/.test(v); // ensures no whitespace
      },
      message: 'Service name must not contain spaces',
    },
  },
  
  price: {
    type: Number,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

export default Service;