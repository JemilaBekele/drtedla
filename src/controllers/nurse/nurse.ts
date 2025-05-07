import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';

import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import { MedicalSheet, NursingProcess, NursingProgressNote } from '../../models/nurse';
import { VitalSign } from '../../models/medical/Vitalsign';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Create Nursing Process Record
const createNursingProcess = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { assessment, diagnosis, planning, intervention, evaluation, scenario } = req.body;

  if (!id) throw new BadRequestError('Patient ID is required');
  const patient = await Patient.findById(id).exec();
  if (!patient) throw new NotFoundError('Patient not found');

  const createdBy = { id: req.user?.userId || '', username: req.user?.username || '' };
  const newRecord = await NursingProcess.create({
    patientId: id,
    assessment, diagnosis, planning, intervention, evaluation, scenario,
    createdBy,
  });

  res.status(StatusCodes.CREATED).json({ message: 'Nursing Process created', success: true, data: newRecord });
});

// Retrieve Nursing Process for a Patient
const getNursingProcess = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new BadRequestError('Patient ID is required');

  const records = await NursingProcess.find({ patientId: id }).sort({ createdAt: -1 }).exec();
  res.status(StatusCodes.OK).json({ message: 'Nursing Process retrieved', success: true, data: records });
});

// Update Nursing Process Record
const updateNursingProcess = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { recordId, ...data } = req.body;
  if (!recordId) throw new BadRequestError('Record ID is required');

  const updatedRecord = await NursingProcess.findByIdAndUpdate(recordId, data, { new: true }).exec();
  if (!updatedRecord) throw new NotFoundError('Record not found');
  const changeHistory = {
    updatedBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
    updateTime: new Date(),
  };

  updatedRecord.changeHistory.push(changeHistory);

  // Update the certificate with the new data (excluding changeHistory)
  updatedRecord.set(data);
 
  // Save the updated certificate
  await updatedRecord.save();
  res.status(StatusCodes.OK).json({ message: 'Nursing Process updated', success: true, data: updatedRecord });
});

// Delete Nursing Process Record
const deleteNursingProcess = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { recordId } = req.body;
  console.log(recordId)
  if (!recordId) throw new BadRequestError('Record ID is required');

  const deletedRecord = await NursingProcess.findByIdAndDelete(recordId).exec();
  if (!deletedRecord) throw new NotFoundError('Record not found');

  res.status(StatusCodes.OK).json({ message: 'Nursing Process deleted', success: true });
});

// Create Nursing Progress Note Record
const createNursingProgressNote = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { progressNote } = req.body;

  if (!id) throw new BadRequestError('Patient ID is required');
  const patient = await Patient.findById(id).exec();
  if (!patient) throw new NotFoundError('Patient not found');

  const createdBy = { id: req.user?.userId || '', username: req.user?.username || '' };
  const newRecord = await NursingProgressNote.create({ patientId: id, progressNote, createdBy });

  res.status(StatusCodes.CREATED).json({ message: 'Nursing Progress Note created', success: true, data: newRecord });
});

// Retrieve Nursing Progress Notes for a Patient
const getNursingProgressNote = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new BadRequestError('Patient ID is required');

  const records = await NursingProgressNote.find({ patientId: id }).sort({ createdAt: -1 }).exec();
  res.status(StatusCodes.OK).json({ message: 'Nursing Progress Notes retrieved', success: true, data: records });
});

// Update Nursing Progress Note Record
const updateNursingProgressNote = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {  ...data } = req.body;
    const { recordId } =  req.params;
    if (!recordId) throw new BadRequestError('Record ID is required');
  
    const updatedRecord = await NursingProgressNote.findByIdAndUpdate(recordId, data, { new: true }).exec();
    if (!updatedRecord) throw new NotFoundError('Record not found');
     const changeHistory = {
      updatedBy: {
        id: req.user?.userId || '',
        username: req.user?.username || '',
      },
      updateTime: new Date(),
    };

    updatedRecord.changeHistory.push(changeHistory);

    // Update the certificate with the new data (excluding changeHistory)
    updatedRecord.set(data);
   
    // Save the updated certificate
    await updatedRecord.save();
    res.status(StatusCodes.OK).json({ message: 'Nursing Progress Note updated', success: true, data: updatedRecord });
  });
  
  // Delete Nursing Progress Note Record
