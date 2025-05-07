import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import MedicalFinding from '../../models/MedicalFinding';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create a new medical finding
const createMedicalFinding = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // console.log("hi"); // Keep for debugging if needed
  const { id } = req.params; // Patient ID from URL params

  if (!id || !mongoose.Types.ObjectId.isValid(id)) { // Validate ID format
    throw new BadRequestError('Valid Patient ID is required');
  }

  const {
    ChiefCompliance,
    Historypresent,
    Pastmedicalhistory,
    Pastmedicationtaken,
    Assessment,
    Treatment,
    Recommendation,
    GCS,
    consciousness,
    meningealsigns,
    SystemicExamination,
    diseases, // <-- Extract diseases array from body
  } = req.body;

  // Validate patient existence
  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError(`Patient not found with ID: ${id}`);
  }

  // --- Validate and Format Diseases Array ---
  let formattedDiseases: { disease: mongoose.Types.ObjectId }[] = []; // Initialize empty array

  if (Array.isArray(diseases)) {
    formattedDiseases = diseases
      // Filter out items that don't have a valid _id string
      .filter(item => item && typeof item._id === 'string' && mongoose.Types.ObjectId.isValid(item._id))
      // Map to the schema structure { disease: ObjectId }
      .map(item => ({
        disease: new mongoose.Types.ObjectId(item._id) // Convert string ID to ObjectId
      }));
  } else if (diseases != null) {
      // Optional: Handle case where 'diseases' is present but not an array
      console.warn("Received 'diseases' field is not an array:", diseases);
      // Depending on requirements, you might throw an error or ignore it
      // throw new BadRequestError("'diseases' field must be an array.");
  }
  // --- End Disease Formatting ---


  const createdBy = {
    id: req.user?.userId || '', // Make sure userId exists on req.user
    username: req.user?.username || '', // Make sure username exists on req.user
  };

  // Validate createdBy.id format if it's expected to be an ObjectId
  if (!createdBy.id || (req.user?.userId && !mongoose.Types.ObjectId.isValid(req.user.userId))) {
      console.error("Invalid User ID in token:", req.user?.userId);
      throw new BadRequestError('Invalid user identifier in token.');
  }


  // Create a new MedicalFinding
  const newMedicalFinding = new MedicalFinding({
    ChiefCompliance,
    Historypresent,
    Pastmedicalhistory,
    Pastmedicationtaken,
    Assessment,
    Treatment,
    Recommendation,
    GCS,
    consciousness,
    meningealsigns: {
      Neckstiffness: meningealsigns?.Neckstiffness ?? '', // Use nullish coalescing
      Kernigssign: meningealsigns?.Kernigssign ?? '',
      Brudzinskissign: meningealsigns?.Brudzinskissign ?? '',
      Photophobia: meningealsigns?.Photophobia ?? '',
      Headachefevervomiting: meningealsigns?.Headachefevervomiting ?? '', // Keep ?? if empty string is valid default
    },
    SystemicExamination: {
      HEENT: SystemicExamination?.HEENT ?? '',
      LGS: SystemicExamination?.LGS ?? '',
      Chest: SystemicExamination?.Chest ?? '',
      CVS: SystemicExamination?.CVS ?? '',
      Abdomen: SystemicExamination?.Abdomen ?? '',
      GastrointestinalSystem: SystemicExamination?.GastrointestinalSystem ?? '',
      MusculoskeletalSystem: SystemicExamination?.MusculoskeletalSystem ?? '',
      IntegumentarySystem: SystemicExamination?.IntegumentarySystem ?? '',
      CNS: {
        CN: SystemicExamination?.CNS?.CN ?? '',
        Motor: SystemicExamination?.CNS?.Motor ?? '',
        Sensory: SystemicExamination?.CNS?.Sensory ?? '',
        Tone: SystemicExamination?.CNS?.Tone ?? '',
      },
    },
    patientId: { id: patient._id },
    createdBy,
    diseases: formattedDiseases, // <-- Assign the formatted diseases array
    // changeHistory will be empty initially
  });

  const savedFinding = await newMedicalFinding.save();

  // Link the medical finding to the patient (Assuming Patient model has MedicalFinding array)
  // Ensure this field exists and is correctly typed in your Patient model
  if (patient.MedicalFinding && Array.isArray(patient.MedicalFinding)) {
      patient.MedicalFinding.push(savedFinding._id);
      await patient.save();
  } else {
      console.warn(`Patient ${patient._id} does not have a valid MedicalFinding array field.`);
      // Handle this case if necessary (e.g., initialize the array)
      // patient.MedicalFinding = [savedFinding._id];
      // await patient.save();
  }


  res.status(StatusCodes.CREATED).json({
    message: 'Medical finding created successfully',
    success: true,
    data: savedFinding,
  });
});

