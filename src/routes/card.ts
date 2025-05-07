import express from 'express';
import { createCard, getCards , updateCard, deleteCard} from '../controllers/card/card';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createCard);               // Create a new bicycle
router.route('/:id').get(getCards);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deleteCard);
router.route('/:id').patch(updateCard);           // Delete a bicycle by ID

export default router;
