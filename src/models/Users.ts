import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Use import instead of require
import jwt from 'jsonwebtoken'; // Use import instead of require

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    minlength: 3,
    maxlength: 50, // Fixed typo from "maxkength"
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', "nurse",'reception',"Laboratory" , "Ultrasound"],
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
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to generate JWT
userSchema.methods.createJWT = function () {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(
    { userId: this._id, username: this.username, role: this.role },
    secret,
    { expiresIn: process.env.JWT_LIFETIME || "1d" }
  );
};


userSchema.methods.comparePassword = async function (candidatePassword: string) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
