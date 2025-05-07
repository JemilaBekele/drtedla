import express from 'express';
import { createHealthinfo, getHealthinfo , updateHealthinfoRecord, deleteHealthinfoRecord  } from '../controllers/healthinfo/healthinfo'

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createHealthinfo);               // Create a new bicycle
router.route('/:id').get(getHealthinfo);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deleteHealthinfoRecord);
router.route('/:id').patch(updateHealthinfoRecord);           // Delete a bicycle by ID

export default router;