const deleteNursingProgressNote = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } =  req.params;
    console.log(recordId)
    if (!recordId) throw new BadRequestError('Record ID is required');
  
    const deletedRecord = await NursingProgressNote.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) throw new NotFoundError('Record not found');
  
    res.status(StatusCodes.OK).json({ message: 'Nursing Progress Note deleted', success: true });
  });


// Create Medical Sheet Record
const createMedicalSheet = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, medicationProcedure, doseGiven, route, frequency, remark } = req.body;

  if (!id) throw new BadRequestError('Patient ID is required');
  const patient = await Patient.findById(id).exec();
  if (!patient) throw new NotFoundError('Patient not found');

  const createdBy = { id: req.user?.userId || '', username: req.user?.username || '' };
  const newRecord = await MedicalSheet.create({
    patientId: id, name, medicationProcedure, doseGiven, route, frequency, remark, createdBy,
  });

  res.status(StatusCodes.CREATED).json({ message: 'Medical Sheet created', success: true, data: newRecord });
});

// Retrieve Medical Sheets for a Patient
const getMedicalSheet = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new BadRequestError('Patient ID is required');

  const records = await MedicalSheet.find({ patientId: id }).sort({ createdAt: -1 }).exec();
  res.status(StatusCodes.OK).json({ message: 'Medical Sheets retrieved', success: true, data: records });
});


// Update Medical Sheet Record
const updateMedicalSheet = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId, ...data } = req.body;
    if (!recordId) throw new BadRequestError('Record ID is required');
  
    const updatedRecord = await MedicalSheet.findByIdAndUpdate(recordId, data, { new: true }).exec();
    if (!updatedRecord) throw new NotFoundError('Record not found');
    const changeHistory = {
      updatedBy: {
        id: req.user?.userId || '',
        username: req.user?.username || '',
      },
      updateTime: new Date(),
    };
 // Add the new change history entry to the certificate
 updatedRecord.changeHistory.push(changeHistory);

 // Update the certificate with the new data (excluding changeHistory)
 updatedRecord.set(data);

 // Save the updated certificate
 await updatedRecord.save();


    res.status(StatusCodes.OK).json({ message: 'Medical Sheet updated', success: true, data: updatedRecord });
  });
  
  // Delete Medical Sheet Record
const deleteMedicalSheet = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recordId } = req.body;
    if (!recordId) throw new BadRequestError('Record ID is required');
  
    const deletedRecord = await MedicalSheet.findByIdAndDelete(recordId).exec();
    if (!deletedRecord) throw new NotFoundError('Record not found');
  
    res.status(StatusCodes.OK).json({ message: 'Medical Sheet deleted', success: true });
  });
  

  const SIX_MONTHS_AGO = new Date();
  SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);
  
 const getRecentNursingPatients = asyncWrapper(async (req: Request, res: Response) => {
    const nursingProcessPatients = await NursingProcess.find({
      updatedAt: { $gte: SIX_MONTHS_AGO }
    }).distinct('patientId');
  
    const nursingProgressNotePatients = await NursingProgressNote.find({
      updatedAt: { $gte: SIX_MONTHS_AGO }
    }).distinct('patientId');
  
    const medicalSheetPatients = await MedicalSheet.find({
      updatedAt: { $gte: SIX_MONTHS_AGO }
    }).distinct('patientId');
  
    const vitalSignPatients = await VitalSign.find({
      updatedAt: { $gte: SIX_MONTHS_AGO }
    }).distinct('patientId');
  
    // Combine and deduplicate all patient IDs
    const allPatientIds = Array.from(new Set([
      ...nursingProcessPatients,
      ...nursingProgressNotePatients,
      ...medicalSheetPatients,
      ...vitalSignPatients
    ]));
  
    // Fetch patient data
    const patients = await Patient.find({ _id: { $in: allPatientIds } });
  
    res.status(StatusCodes.OK).json({ patients , count: patients.length });
  });
  
  
export { 
  createNursingProcess, getNursingProcess, updateNursingProcess, deleteNursingProcess, 
  createNursingProgressNote, getNursingProgressNote, 
  createMedicalSheet, getMedicalSheet ,updateMedicalSheet , 
  deleteMedicalSheet,deleteNursingProgressNote,updateNursingProgressNote,
  getRecentNursingPatients
};
