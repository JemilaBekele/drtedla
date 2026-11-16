import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Appointment from '../../models/appointment';
import Patient from '../../models/Patient';
import User from '../../models/Users';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import mongoose from 'mongoose';

// Start/end (UTC) of the calendar day of a date, e.g. "2026-11-20" -> [2026-11-20T00:00Z, 2026-11-21T00:00Z)
const getDayRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
};

// Id of the logged-in patient (set by authPatient middleware)
const getAuthPatientId = (req: Request): string | undefined => (req as any).patient?.patientId;

const sendForbidden = (res: Response): void => {
  res.status(StatusCodes.FORBIDDEN).json({
    success: false,
    message: 'You can only access your own appointments',
  });
};

// True if the doctor already has a Scheduled appointment at that day/time (optionally ignoring one appointment)
const isSlotTaken = async (doctorId: any, date: Date, appointmentTime: string, excludeId?: any): Promise<boolean> => {
  const { start, end } = getDayRange(date);
  const filter: any = {
    'doctorId.id': doctorId,
    appointmentDate: { $gte: start, $lt: end },
    appointmentTime,
    status: 'Scheduled',
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return !!(await Appointment.exists(filter));
};

// Create a new appointment
const createAppointment = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { patientId } = req.params; // Patient ID from URL params
  const { appointmentDate, appointmentTime, reasonForVisit, doctorId } = req.body;

  // Validate required fields
  if (!patientId) {
    throw new BadRequestError('Patient ID is required');
  }

  if (patientId !== getAuthPatientId(req)) {
    sendForbidden(res);
    return;
  }

  if (!appointmentDate || !appointmentTime) {
    throw new BadRequestError('Missing required fields: appointmentDate and appointmentTime are required');
  }

  const parsedDate = new Date(appointmentDate);
  if (isNaN(parsedDate.getTime())) {
    throw new BadRequestError('Invalid appointmentDate. Use the format YYYY-MM-DD');
  }
  if (getDayRange(parsedDate).start.getTime() < getDayRange(new Date()).start.getTime()) {
    throw new BadRequestError('Appointment date cannot be in the past');
  }

  // Find the patient by ID
  const patient = await Patient.findById(patientId).exec();
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

  // Prevent double booking: same doctor, same day, same time
  if (await isSlotTaken(doctorInfo.id, parsedDate, appointmentTime)) {
    res.status(StatusCodes.CONFLICT).json({
      success: false,
      message: 'This time slot is already booked. Please choose another time.',
    });
    return;
  }

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
  const { patientId } = req.params; // Patient ID from URL params

  // Validate required fields
  if (!patientId) {
    throw new BadRequestError('Patient ID is required');
  }

  if (patientId !== getAuthPatientId(req)) {
    sendForbidden(res);
    return;
  }

  // Find all appointments for this patient using the new schema structure
  const appointments = await Appointment.find({ 'patientId.id': patientId })
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
  const { appointmentId } = req.params; // Appointment ID from URL params

  // Validate required fields
  if (!appointmentId) {
    throw new BadRequestError('Appointment ID is required');
  }

  // Find the appointment by ID directly from Appointment model
  const appointment = await Appointment.findById(appointmentId).exec();
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  if (appointment.patientId?.id?.toString() !== getAuthPatientId(req)) {
    sendForbidden(res);
    return;
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

  const existing = await Appointment.findById(appointmentId).exec();
  if (!existing) {
    throw new NotFoundError('Appointment not found');
  }

  if (existing.patientId?.id?.toString() !== getAuthPatientId(req)) {
    sendForbidden(res);
    return;
  }

  // Patients can only cancel; Completed is set by the clinic
  if (updateData.status !== undefined && updateData.status !== 'Cancelled') {
    throw new BadRequestError('You can only change status to Cancelled');
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

  // Rescheduling (new date, time or doctor): validate and prevent double booking
  const changesSlot = ['appointmentDate', 'appointmentTime', 'doctorId'].some((k) => k in filteredUpdateData);
  const finalStatus = filteredUpdateData.status ?? existing.status;
  if (changesSlot && finalStatus === 'Scheduled') {
    const finalDate = new Date(filteredUpdateData.appointmentDate ?? existing.appointmentDate);
    const finalTime = filteredUpdateData.appointmentTime ?? existing.appointmentTime;
    const finalDoctorId = filteredUpdateData.doctorId?.id ?? existing.doctorId?.id;

    if (isNaN(finalDate.getTime())) {
      throw new BadRequestError('Invalid appointmentDate. Use the format YYYY-MM-DD');
    }
    if (getDayRange(finalDate).start.getTime() < getDayRange(new Date()).start.getTime()) {
      throw new BadRequestError('Appointment date cannot be in the past');
    }
    if (await isSlotTaken(finalDoctorId, finalDate, finalTime, existing._id)) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.',
      });
      return;
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



// Get the clinic's upcoming booked times (no patient information)
const getAppointmentsschejule = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  // All upcoming scheduled appointments, but only date/time/doctor - patient details are confidential
  const appointmentDocs = await Appointment.find({
    status: 'Scheduled',
    appointmentDate: { $gte: getDayRange(new Date()).start },
  })
    .sort({ appointmentDate: 1, appointmentTime: 1 }) // Sort by date and time ascending
    .select('appointmentDate appointmentTime appointmentEndTime doctorId')
    .exec();

  const appointments = appointmentDocs.map((a: any) => ({
    appointmentDate: a.appointmentDate,
    appointmentTime: a.appointmentTime,
    appointmentEndTime: a.appointmentEndTime || null,
    doctorId: a.doctorId?.id,
    doctorName: a.doctorId?.username,
  }));

  if (appointments.length === 0) {
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

// Get booked time slots for a day (optionally for one doctor) so the frontend can hide them
const getBookedSlots = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { date, doctorId } = req.query;

  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestError('date query parameter is required in the format YYYY-MM-DD');
  }
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new BadRequestError('Invalid date');
  }

  const { start, end } = getDayRange(parsedDate);
  const filter: any = {
    appointmentDate: { $gte: start, $lt: end },
    status: 'Scheduled',
  };

  if (doctorId) {
    if (typeof doctorId !== 'string' || !mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestError('Invalid doctorId');
    }
    filter['doctorId.id'] = new mongoose.Types.ObjectId(doctorId);
  }

  // Only return slot info - never other patients' details
  const appointments = await Appointment.find(filter)
    .select('appointmentDate appointmentTime appointmentEndTime doctorId')
    .sort({ appointmentTime: 1 })
    .exec();

  const bookedSlots = appointments.map((a: any) => ({
    appointmentTime: a.appointmentTime,
    appointmentEndTime: a.appointmentEndTime || null,
    doctorId: a.doctorId?.id,
    doctorName: a.doctorId?.username,
  }));

  res.status(StatusCodes.OK).json({
    message: 'Booked slots retrieved successfully',
    success: true,
    date,
    data: bookedSlots,
    count: bookedSlots.length,
  });
});

export { createAppointment, getAppointments, getAppointment, updateAppointment, getAppointmentsschejule, getBookedSlots };
