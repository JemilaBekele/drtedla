import mongoose from 'mongoose';
import userReferenceSchema from "../helpers/userReferenceSchema";

const AppointmentSchema = new mongoose.Schema({
  appointmentDate: {
    type: Date,
    required: [true, 'Please provide an appointment date'],
  },
  appointmentTime: {
    type: String, // You can also use Number if you want to store time in a specific format like military time
    required: [true, 'Please provide an appointment time'],
  },
  doctorId: {
      type: mongoose.Types.ObjectId,
      ref: 'User', 
    },
  reasonForVisit: {
    type: String,
  },
  status: {
    type: String,
    required: [true, 'Please provide a status'],
    enum: ['Scheduled', 'Completed', 'Cancelled'],
  },
  patientId: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide Patient ID'],
  },
  createdBy: userReferenceSchema,
}, { timestamps: true });

// Avoid model recompilation during hot reloads
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

export default Appointment;