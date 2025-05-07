// models/LabTest.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface LabTestItem extends Document {
    _id:string;
  name: string;
  selectedForLab: boolean;
  isResult: boolean;
  result: string;
  unit: string;
  referenceRange: string;
  Remark: string;
  price: number;
 
}

export interface LabTestSection extends Document {
  section: string;
  tests: LabTestItem[];
}

export interface LabTestDocument extends Document {
  sections: LabTestSection[];
  
  status: string;
  comments: string;
  confirm: boolean;
  reviewedBy: Schema.Types.ObjectId;
  createdBy: any; // Replace with the correct type
  changeHistory: any[]; // Replace with the correct type
}

const LabTestSchema = new Schema<LabTestDocument>({
  // Schema definition
});


export interface InvoiceItem extends Document {
  service: {
    id: Schema.Types.ObjectId;
    service: string;
  };
  description: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Invoice extends Document {
  items: InvoiceItem[];
  invoiceDate: Date;
  customerName: {
    id: Schema.Types.ObjectId;
  };
  totalAmount: number;
  totalpaid: number;
  balance: number;
  currentpayment: {
    amount: number;
    date: Date;
    confirm: boolean;
    receipt: boolean;
  };
  status: string;
  createdBy: any; // Replace with the correct type
}


export interface UltraTestItem extends Document {
    _id:mongoose.Types.ObjectId;
    name: string;
    result: string;
    price: number;
    images: string;
  }
 
  export interface UltraTestDocument extends Document {
    patient: {
        type: mongoose.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide Patient ID'],
      },
      status: {
        type: String,
        required: [true, 'Please provide a status'],
        enum: ['Pending', 'Cancel', 'Finish', 'Order'],
      },
      comments: { type: String, default: null },
      confirm: { type: Boolean, default: false },
    
      tests: [UltraTestItem], // Embedding multiple tests inside UltraTest
    
      createdBy: [ id: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
          required: [true, 'Please provide user'],
        },
        username: {
          type: String,
          required: [true, 'Please provide sender name'],
        },] // Replace with the correct type
  changeHistory: [ id: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user'],
  },
  username: {
    type: String,
    required: [true, 'Please provide sender name'],
  },]
  }
  
  const UltraTestSchema = new Schema<UltraTestDocument>({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    // Other fields
  });

