import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Appointment from '../../models/appointment';

const getTodayAppointments = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today

    // Log today's date range (optional for debugging)
    console.log('Start of Day:', startOfDay);
    console.log('End of Day:', endOfDay);

    // Find all scheduled appointments for today
    const todayAppointments = await Appointment.find({
      appointmentDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
      status: 'Scheduled', // Filter for 'Scheduled' status
    })
      .populate('patientId.id') // Populate nested patient reference
      .exec();

    // Check if any appointments were found
    if (!todayAppointments || todayAppointments.length === 0) {
      res.status(StatusCodes.OK).json({
        message: 'No scheduled appointments for today',
        data: [],
      });
      return; // Ensure the function exits after responding
    }

    // Return today's scheduled appointments
    res.status(StatusCodes.OK).json({
      message: "Today's scheduled appointments retrieved successfully",
      success: true,
      data: todayAppointments,
    });
  } catch (error) {
    console.error("Error retrieving today's appointments:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
    });
  }
});

export { getTodayAppointments };
