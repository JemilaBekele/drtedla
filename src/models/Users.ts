import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    minlength: 3,
    maxlength: 50,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'reception','User', 'Locked','nurse','inventory','labratory'], // Example roles
    required: [true, "Please provide a role"],
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
  },
  image: {
    type: String,
    required: false, // Optional: set to true if you want to require an image
    default: null, // Default value if no image is provided
  },
  deadlinetime: {
    type: Date,
    required: false, // Set to true if you want it mandatory
    default: null,   // Or new Date() if you want to auto-fill
  },
  lock:{
     type: Boolean,
    default: false,
  },
   experience: {
    type: Number, // years of experience
    required: false,
    default: null,
  },
  position: {
    type: String, // job title, e.g. "Senior Nurse"
    required: false,
    default: null,
  },
  refreshToken: {
    type: String,
    select: false, // Don't return by default in queries
  },
  refreshTokenExpiresAt: {
    type: Date,
    select: false,
  },
}, {
  timestamps: true,
});


// Middleware to ensure only one 'Locked' role user exists
userSchema.pre("save", async function (next) {
  if (this.role === 'Locked') {
    const existingLockedUser = await mongoose.models.User.findOne({ role: 'Locked' });
    if (existingLockedUser && existingLockedUser._id.toString() !== this._id.toString()) {
      const error = new Error("Only one user with role 'Locked' is allowed.");
      error.name = "ValidationError";
      return next(error);
    }
  }
  next();
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare candidate password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create short-lived JWT access token
userSchema.methods.createJWT = function (): string {
  return jwt.sign(
    {
      userId: this._id,
      username: this.username,
      role: this.role,
      type: "access",
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );
};

// Create opaque refresh token
userSchema.methods.createRefreshToken = function (): string {
  return crypto.randomBytes(40).toString("hex");
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
