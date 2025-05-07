import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Appointment from '../../models/appointment';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

interface AuthenticatedRequest extends Request {
    user?: {
      userId: string;
      username: string;
    };
  }
  

const getDoctorAppointments = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user; // Assuming middleware attaches the user object
  if (!user) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  const appointments = await Appointment.find({
    status: 'Scheduled',
    'doctorId': user.userId,
  })
    .populate('patientId').populate({path: 'doctorId',
      select: 'username', // Include disease name and exclude _id
      model: 'User'})
    .sort({ appointmentDate: 1 })
    .exec();

  if (!appointments.length) {
    throw new NotFoundError('No scheduled appointments found.');
  }
console.log(appointments)
  res.status(StatusCodes.OK).json({
    message: 'Scheduled appointments retrieved successfully',
    success: true,
    data: appointments,
  });
});



const filterAppointmentsByDate = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { startDate } = req.body;
  
    if (!startDate) {
      throw new BadRequestError('Start date is required.');
    }
  
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      throw new BadRequestError('Invalid date format.');
    }
  
    const startOfDay = new Date(startDateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(startDateObj.setHours(23, 59, 59, 999));
  
    const appointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lt: endOfDay },
      status: 'Scheduled',
    })
      .populate('patientId').populate({path: 'doctorId',
        select: 'username', // Include disease name and exclude _id
        model: 'User'})
      .exec();
  
    res.status(StatusCodes.OK).json({
      message: 'Appointments retrieved successfully',
      success: true,
      data: appointments,
    });
  });
//reception
const Appointments = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
 
  const appointments = await Appointment.find({
 
    status: 'Scheduled',
  })
    .populate('patientId').populate({path: 'doctorId',
      select: 'username', // Include disease name and exclude _id
      model: 'User'})
    .exec();
console.log(appointments)
  res.status(StatusCodes.OK).json({
    message: 'Appointments retrieved successfully',
    success: true,
    data: appointments,
  });
});

const filterAppointmentsByDoctorAndDate = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  const { startDate } = req.body;

  if (!startDate) {
    throw new BadRequestError('Start date is required.');
  }

  // Validate and parse startDate
  const startDateObj = new Date(startDate);
  if (isNaN(startDateObj.getTime())) {
    throw new BadRequestError(`Invalid date format. Received: ${startDate}`);
  }

  const startOfDay = new Date(startDateObj.setHours(0, 0, 0, 0));
  const endOfDay = new Date(startDateObj.setHours(23, 59, 59, 999));

  console.log('Start of Day:', startOfDay);
  console.log('End of Day:', endOfDay);

  const appointments = await Appointment.find({
    appointmentDate: { $gte: startOfDay, $lt: endOfDay },
    status: 'Scheduled',
    'doctorId': user.userId,
  })
    .populate('patientId').populate({path: 'doctorId',
      select: 'username', // Include disease name and exclude _id
      model: 'User'})
    .exec();

  res.status(StatusCodes.OK).json({
    message: 'Appointments retrieved successfully',
    success: true,
    data: appointments,
  });
});





  

const getTodayAppointments = asyncWrapper(async (req: Request, res: Response): Promise<void> => {

  try {
    await Patient.find({});
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lt: endOfDay },
      status: "Scheduled",
    })  .populate({
      path: "patientId",
      select: "firstname phoneNumber", // Select only the fields needed
    }).populate({path: 'doctorId',
      select: 'username', // Include disease name and exclude _id
      model: 'User'})
 
      .exec();

     
  console.log("populatedAppointments",appointments)
    res.status(StatusCodes.OK).json({
      message: "Today's appointments retrieved successfully",
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error("Error retrieving today's appointments:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to retrieve today's appointments.",
      success: false,
    });
  }
});



  const getTodayDocAppointments = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = req.user;
  
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    }
  
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
    // Log the values of date range and user ID
    console.log('Start of Day:', startOfDay);
    console.log('End of Day:', endOfDay);
    console.log('User ID:', user.userId);
  
    try {
      const appointments = await Appointment.find({
        appointmentDate: { $gte: startOfDay, $lt: endOfDay },
        status: 'Scheduled',
        'doctorId': user.userId,
      }).populate({path: 'doctorId',
        select: 'username', // Include disease name and exclude _id
        model: 'User'}).exec();
      
      appointments.forEach(appointment => {
        console.log('Appointment Date:', appointment.appointmentDate);
      });
      
  
      console.log('Raw Appointments:', appointments); // Log raw data before populating
  
      // Populate and return the response
      const populatedAppointments = await Appointment.populate(appointments, {
        path: 'patientId',
      })
  
      console.log('Populated Appointments:', populatedAppointments);
  
      res.status(StatusCodes.OK).json({
        message: "Today's appointments retrieved successfully",
        success: true,
        data: populatedAppointments,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  });
  
  
 
  

 
  
export {getTodayDocAppointments, Appointments,getDoctorAppointments,filterAppointmentsByDate,filterAppointmentsByDoctorAndDate ,getTodayAppointments};
