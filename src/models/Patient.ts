import mongoose from "mongoose";
import userReferenceSchema from "./userReferenceSchema";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
// Define the schemas
const patientSchema = new mongoose.Schema({
    cardno: {
      type: String,
      required: [true, "Please provide a card number"],
      unique: true,
    },
    firstname: {
      type: String,
      required: [true, "Please provide a firstname"],
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      minlength: 6,
    },
    isbrace: {
      type: Boolean,
      default: false,
    },
    age: {
      type: String,
      required: [true, "Please provide an age"],
    },
    sex: {
      type: String,
      enum: ['male', 'female', 'none'],
      required: [true, "Please provide a sex"],
    },
    phoneNumber: {
      type: String,
    },
    Town: {
      type: String,
    },
    KK: {
      type: String,
    }, 
    HNo: {
      type: String,
    },
    Woreda: {
      type: String,
    }, 
    Region: {
      type: String,
    },
    description: {
      type: String,
    },
    disablity: {
      type: Boolean,
      default: false,
    },
    HomePhone: {
      type: String,
    },
    Address: {
      type: String,
    },
    Email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    EmergencyContactPhone: {
      type: String,
    },
    FinancialResponsible: {
      type: String,
      enum: ["Self", "ParentGuardian"],
      default: "Self",
    },
    ParentGuardianInfo: {
      FullName: { type: String },
      Relationship: { type: String },
      MobilePhone: { type: String },
    },
    DOB: { type: Number },
    createdBy: userReferenceSchema,
    credit: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
    type: String,
    select: false // Don't return by default
},
refreshTokenExpiresAt: {
    type: Date,
    select: false
},
    finish: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      enum: ["green", "white", "blue", "pink"],
      default: "white"
    },
    Locked: {
      type: Boolean,
      default: false,
    },
    // Add to patientSchema
isEmailVerified: {
    type: Boolean,
    default: false
},
emailVerifiedAt: {
    type: Date
},
verificationCode: {
    type: String,
    select: false
},
verificationCodeExpiresAt: {
    type: Date,
    select: false
},
    Order: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    MedicalFinding: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicalFinding",
      },
    ],
    Healthinfo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Healthinfo",
      },
    ],
    Appointment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    Image: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    Invoice: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
      },
    ],
    Card: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
    Credit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Credit",
      },
    ], 
    Orgnazation: [ 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orgnazation",
      },
    ], 
    Prescription: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prescription",
      },
    ],
    TreatmentPlan: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TreatmentPlan",
      },
    ], 
    Consent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consent",
      },
    ],
    Orthodontics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orthodontics",
      },
    ],
    ReferalCertificate: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReferalCertificate",
      },
    ],
    FNA: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FNA",
      },
    ],
    MedicalCertificate: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicalCertificate",
      },
    ],
    Note: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],
    NoteConPat: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NoteConPat",
      },
    ], 
    DentalChart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DentalChart",
      },
    ],
    SampleTwo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SampleTwo",
      },
    ],
    Perfo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Perfo",
      },
    ],
    DentalLabForm: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DentalLabForm",
      },
    ],
  }, {
    timestamps: true,
    strictPopulate: false
  });
patientSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create JWT method (short-lived access token)
patientSchema.methods.createJWT = function(): string {
    return jwt.sign(
        {
            userId: this._id,
            email: this.Email,
            firstname: this.firstname,
            role: 'patient',
            type: 'access'
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );
};

// Create refresh token method
patientSchema.methods.createRefreshToken = function(): string {
    // Generate a secure random token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    return refreshToken;
};

// Pre-save middleware to hash password
patientSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        if (this.password && typeof this.password === 'string') {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error: any) {
        next(error);
    }
});

// Pre-findOneAndUpdate middleware for updates
patientSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate() as any;
    
    if (update.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            if (typeof update.password === 'string') {
                update.password = await bcrypt.hash(update.password, salt);
            }
        } catch (error: any) {
            return next(error);
        }
    }
    next();
});

const Patient = mongoose.models.Patient || mongoose.model("Patient", patientSchema);

export default Patient;