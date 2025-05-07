import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import Order from '../../models/Order';
import MedicalFinding from '../../models/MedicalFinding';
import Healthinfo from '../../models/healthinfo';
import Appointment from '../../models/appointment';
import Invoice from '../../models/Invoice';
import Card from '../../models/card';
import Credit from '../../models/creadit';
import Orgnazation from '../../models/Orgnazation';
import Prescription from '../../models/prescription';
import MedicalCertificate from '../../models/medicalcerteficate';
import Image from '../../models/image'; // Ensure Image is imported as a Mongoose model

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
  };
}

// Create a new bicycle
const createPatient = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { cardno, firstname, status,age,sex , phoneNumber, Town, KK, HNo,  description } = req.body;
  
  const createdBy = {
    id: req.user?.userId || '', 
    username: req.user?.username || '', 
  };

  const existingPatient = await Patient.findOne({ cardno });
  if (existingPatient) {
    throw new BadRequestError('Patient ID already exists. Please use a unique bicycle ID.');
  }

  const patient = await Patient.create({ cardno, firstname, age,sex ,status, phoneNumber, Town, KK, HNo,  description , createdBy });
  res.status(StatusCodes.CREATED).json({ patient });
});

// Get a single bicycle by ID
const getpatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id :PatientId} = req.params;

  if (!PatientId) {
    throw new BadRequestError('Patient ID is required');
  }

  // Pass the ObjectId directly to findById
  const patient = await Patient.findById({_id: PatientId});
  if (!patient) {
    throw new NotFoundError(`No Patient found with ID: ${PatientId}`);
  }

  res.status(StatusCodes.OK).json({ patient });
});

// Get all bicycles
const getAllpatient = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  const patients = await Patient.find({});
  console.log(patients)
  res.status(StatusCodes.OK).json({ patients , count: patients.length });
});
const getAllRecentPatients = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentPatients = await Patient.find({
    createdAt: { $gte: sixMonthsAgo }
  });

  res.status(StatusCodes.OK).json({
    patients: recentPatients,
    count: recentPatients.length
  });
});


const getoutpatient = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  const patients = await Patient.find({ status: 'Out' })
    .sort({ createdAt: -1 }) // Newest patients first
    .limit(100); // Limit to 100 patients

  res.status(StatusCodes.OK).json({ patients });
});

// Delete a bicycle by ID
const deletepatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id: PatientId } = req.params;

  if (!PatientId) {
    throw new BadRequestError('Patient ID is required');
  }

  const patient = await Patient.findById(PatientId).exec();
  if (!patient) {
    throw new NotFoundError(`No Patient found with ID: ${PatientId}`);
  }

  // Delete associated documents
  const modelsToDelete = [
    { model: Order, ids: patient.Order },
    { model: MedicalFinding, ids: patient.MedicalFinding },
    { model: Healthinfo, ids: patient.Healthinfo },
    { model: Appointment, ids: patient.Appointment },
    { model: Image, ids: patient.Image },
    { model: Invoice, ids: patient.Invoice },
    { model: Card, ids: patient.Card },
    { model: Credit, ids: patient.Credit },
    { model: Orgnazation, ids: patient.Orgnazation },
    { model: Prescription, ids: patient.Prescription },
    { model: MedicalCertificate, ids: patient.MedicalCertificate },
  ];

  for (const entry of modelsToDelete) {
    if (entry.ids && entry.ids.length > 0) {
      await entry.model.deleteMany({ _id: { $in: entry.ids } });
    }
  }

  // Also delete the Age model

  // Finally, delete the patient
  await Patient.findByIdAndDelete(PatientId);

  res.status(StatusCodes.OK).json({ message: 'Patient and all related records deleted successfully' });
});



const updatepatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id: PatientId } = req.params;

  if (!PatientId) {
    throw new BadRequestError('Patient ID is required');
  }

  const updatedpatient = await Patient.findByIdAndUpdate(
    PatientId,
    req.body, // Update with the fields provided in the request body
    {
      new: true, // Return the updated document
      runValidators: true, // Ensure the update adheres to schema validation
    }
  );

  if (!updatedpatient) {
    throw new NotFoundError(`No Patient found with ID: ${PatientId}`);
  }

  res.status(StatusCodes.OK).json({ message: 'Patient updated successfully', Patient: updatedpatient });
});


const searchPatients = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { cardno, name, phoneNumber } = req.query;
console.log(cardno)
  // Check if at least one search parameter is provided
  if (!cardno && !name && !phoneNumber) {
    throw new BadRequestError('Please provide at least one search parameter (cardno, name, or phoneNumber)');
  }

  // Build the search query dynamically based on provided parameters
  const query: any = {};

  if (cardno) {
    query.cardno = { $regex: cardno as string, $options: 'i' };
  }

  if (name) {
    query.$or = [
      { firstname: { $regex: name as string, $options: 'i' } },
      { lastname: { $regex: name as string, $options: 'i' } } // Assuming you have a lastname field
    ];
  }

  if (phoneNumber) {
    query.phoneNumber = { $regex: phoneNumber as string, $options: 'i' };
  }

  const patients = await Patient.find(query);

  if (patients.length === 0) {
    throw new NotFoundError('No patients found matching the search criteria');
  }

  res.status(StatusCodes.OK).json({ 
    success: true,
    count: patients.length,
    data: patients 
  });
});
export { createPatient, getpatient ,updatepatient, getAllpatient,searchPatients, deletepatient ,getoutpatient,getAllRecentPatients};