// Get medical findings for a patient
const getMedicalFindings = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params

  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }

  // Find the patient by ID and populate MedicalFinding
  const patient = await Patient.findById(id)
  .populate({
    path: 'MedicalFinding',
    populate: {
      path: 'diseases.disease',
      model: 'Disease',
    },
  })
  .exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.MedicalFinding || patient.MedicalFinding.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No medical findings available for this patient',
      data: [],
    });
    return;
  }

  // Sort medical findings by `createdAt` in descending order
  const sortedFindings = patient.MedicalFinding.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
console.log(sortedFindings)
  res.status(StatusCodes.OK).json({
    message: 'Medical findings retrieved successfully',
    success: true,
    data: sortedFindings,
  });
});



// Get a specific medical finding
const getMedicalFinding = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { recordId } = req.params;

  if (!recordId) {
    throw new BadRequestError('Medical Finding ID is required');
  }

  const finding = await MedicalFinding.findById(recordId)
    .populate({
      path: 'diseases.disease',
      select: 'disease', // Include disease name and exclude _id
      model: 'Disease'
    }).exec();
console.log(finding)
  if (!finding) {
    throw new NotFoundError('Medical finding not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Medical finding retrieved successfully',
    success: true,
    data: finding,
  });
});

// Update a medical finding
const updateMedicalFinding = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { diseases, ...data } = req.body;
  const { recordId } = req.params;
console.log(diseases)
  if (!recordId) throw new BadRequestError('Finding ID required');

  const updateData: any = { ...data };

  // Handle diseases array conversion to ObjectIds
// Modify the disease handling in updateMedicalFinding:
if (diseases) {
  updateData.diseases = diseases.map((d: any) => ({
    _id: d._id || new mongoose.Types.ObjectId(), // Use existing ID or create new
    disease: new mongoose.Types.ObjectId(d.disease), // Convert disease ID
    diseaseTime: d.diseaseTime || new Date(),
  }));
}

  const updatedFinding = await MedicalFinding.findByIdAndUpdate(
    recordId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!updatedFinding) {
    throw new NotFoundError('Medical finding not found');
  }
  const changeHistory = {
    updatedBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
    updateTime: new Date(),
  };
  // Add the new change history entry to the certificate
  updatedFinding.changeHistory.push(changeHistory);

  // Update the certificate with the new data (excluding changeHistory)
  updatedFinding.set(data);

  // Save the updated certificate
  await updatedFinding.save();
  res.status(StatusCodes.OK).json({
    message: 'Medical finding updated successfully',
    success: true,
    data: updatedFinding,
  });
});

// Delete a medical finding
const deleteMedicalFinding = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { recordId } = req.params;
  console.log(recordId)
    if (!recordId) {
      throw new BadRequestError('Finding ID is required');
    }
  
    // Find and delete the medical finding by ID
    const deletedFinding = await MedicalFinding.findById(recordId);
    if (!deletedFinding) {
      throw new NotFoundError('Medical finding not found');
    }
     // Proceed to delete
     await MedicalFinding.findByIdAndDelete(recordId);
    // Remove the reference from the associated patient
    await Patient.updateOne(
      { MedicalFinding: recordId }, // Locate the patient containing the reference
      { $pull: { MedicalFinding: recordId } } // Remove the reference from the array
    ).exec();
  
    res.status(StatusCodes.OK).json({
      message: 'Medical finding deleted successfully',
      success: true,
    });
  });
  



export { createMedicalFinding, getMedicalFindings,getMedicalFinding,updateMedicalFinding,deleteMedicalFinding };
