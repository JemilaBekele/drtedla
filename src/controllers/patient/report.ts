import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import MedicalFinding from '../../models/MedicalFinding';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';


interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Controller function to get medical findings for a user in the last month
const getMedicalFindingsForUser = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Check if user is authenticated
  const user = req.user;
  if (!user) {
    throw new BadRequestError('User is not authenticated');
  }

  const createdBy = user.userId;

  if (!createdBy) {
    throw new BadRequestError('CreatedBy username is required');
  }

  // Get the date for one month ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // Find medical findings created within the last month
  const recentMedicalFindings = await MedicalFinding.find({
    'createdBy.id': createdBy,
    createdAt: { $gte: oneMonthAgo }
  }).exec();

  if (recentMedicalFindings.length === 0) {
     res.status(StatusCodes.OK).json({
      message: "No recent medical findings available for this user",
      data: [],
    });
  }

  // Extract patient IDs from the findings
  const patientIds = recentMedicalFindings.map((finding) => finding.patientId.id);

  // Find the patients using the IDs from the findings
  const patients = await Patient.find({
    _id: { $in: patientIds }
  }).exec();

  // Combine patient data with their medical findings
  const patientsWithFindings = patients.map((patient) => {
    const findings = recentMedicalFindings.filter(
      (finding) => finding.patientId.id.toString() === patient._id.toString()
    );
    return {
      ...patient.toObject(),
      MedicalFinding: findings,
    };
  });
 console.log(patientsWithFindings)
  // Respond with combined data
  res.status(StatusCodes.OK).json({
    message: 'Patients and medical findings retrieved successfully',
    success: true,
    data: patientsWithFindings,
  });
});



interface PatientQuery {
  firstname?: { $regex: RegExp };
  createdAt?: { $gte: Date; $lte: Date };
}
const patientSearchController = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { firstName, date } = req.body;

  // Validate input
  if (!firstName && !date) {
    throw new BadRequestError('At least one search criteria (firstName or date) is required');
  }

  // Build the query object
  const query: PatientQuery = {};  // Now query is explicitly typed

  if (firstName) {
    query.firstname = { $regex: new RegExp(firstName, 'i') }; // Case-insensitive search
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day

    query.createdAt = { $gte: startDate, $lte: endDate }; // Filter for the entire day
  }

  // Search for patients matching the query
  const patients = await Patient.find(query).exec();

  // Check if no patients found
  if (patients.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No patients found matching the criteria',
      data: [],
    });
    return; // Exit after sending the response
  }

  // Respond with the found patients
  res.status(StatusCodes.OK).json({
    message: 'Patients found successfully',
    success: true,
    data: patients,
  });
});




export  {getMedicalFindingsForUser, patientSearchController};
