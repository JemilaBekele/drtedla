import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Appointment from '../../models/appointment';
import Patient from '../../models/Patient';
import User from '../../models/Users';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role:string;
  };
}

// Create a new appointment
const createAppointment = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const { appointmentDate, appointmentTime, reasonForVisit, status, doctorId } = req.body;

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  if (!appointmentDate || !appointmentTime || !status) {
    throw new BadRequestError('Missing required fields');
  }

  // Find the patient by ID
  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Determine doctor ID based on user role
  let assignedDoctorId: mongoose.Types.ObjectId | undefined;
  
  if (req.user?.role === 'doctor') {
    // If user is a doctor, use their own ID
    assignedDoctorId = new mongoose.Types.ObjectId(req.user.userId);
  } else if (doctorId) {
    // For non-doctors, doctorId must be provided in request body
    assignedDoctorId = new mongoose.Types.ObjectId(doctorId);
    
    // Verify the doctor exists
    const doctorExists = await User.findById(doctorId).exec();
    if (!doctorExists || doctorExists.role !== 'doctor') {
      throw new BadRequestError('Invalid doctor ID provided');
    }
  } else {
    throw new BadRequestError('Doctor ID is required for non-doctor users');
  }

  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  // Create a new Appointment
  const newAppointment = new Appointment({
    appointmentDate,
    appointmentTime,
    reasonForVisit,
    status,
    patientId: patient._id, // Simplified from { id: patient._id }
    doctorId: assignedDoctorId,
    createdBy,
  });

  const savedAppointment = await newAppointment.save();

  // Link the appointment to the patient
  patient.Appointment = patient.Appointment || [];
  patient.Appointment.push(savedAppointment._id);
  await patient.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Appointment created successfully',
    success: true,
    data: savedAppointment,
  });
});

// Get all appointments for a patient
const getAppointments = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  // Find the patient by ID and populate the Appointment field
  const patient = await Patient.findById(id).populate('Appointment').exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.Appointment || patient.Appointment.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No Appointment available for this patient',
      data: [],
    });
    return;
  }

  // Sort the appointments by `createdAt` in descending order
  const sortedAppointments = patient.Appointment.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.status(StatusCodes.OK).json({
    message: 'Appointments retrieved successfully',
    success: true,
    data: sortedAppointments,
  });
});






// Get a specific appointment by patientId and recordId
const getAppointment = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { patientId, recordId } = req.params;

  // Validate required fields
  if (!patientId || !recordId) {
    throw new BadRequestError('Patient ID and Appointment ID are required');
  }

  // Find the patient by ID
  const patient = await Patient.findById(patientId).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Find the appointment by ID
  const appointment = await Appointment.findById(recordId).exec();
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Appointment retrieved successfully',
    success: true,
    data: appointment,
  });
});

// Update a specific appointment
const updateAppointment = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { appointmentId, ...data } = req.body;

  // Validate required fields
  if (!appointmentId) {
    throw new BadRequestError('Appointment ID is required');
  }

  // Find and update the appointment by ID
  const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, data, { new: true }).exec();
  if (!updatedAppointment) {
    throw new NotFoundError('Appointment not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Appointment updated successfully',
    success: true,
    data: updatedAppointment,
  });
});

// Delete a specific appointment
const deleteAppointment = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { appointmentId } = req.body;

  // Validate required fields
  if (!appointmentId) {
    throw new BadRequestError('Appointment ID is required');
  }

  // Find and delete the appointment by ID
  const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId).exec();
  if (!deletedAppointment) {
    throw new NotFoundError('Appointment not found');
  }

  // Remove the appointment reference from the associated patient's record
  const patient = await Patient.findOneAndUpdate(
    { Appointment: appointmentId }, // Find the patient with this appointment ID
    { $pull: { Appointment: appointmentId } }, // Remove the appointment ID from the array
    { new: true } // Return the updated patient document
  );

  if (!patient) {
    console.warn(`No patient found with Appointment ID: ${appointmentId}`);
  }

  res.status(StatusCodes.OK).json({
    message: 'Appointment deleted successfully and reference removed from patient',
    success: true,
  });
});







export { createAppointment, getAppointments, getAppointment, updateAppointment, deleteAppointment };
