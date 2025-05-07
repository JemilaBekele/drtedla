import mongoose, { Schema } from 'mongoose';
import userReferenceSchema from '../helpers/userReferenceSchema';

// Payment Transaction Schema
const PaymentTransactionSchema = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  receivedBy: { type: userReferenceSchema }
});

// Main Payment Schema
const PaymentSchema = new Schema({
  labTest: { 
    type: Schema.Types.ObjectId, 
    ref: 'LabTest',
  },
  ultraTest: { 
    type: Schema.Types.ObjectId, 
    ref: 'UltraTest',  // Correct reference to UltraTest model
  },
  customerName:{
    type: Schema.Types.ObjectId, 
    ref: 'Patient', 
  },
 OrderBy :{
    type: Schema.Types.ObjectId, 
    ref: 'User', 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  amountPaid: { 
    type: Number, 
    default: 0,
    min: 0
  },
  amountDue: { 
    type: Number, 
    default: function(this: any) { 
      return this.totalAmount - this.amountPaid; 
    },
    min: 0
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'paid'], 
    default: 'pending' 
  },
  order: { 
    type: Number, 
    default: 1 
  },
  paymentHistory: [PaymentTransactionSchema],
  createdBy: { type: userReferenceSchema, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to calculate total amount before saving
PaymentSchema.pre('save', async function(next) {
  if (this.isNew) {
    let total = 0;

    if (this.labTest) {
      const labTest = await mongoose.model('LabTest').findById(this.labTest)
        .populate('sections.tests');

      labTest?.sections.forEach((section: { tests: any[] }) => {
        section.tests.forEach(test => {
          total += test.price || 0;
        });
      });
    }

    if (this.ultraTest) {
      const ultraTest = await mongoose.model('UltraTest').findById(this.ultraTest);

      ultraTest?.tests.forEach((test: { price: any; }) => {
        total += test.price || 0;
      });
    }

    this.totalAmount = total;
    this.amountDue = total - this.amountPaid;
  }
  next();
});

// Update amountDue and status when amountPaid changes
PaymentSchema.pre('save', async function(next) {
  if (this.amountPaid >= this.totalAmount) {
    this.status = 'paid';
  } else {
    this.status = 'pending';
  }
  this.amountDue = this.totalAmount - this.amountPaid;
  next();
});

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;
