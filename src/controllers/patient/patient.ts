import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import User from '../../models/Users';
 // Ensure Image is imported as a Mongoose model



// Create a new bicycle
// Create a new patient
const createPatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { 
    firstname, 
    status, 
    age, 
    sex, 
    phoneNumber, 
    Town, 
    KK, 
    HNo, 
    description,
    isbrace,
    disablity,
    HomePhone,
    Address,
    Email,
    EmergencyContactPhone,
    FinancialResponsible,
    ParentGuardianInfo,
    DOB,
    Woreda,
    Region
  } = req.body;
  
  let createdBy;

  // No logged-in user - randomly select a user with role 'User' from User model
  
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

  // Automatically generate the next card number
  // Find the highest card number
  const lastPatient = await Patient.findOne({})
    .sort({ cardno: -1 })
    .exec();
  
  let finalCardNo;
  if (lastPatient && lastPatient.cardno) {
    // Extract numeric part and increment
    const lastCardNo = lastPatient.cardno;
    const numericPart = parseInt(lastCardNo.replace(/\D/g, '')); // Remove non-numeric characters
    if (!isNaN(numericPart)) {
      const nextNumber = numericPart + 1;
      // Format with leading zeros (e.g., 00001, 00002)
      finalCardNo = nextNumber.toString().padStart(5, '0');
    } else {
      finalCardNo = '00001';
    }
  } else {
    // First patient, start with 00001
    finalCardNo = '00001';
  }

  // Convert DOB to number (timestamp) if provided
  let convertedDOB = null;
  if (DOB) {
    // If DOB is a string date, convert to timestamp
    if (typeof DOB === 'string') {
      const date = new Date(DOB);
      convertedDOB = date.getTime(); // Convert to milliseconds timestamp
    } else if (typeof DOB === 'number') {
      convertedDOB = DOB; // Already a number, use as is
    } else {
      convertedDOB = null;
    }
  }

  // Prepare patient data
  const patientData = {
    cardno: finalCardNo,
    firstname,
    age: age ? parseInt(age) : age, // Convert age to number if provided
    sex,
    status: status || 'active',
    phoneNumber,
    Town,
    KK,
    HNo,
    description,
    createdBy,
    isbrace: isbrace || false,
    disablity: disablity || false,
    HomePhone: HomePhone || '',
    Address: Address || '',
    Email: Email || '',
    EmergencyContactPhone: EmergencyContactPhone || '',
    FinancialResponsible: FinancialResponsible || 'Self',
    ParentGuardianInfo: ParentGuardianInfo || {},
    DOB: convertedDOB,
    Woreda: Woreda || '',
    Region: Region || ''
  };

  const patient = await Patient.create(patientData);
  
  // Remove createdBy from the response
  const patientResponse = patient.toObject();
  delete patientResponse.createdBy;
  
  res.status(StatusCodes.CREATED).json({ 
    success: true, 
    message: 'Patient created successfully',
    patient: patientResponse 
  });
});

// Get a single bicycle by ID
const getpatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id :PatientId} = req.params;

  if (!PatientId) {
    throw new BadRequestError('Patient ID is required');
  }

  // Pass the ObjectId directly to findById
  const patient = await Patient.findById({_id: PatientId}).select(
      '-createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm'
    );
  if (!patient) {
    throw new NotFoundError(`No Patient found with ID: ${PatientId}`);
  }

  res.status(StatusCodes.OK).json({ patient });
});

// Get all bicycles
// Get all patients with pagination
const getAllpatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const patients = await Patient.find({})
    .skip(skip)
    .limit(limit)
.select(
      '-createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm'
    )
    .sort({ createdAt: -1 }); // Sort by newest first

  const totalPatients = await Patient.countDocuments({});
  const totalPages = Math.ceil(totalPatients / limit);

  console.log(`Fetching patients - Page: ${page}, Limit: ${limit}`);
  
  res.status(StatusCodes.OK).json({ 
    patients, 
    count: patients.length,
    total: totalPatients,
    totalPages,
    currentPage: page,
    limit
  });
});

// Update patient
const updatepatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id: PatientId } = req.params;

  if (!PatientId) {
    throw new BadRequestError('Patient ID is required');
  }

  const updatedpatient = await Patient.findByIdAndUpdate(
    PatientId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedpatient) {
    throw new NotFoundError(`No Patient found with ID: ${PatientId}`);
  }

  res.status(StatusCodes.OK).json({ 
    message: 'Patient updated successfully', 
    Patient: updatedpatient 
  });
});

// Search patients with pagination
const searchPatients = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { cardno, name, phoneNumber } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  console.log(cardno);

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
      { lastname: { $regex: name as string, $options: 'i' } }
    ];
  }

  if (phoneNumber) {
    query.phoneNumber = { $regex: phoneNumber as string, $options: 'i' };
  }

  const patients = await Patient.find(query)
    .skip(skip)
    .limit(limit)
.select(
      '-createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm'
    )
    .sort({ createdAt: -1 });

  const totalPatients = await Patient.countDocuments(query);
  const totalPages = Math.ceil(totalPatients / limit);

  if (patients.length === 0) {
    throw new NotFoundError('No patients found matching the search criteria');
  }

  res.status(StatusCodes.OK).json({ 
    success: true,
    count: patients.length,
    total: totalPatients,
    totalPages,
    currentPage: page,
    limit,
    data: patients 
  });
});











export { createPatient, getpatient ,updatepatient, getAllpatient,searchPatients};
