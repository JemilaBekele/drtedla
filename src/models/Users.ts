import mongoose from "mongoose";


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

const User = mongoose.models.User || mongoose.model("User", userSchema);



export default User;
