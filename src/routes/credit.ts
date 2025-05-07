import express from 'express';
import { createCredit, getCredits, deleteCredit, updateCredit} from '../controllers/credit/credit';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createCredit);               // Create a new bicycle
router.route('/:id').get(getCredits);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deleteCredit);
router.route('/:id').patch(updateCredit);           // Delete a bicycle by ID

export default router;
