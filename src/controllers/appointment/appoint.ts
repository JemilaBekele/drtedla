import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Appointment from '../../models/appointment';
import Patient from '../../models/Patient';
import User from '../../models/Users';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import mongoose from 'mongoose';



// Create a new appointment
// Create a new appointment
const createAppointment = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const { appointmentDate, appointmentTime, reasonForVisit, doctorId } = req.body;

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  if (!appointmentDate || !appointmentTime) {
    throw new BadRequestError('Missing required fields: appointmentDate and appointmentTime are required');
  }

  // Find the patient by ID
  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Validate doctorId is provided
  if (!doctorId) {
    throw new BadRequestError('Doctor ID is required');
  }

  // Determine doctor information
  let doctorInfo;

  // For non-doctors, doctorId must be provided in request body
  const doctorExists = await User.findById(doctorId).exec();
  if (!doctorExists || doctorExists.role !== 'doctor') {
    throw new BadRequestError('Invalid doctor ID provided');
  }
  doctorInfo = {
    id: new mongoose.Types.ObjectId(doctorId),
    username: doctorExists.username,
  };

  // Determine createdBy - randomly select a user with role 'User' from User model
  let createdBy;

  // Find users with role 'User' and not locked
  const availableUsers = await User.find({ 
    role: 'User',
    lock: false // Only non-locked users
  });
  
  if (availableUsers.length === 0) {
    // Fallback: get any unlocked user if no 'User' role exists
    const anyUser = await User.findOne({ lock: false });
    if (anyUser) {
      createdBy = {
        id: anyUser._id,
        username: anyUser.username,
      };
    } else {
      // Ultimate fallback - system user
      createdBy = {
        id: 'system',
        username: 'system',
      };
    }
  } else {
    // Select random user from available 'User' role users
    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    const randomUser = availableUsers[randomIndex];
    createdBy = {
      id: randomUser._id,
      username: randomUser.username,
    };
  }

  // Prepare patient info for the appointment
  const patientInfo = {
    id: patient._id,
    username: patient.firstname, // Using firstname as username for patient
    cardno: patient.cardno,
  };

  // Create a new Appointment with default status 'Scheduled'
  const newAppointment = new Appointment({
    appointmentDate,
    appointmentTime,
    reasonForVisit: reasonForVisit || '', // Optional field
    status: 'Scheduled', // Default status
    doctorId: doctorInfo,
    patientId: patientInfo,
    createdBy,
  });

  const savedAppointment = await newAppointment.save();

  // Link the appointment to the patient
  patient.Appointment = patient.Appointment || [];
  patient.Appointment.push(savedAppointment._id);
  await patient.save();

  // Remove createdBy from the response
  const appointmentResponse = savedAppointment.toObject();
  delete appointmentResponse.createdBy;

  res.status(StatusCodes.CREATED).json({
    message: 'Appointment created successfully',
    success: true,
    data: appointmentResponse,
  });
});

// Get all appointments for a patient
// Get all appointments for a patient
const getAppointments = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params

  // Validate required fields
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  // Find all appointments for this patient using the new schema structure
  const appointments = await Appointment.find({ 'patientId.id': id })
    .sort({ createdAt: -1 }) // Sort by newest first
    .exec();
  
  if (!appointments || appointments.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No appointments available for this patient',
      success: true,
      data: [],
      count: 0,
    });
    return;
  }

  res.status(StatusCodes.OK).json({
    message: 'Appointments retrieved successfully',
    success: true,
    data: appointments,
    count: appointments.length,
  });
});

// Get a specific appointment by ID
const getAppointment = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { recordId } = req.params; // Appointment ID from URL params

  // Validate required fields
  if (!recordId) {
    throw new BadRequestError('Appointment ID is required');
  }

  // Find the appointment by ID directly from Appointment model
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
const updateAppointment = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { appointmentId } = req.params; // Get appointmentId from URL params
  const updateData = req.body;

  // Validate required fields
  if (!appointmentId) {
    throw new BadRequestError('Appointment ID is required');
  }

  // Allowed updates including doctorId
  const allowedUpdates = ['appointmentDate', 'appointmentTime', 'reasonForVisit', 'status', 'doctorId'];
  const filteredUpdateData: any = {};
  
  for (const key of Object.keys(updateData)) {
    if (allowedUpdates.includes(key)) {
      // Handle doctorId update specially
      if (key === 'doctorId') {
        // Check if doctorId is provided as a string (ID only) or as an object
        if (typeof updateData.doctorId === 'string') {
          // Fetch doctor details from User model
          const doctorExists = await User.findById(updateData.doctorId).exec();
          if (!doctorExists || doctorExists.role !== 'doctor') {
            throw new BadRequestError('Invalid doctor ID provided');
          }
          filteredUpdateData.doctorId = {
            id: doctorExists._id,
            username: doctorExists.username,
          };
        } else if (typeof updateData.doctorId === 'object' && updateData.doctorId.id) {
          // If doctorId is provided as an object with id
          const doctorExists = await User.findById(updateData.doctorId.id).exec();
          if (!doctorExists || doctorExists.role !== 'doctor') {
            throw new BadRequestError('Invalid doctor ID provided');
          }
          filteredUpdateData.doctorId = {
            id: doctorExists._id,
            username: doctorExists.username,
          };
        } else {
          throw new BadRequestError('Invalid doctor ID format');
        }
      } else {
        filteredUpdateData[key] = updateData[key];
      }
    }
  }

  // Find and update the appointment by ID
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    appointmentId, 
    filteredUpdateData, 
    { 
      new: true, // Return the updated document
      runValidators: true // Run schema validations
    }
  ).exec();
  
  if (!updatedAppointment) {
    throw new NotFoundError('Appointment not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Appointment updated successfully',
    success: true,
    data: updatedAppointment,
  });
});



// Get all scheduled appointments
const getAppointmentsschejule = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  // Find all appointments and populate patient and doctor info
  const appointments = await Appointment.find({ status: 'Scheduled' })
    .sort({ appointmentDate: 1, appointmentTime: 1 }) // Sort by date and time ascending
    .select('-createdBy') // Exclude createdBy field from the query
    .exec();
  
  if (!appointments || appointments.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No scheduled appointments available',
      success: true,
      data: [],
      count: 0,
    });
    return;
  }

  res.status(StatusCodes.OK).json({
    message: 'Appointments retrieved successfully',
    success: true,
    data: appointments,
    count: appointments.length,
  });
});


export { createAppointment, getAppointments, getAppointment, updateAppointment,getAppointmentsschejule };
