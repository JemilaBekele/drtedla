import mongoose, { Schema } from 'mongoose';
import userReferenceSchema from '../helpers/userReferenceSchema';


// Enum for valid section names
const SectionTypes = [
    "Chemistry", "Hematology", "Electrolyte", "Hormone",
    "Rarasitology", "Microbiology", "Serology", "Urinalysis",""
  ];

  
// Define pricing schema
const TestPricingSchema = new Schema({
  section: { type: String, enum: SectionTypes, required: true }, // Section category
  testPrices: [
    {
      testName: { type: String }, // Name of the test
      price: { type: Number}, 
      unit: { type: String, default: null }, // Unit of measurement (e.g., mg/dL, mmol/L)
      referenceRange: { type: String, default: null },
      // Price for the test
    }
  ],
  defaultSectionPrice: { type: Number, default: null }, // Default price for all tests in a section (optional)
  createdBy: { type: userReferenceSchema, required: true }, // Admin who updated the prices
  updatedAt: { type: Date, default: Date.now }
});

// Create Mongoose Model
const TestPricing = mongoose.model('TestPricing', TestPricingSchema);

export default TestPricing;
