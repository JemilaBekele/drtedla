import express from 'express';
import {    createDisease,
    getAllDiseases,
    getDiseaseById,
    updateDisease,
    deleteDisease,searchDiseases, getDiseaseStatistics,getPatientStatistics} from '../controllers/MedicalFinding/Disease';

const router = express.Router();

// Define routes for Bicycle
router.route('/').post(createDisease).get(getAllDiseases);                 // Create a new bicycle
router.route('/:id').get(getDiseaseById);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deleteDisease);
router.route('/:id').patch(updateDisease); 
router.route('/find/search').get(searchDiseases).post(getDiseaseStatistics)  
router.route('/static/age').post(getPatientStatistics);           // Delete a bicycle by ID

export default router;
