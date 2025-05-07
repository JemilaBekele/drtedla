import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Patient from '../../models/Patient';
import User from '../../models/Users';
import Order from '../../models/Order';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import mongoose from 'mongoose';
import Age from '../../models/Agestatic';


interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create or update an order for a patient
const createOrder = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { patientId, assignedDoctorId, status } = req.body;

  // Validate required fields
  if (!patientId || !assignedDoctorId || !status) {
    throw new BadRequestError('Missing required fields: patientId, assignedDoctorId, and status are required.');
  }

  // Find the patient by ID
  const patient = await Patient.findById(patientId).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Find the assigned doctor by ID
  const assignedDoctor = await User.findById(assignedDoctorId).exec();
  if (!assignedDoctor) {
    throw new NotFoundError('Assigned doctor not found');
  }

  // Check if the patient already has an order
  if (patient.Order && patient.Order.length > 0) {
    const existingOrder = await Order.findById(patient.Order[0]).exec(); // Assuming we update the first order

    if (existingOrder) {
      existingOrder.assignedDoctorTo = {
        id: assignedDoctor._id,
        username: assignedDoctor.username,
      };
      existingOrder.status = status;
      existingOrder.updatedAt = new Date();

      const updatedOrder = await existingOrder.save();

      res.status(StatusCodes.OK).json({
        message: 'Order updated successfully',
        success: true,
        data: updatedOrder,
      });
      return;
    }
  }

  // If no order exists, create a new one
  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  const newOrder = new Order({
    assignedDoctorTo: {
      id: assignedDoctor._id,
      username: assignedDoctor.username,
    },
    patientId: {
      id: patient._id,
    },
    createdBy,
    status,
  });

  const savedOrder = await newOrder.save();

  // Link the new order to the patient
  patient.Order = patient.Order || [];
  patient.Order.push(savedOrder._id);
  await patient.save();

  // ✅ Create Age document
  await new Age({ patient: patient._id }).save();


  res.status(StatusCodes.CREATED).json({
    message: 'Order created successfully',
    success: true,
    data: savedOrder,
  });
});


//order route getActiveOrdersAndPatients
const gerdocorder = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const doctorId = req.user?.userId; // Extract doctor ID from the request (e.g., from middleware)

  if (!doctorId) {
    throw new NotFoundError('Doctor ID not provided or invalid');
  }

  // Fetch active orders for the doctor
  const activeOrders = await Order.find({
    'assignedDoctorTo.id': doctorId,
    status: 'Active',
  })
    .sort({ updatedAt: 1 })
    .populate({
      path: 'patientId.id', // Correctly populate the `id` field inside `patientId`
      model: 'Patient',    // Ensure the `Patient` model is used for population
    })
    .exec();
  

  if (!activeOrders.length) {
    res.status(StatusCodes.OK).json({
      message: 'No active orders found',
      success: true,
      orders: [],
    });
    return;
  }

  const ordersWithPatients = activeOrders.map((order) => ({
    ...order.toObject(),
    patient: order.patientId, // Populated patient details
  }));

  res.status(StatusCodes.OK).json({
    message: 'Active orders retrieved successfully',
    success: true,
    orders: ordersWithPatients,
  });
});


const getDoctors = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    // Find users with the role of 'doctor'
    const doctors = await User.find({ role: { $in: ['doctor', 'nurse'] } }, { username: 1, _id: 1, role: 1 }).exec();
    if (!doctors || doctors.length === 0) {
       res.status(StatusCodes.NOT_FOUND).json({
        message: 'No doctors, nurse  found',
        success: false,
      });
    }

    // Return the list of doctors
    res.status(StatusCodes.OK).json({
      message: 'Doctors fetched successfully',
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
      success: false,
    });
  }
});

const getcretore = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    // Find users with the role of 'doctor'
    const doctors = await User.find({ role: { $in: ['doctor', 'Laboratory','Ultrasound'] } }, { username: 1, _id: 1, role: 1 }).exec();
    if (!doctors || doctors.length === 0) {
       res.status(StatusCodes.NOT_FOUND).json({
        message: 'No doctors, Laboratory  found',
        success: false,
      });
    }

    // Return the list of doctors
    res.status(StatusCodes.OK).json({
      message: 'Doctors fetched successfully',
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
      success: false,
    });
  }
});
const getnurse = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    // Find users with the role of 'doctor'
    const doctors = await User.find({ role: { $in: ['nurse'] } }, { username: 1, _id: 1, role: 1 }).exec();
    if (!doctors || doctors.length === 0) {
       res.status(StatusCodes.NOT_FOUND).json({
        message: 'No doctors, nurse  found',
        success: false,
      });
    }

    // Return the list of doctors
    res.status(StatusCodes.OK).json({
      message: 'Doctors fetched successfully',
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
      success: false,
    });
  }
});


