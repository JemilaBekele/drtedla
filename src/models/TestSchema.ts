import mongoose, { Schema } from 'mongoose';

const TestConfigSchema = new Schema({
  name: { type: String, required: true, unique: true }, // Test name (unique)
  unit: { type: String, required: true }, // Unit assigned by admin
  referenceRange: { type: String, required: true }, // Reference range assigned by admin (e.g., "10-20")
});

const TestConfig = mongoose.model('TestConfig', TestConfigSchema);

export default TestConfig;