const getpatients = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  try {
    // Fetch active orders
    const activeOrders = await Order.find({ status: 'Active' }).exec();

    if (!activeOrders || activeOrders.length === 0) {
      res.status(StatusCodes.OK).json({
        message: 'No active orders found',
        success: true,
        data: [],
      });
      return;
    }

    // Extract patient IDs from active orders
    const patientIds = activeOrders.map(order => order.patientId.id);

    // Fetch patients based on the extracted IDs and populate their associated orders
    const patients = await Patient.find({ _id: { $in: patientIds } }).populate('Order').exec();

    if (!patients || patients.length === 0) {
      res.status(StatusCodes.OK).json({
        message: 'No patients found for active orders',
        success: true,
        data: [],
      });
      return;
    }

    // Map patients with their associated orders
    const patientsWithOrders = patients.map(patient => ({
      _id: patient._id,
      firstname: patient.firstname,
      cardno: patient.cardno,
      orders: patient.Order, // Return the populated orders from the patient document
    }));

    res.status(StatusCodes.OK).json({
      message: 'Patients with orders retrieved successfully',
      success: true,
      data: patientsWithOrders,
    });
  } catch (error) {
    console.error('Error in fetching active orders and associated patients:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      success: false
    });
  }
});

//active id 

const getOrderById = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Extract order ID from URL params
  
    // Find the order by ID
    const order = await Order.findById(id).exec();
  
    if (!order) {
      throw new NotFoundError('Order not found');
    }
  
    res.status(StatusCodes.OK).json({
      message: 'Order retrieved successfully',
      success: true,
      order,
    });
  });



// Update an order by ID
const updateOrder = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { orderId, status, assignedDoctorTo } = req.body;

  // Validate input
  if (!orderId) {
    throw new BadRequestError('Order ID is required');
  }
  if (!status || !['Active', 'Inactive'].includes(status)) {
    throw new BadRequestError('Valid status is required');
  }
  if (!assignedDoctorTo || !assignedDoctorTo.id) {
    throw new BadRequestError('Valid assigned doctor ID is required');
  }
  if (!assignedDoctorTo.username) {
    throw new BadRequestError('Assigned doctor username is required');
  }

  // Find the existing order by ID
  const existingOrder = await Order.findById(orderId).exec();
  if (!existingOrder) {
    throw new NotFoundError('Order not found');
  }

  // If status is Inactive, delete order and remove from Patient
  if (status === 'Inactive') {
    // Remove the order reference from the patient
    await Patient.updateOne(
      { _id: existingOrder.patientId.id },
      { $pull: { Order: existingOrder._id } }
    ).exec();

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.status(StatusCodes.OK).json({
      message: 'Order deleted and removed from patient because status was set to Inactive',
      success: true,
    });
    return;
  }

  // Update order fields
  existingOrder.status = status;
  existingOrder.assignedDoctorTo = {
    id: assignedDoctorTo.id,
    username: assignedDoctorTo.username,
  };
  existingOrder.updatedAt = new Date();

  // Save the updated order
  const updatedOrder = await existingOrder.save();

  res.status(StatusCodes.OK).json({
    message: 'Order updated successfully',
    success: true,
    updatedOrder,
  });
});


//order patient 
const fetchPatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber, cardno } = req.body;
  
    console.log('Received Body Parameters:', { phoneNumber, cardno });
  
    // Validate input
    if (!phoneNumber && !cardno) {
      throw new BadRequestError('phoneNumber or Card ID is required');
    }
  
    // Build the query based on input
    const query = phoneNumber ? { phoneNumber } : { cardno };
  
    // Fetch the patient from the database
    const patient = await Patient.findOne(query).exec();
  
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
  
    res.status(StatusCodes.OK).json({
      message: 'Patient retrieved successfully',
      success: true,
      patient,
    });
  });


  const getDoc = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    try {
      // Find users with the role of 'doctor'
      const doctors = await User.find({ role: { $in: ['doctor'] } }, { username: 1, _id: 1, role: 1 }).exec();
      if (!doctors || doctors.length === 0) {
         res.status(StatusCodes.NOT_FOUND).json({
          message: 'No doctors, nurse  found',
          success: false,
        });
      }
  
      // Return the list of doctors
      res.status(StatusCodes.OK).json({
        message: 'Doctors fetched successfully',
        success: true,
        data: doctors,
      });
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error",
        success: false,
      });
    }
  });
export {getcretore, getDoc,getDoctors,fetchPatient, updateOrder ,getOrderById, getpatients, gerdocorder,createOrder,getnurse };  